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
        await client.query('BEGIN');
        
        // 1. Cria a empresa
        const empresaQuery = `INSERT INTO empresas (nome_fantasia, cnpj) VALUES ($1, $2) RETURNING id`;
        const empresaResult = await client.query(empresaQuery, [nome_empresa, cnpj || null]);
        const novaEmpresaId = empresaResult.rows[0].id;

        // 2. Cria o usuário com ativo = false
        const hashSenha = await bcrypt.hash(senha, 10);
        const usuarioQuery = `
            INSERT INTO usuarios (empresa_id, nome, email, senha_hash, ativo) 
            VALUES ($1, $2, $3, $4, false) RETURNING id`;
        await client.query(usuarioQuery, [novaEmpresaId, nome_usuario, email, hashSenha]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Cadastro realizado. Aguarde a aprovação do administrador.' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Erro ao realizar cadastro.' });
    } finally {
        client.release();
    }
});

authRoutes.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { email, senha } = req.body;

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = result.rows[0];

        if (!usuario) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
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

        res.json({ token, usuario: { nome: usuario.nome, email: usuario.email } });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

export default authRoutes;