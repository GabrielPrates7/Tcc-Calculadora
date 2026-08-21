import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool as db } from '../services/db';
import { verificarToken } from '../middlewares/auth.middleware';

const perfilRoutes = Router();

// Protege as rotas e injeta o req.usuario
perfilRoutes.use(verificarToken);

// NOVA ROTA: Busca os dados reais e atualizados do banco de dados
perfilRoutes.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const usuarioId = req.usuario!.id;

        const result = await db.query(`
            SELECT u.nome, u.email, e.nome_fantasia, e.cnpj 
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.id = $1
        `, [usuarioId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Perfil não encontrado.' });
            return;
        }

        const dados = result.rows[0];
        res.json({
            nome_empresa: dados.nome_fantasia,
            cnpj: dados.cnpj,
            nome_usuario: dados.nome,
            email: dados.email
        });
    } catch (error) {
        console.error('Erro ao buscar perfil atualizado:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do perfil.' });
    }
});

// ROTA REFATORADA: Solicitar Alteração
perfilRoutes.post('/solicitar-alteracao', async (req: Request, res: Response): Promise<void> => {
    try {
        const usuarioId = req.usuario!.id;
        const empresaId = req.usuario!.empresa_id;

        const { nomeEmpresa, cnpj, nomeUsuario, email, senhaAntiga, novaSenha } = req.body;

        const resultAtual = await db.query(`
            SELECT u.nome, u.email, u.senha_hash, e.cnpj, e.nome_fantasia 
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.id = $1
        `, [usuarioId]);
        
        const dadosAtuais = resultAtual.rows[0];

        // Verificações de Duplicidade
        if (cnpj && cnpj !== dadosAtuais.cnpj) {
            const checkCnpj = await db.query('SELECT id FROM empresas WHERE cnpj = $1 AND id != $2', [cnpj, empresaId]);
            if (checkCnpj.rowCount && checkCnpj.rowCount > 0) {
                res.status(409).json({ error: 'Este CNPJ já pertence a outra empresa.' });
                return;
            }
        }

        if (email && email !== dadosAtuais.email) {
            const checkEmail = await db.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, usuarioId]);
            if (checkEmail.rowCount && checkEmail.rowCount > 0) {
                res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
                return;
            }
        }

        if (nomeUsuario && nomeUsuario !== dadosAtuais.nome) {
            const checkNome = await db.query('SELECT id FROM usuarios WHERE nome = $1 AND id != $2', [nomeUsuario, usuarioId]);
            if (checkNome.rowCount && checkNome.rowCount > 0) {
                res.status(409).json({ error: 'Este Nome de Usuário já está em uso.' });
                return;
            }
        }

        let hashNovaSenha = null;
        if (novaSenha) {
            if (!senhaAntiga) {
                res.status(400).json({ error: 'A senha atual é obrigatória para registrar uma nova senha.' });
                return;
            }
            const senhaValida = await bcrypt.compare(senhaAntiga, dadosAtuais.senha_hash);
            if (!senhaValida) {
                res.status(401).json({ error: 'A senha atual está incorreta.' });
                return;
            }
            hashNovaSenha = await bcrypt.hash(novaSenha, 10);
        }

        const payloadNovosDados = {
            nome_empresa: nomeEmpresa,
            cnpj: cnpj,
            nome_usuario: nomeUsuario,
            email: email,
            senha_hash: hashNovaSenha
        };

        const payloadDadosAntigos = {
            nome_empresa: dadosAtuais.nome_fantasia,
            cnpj: dadosAtuais.cnpj,
            nome_usuario: dadosAtuais.nome,
            email: dadosAtuais.email
        };

        await db.query(`
            INSERT INTO solicitacoes_alteracao (usuario_id, empresa_id, tipo_alteracao, dados_antigos, dados_novos, status)
            VALUES ($1, $2, 'PERFIL_CONTA', $3, $4, 'PENDENTE')
        `, [usuarioId, empresaId, JSON.stringify(payloadDadosAntigos), JSON.stringify(payloadNovosDados)]);

        res.status(201).json({ message: 'Solicitação enviada ao Administrador com sucesso.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
    }
});

export default perfilRoutes;