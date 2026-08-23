import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../services/db';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface TokenPayload {
    id: number;
    empresa_id: number;
    iat: number;
    exp: number;
}

export const verificarToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido.' });
        return;
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        
        // Injeta os dados do usuário na requisição para uso nos controllers/services
        req.usuario = {
            id: decoded.id,
            empresa_id: decoded.empresa_id
        };
        
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

/**
 * Restringe o acesso ao administrador global do sistema.
 * Valida o JWT e, diferente de verificarToken, confirma no banco que aquele
 * id realmente tem super_admin = true — a flag nunca vem do token, para que
 * revogar o privilégio no banco tenha efeito imediato.
 */
export const verificarSuperAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido.' });
        return;
    }

    const [, token] = authHeader.split(' ');

    let decoded: TokenPayload;
    try {
        decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
        return;
    }

    try {
        const resultado = await pool.query('SELECT super_admin FROM usuarios WHERE id = $1', [decoded.id]);

        if (resultado.rowCount === 0 || resultado.rows[0].super_admin !== true) {
            res.status(403).json({ error: 'Acesso restrito ao administrador do sistema.' });
            return;
        }

        req.usuario = {
            id: decoded.id,
            empresa_id: decoded.empresa_id
        };

        next();
    } catch (err) {
        console.error('Erro ao validar super admin:', err);
        res.status(500).json({ error: 'Erro interno ao validar permissões.' });
    }
};