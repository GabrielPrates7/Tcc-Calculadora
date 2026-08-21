import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool as db } from '../services/db';

const authRoutes = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chave_super_secreta_desenvolvimento';

authRoutes.post('/registro', async (req: Request, res: Response): Promise<void> => {
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

authRoutes.post('/login', async (req: Request, res: Response): Promise<void> => {
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

        if (!usuario) {
            res.status(401).json({ error: 'Usuário não encontrado ou credenciais inválidas.' });
            return;
        }

        if (!usuario.ativo) {
            res.status(403).json({ error: 'Conta pendente de aprovação.' });
            return;
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
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
                nome_usuario: usuario.nome, 
                email: usuario.email,
                nome_empresa: usuario.nome_empresa,
                cnpj: usuario.cnpj
            } 
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

export default authRoutes;