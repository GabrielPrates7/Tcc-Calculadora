import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool as db } from '../services/db';
import { loginLimiter, registroLimiter, esqueciSenhaLimiter } from '../middlewares/rateLimit.middleware';

const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Resposta única para qualquer falha de login — senha errada, usuário
 * inexistente ou conta inativa. Mensagens distintas permitiriam descobrir
 * quais contas existem no sistema antes de tentar a força bruta.
 */
const ERRO_LOGIN_GENERICO = 'Credenciais inválidas ou conta indisponível.';

/**
 * Hash descartável usado quando o usuário não existe. Sem ele, a resposta
 * voltaria de imediato (sem passar pelo bcrypt), e a diferença de tempo
 * revelaria a existência da conta mesmo com a mensagem unificada.
 */
const HASH_DUMMY = bcrypt.hashSync('conta-inexistente-comparacao-de-tempo', 10);

authRoutes.post('/registro', registroLimiter, async (req: Request, res: Response): Promise<void> => {
    const { nome_empresa, cnpj, nome_usuario, email, senha } = req.body;
    const client = await db.connect();

    try {
        // 1. Verificações de Duplicidade (Bloqueio prévio)
        if (cnpj) {
            const cnpjExistente = await client.query('SELECT id FROM empresas WHERE cnpj = $1', [cnpj]);
            if (cnpjExistente.rowCount && cnpjExistente.rowCount > 0) {
                res.status(409).json({ error: 'Este CNPJ já está cadastrado no sistema.' });
                return;
            }
        }

        const emailExistente = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (emailExistente.rowCount && emailExistente.rowCount > 0) {
            res.status(409).json({ error: 'Este E-mail já está em uso.' });
            return;
        }

        const usuarioExistente = await client.query('SELECT id FROM usuarios WHERE nome = $1', [nome_usuario]);
        if (usuarioExistente.rowCount && usuarioExistente.rowCount > 0) {
            res.status(409).json({ error: 'Este Nome de Usuário já está em uso.' });
            return;
        }

        // 2. Início da Inserção Segura
        await client.query('BEGIN');
        
        const empresaQuery = `INSERT INTO empresas (nome_fantasia, cnpj) VALUES ($1, $2) RETURNING id`;
        const empresaResult = await client.query(empresaQuery, [nome_empresa, cnpj || null]);
        const novaEmpresaId = empresaResult.rows[0].id;

        const hashSenha = await bcrypt.hash(senha, 10);
        const usuarioQuery = `
            INSERT INTO usuarios (empresa_id, nome, email, senha_hash, ativo) 
            VALUES ($1, $2, $3, $4, false) RETURNING id`;
        
        await client.query(usuarioQuery, [novaEmpresaId, nome_usuario, email, hashSenha]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Cadastro realizado. Aguarde a aprovação do administrador.' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar cadastro.' });
    } finally {
        client.release();
    }
});

authRoutes.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
    // 1. Modificado para aceitar 'credencial' (pode ser o nome de usuário ou o email)
    const { credencial, senha } = req.body;

    if (!credencial || !senha) {
        res.status(400).json({ error: 'Credencial e senha são obrigatórias.' });
        return;
    }

    try {
        // 2. Busca por E-mail OU Nome de Usuário e faz o JOIN para trazer os dados da Empresa
        const query = `
            SELECT 
                u.*, 
                e.nome_fantasia AS nome_empresa, 
                e.cnpj 
            FROM usuarios u
            INNER JOIN empresas e ON u.empresa_id = e.id
            WHERE u.nome = $1 OR u.email = $1
        `;
        const result = await db.query(query, [credencial]);
        const usuario = result.rows[0];

        // O bcrypt roda sempre, mesmo sem usuário, para que o tempo de resposta
        // não denuncie se a conta existe.
        const senhaValida = usuario
            ? await bcrypt.compare(senha, usuario.senha_hash)
            : await bcrypt.compare(senha, HASH_DUMMY);

        // Conta inexistente, senha errada e conta inativa devolvem exatamente a
        // mesma resposta — ver ERRO_LOGIN_GENERICO.
        if (!usuario || !senhaValida || !usuario.ativo) {
            res.status(401).json({ error: ERRO_LOGIN_GENERICO });
            return;
        }

        const token = jwt.sign(
            { id: usuario.id, empresa_id: usuario.empresa_id },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 3. O payload devolvido agora reflete a necessidade real do frontend
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome_usuario: usuario.nome,
                email: usuario.email,
                nome_empresa: usuario.nome_empresa,
                cnpj: usuario.cnpj,
                super_admin: usuario.super_admin === true
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

/**
 * "Esqueci minha senha" — rota pública, sem verificarToken (é justamente
 * para quem não consegue mais logar). Aceita email, nome de usuário ou CNPJ
 * da empresa como identificador.
 *
 * Mesma lógica anti-enumeração do login: uma única consulta cobre os dois
 * casos (encontrou / não encontrou), sem branch que faça trabalho extra só
 * num dos caminhos, e a resposta é sempre a mesma 200 com a mesma mensagem —
 * para o tempo de resposta e o corpo da resposta nunca denunciarem se aquele
 * identificador existe no sistema. A linha em solicitacoes_recuperacao_senha
 * é inserida nos dois casos; usuario_id só vem preenchido quando há match.
 */
authRoutes.post('/esqueci-senha', esqueciSenhaLimiter, async (req: Request, res: Response): Promise<void> => {
    const identificador = typeof req.body.identificador === 'string' ? req.body.identificador.trim() : '';

    if (!identificador) {
        res.status(400).json({ error: 'Informe seu e-mail, usuário ou CNPJ.' });
        return;
    }

    const MENSAGEM_GENERICA = 'Se encontrarmos uma conta correspondente, a solicitação será analisada em breve.';

    try {
        const busca = await db.query(
            `SELECT u.id
             FROM usuarios u
             JOIN empresas e ON u.empresa_id = e.id
             WHERE u.email = $1 OR u.nome = $1 OR e.cnpj = $1
             LIMIT 1`,
            [identificador]
        );

        const usuarioId = busca.rows[0]?.id ?? null;

        await db.query(
            'INSERT INTO solicitacoes_recuperacao_senha (identificador_informado, usuario_id) VALUES ($1, $2)',
            [identificador, usuarioId]
        );

        res.status(200).json({ message: MENSAGEM_GENERICA });
    } catch (error) {
        console.error('Erro ao processar solicitação de recuperação de senha:', error);
        // Mesma mensagem genérica mesmo em erro interno — não é o momento de
        // vazar detalhes, e evita que um erro vire um outro sinal distinguível.
        res.status(200).json({ message: MENSAGEM_GENERICA });
    }
});

export default authRoutes;