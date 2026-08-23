import { Router, Request, Response } from 'express';
import { pool as db } from '../services/db';
import { verificarSuperAdmin } from '../middlewares/auth.middleware';

const adminRoutes = Router();

// Todas as rotas administrativas exigem o administrador global do sistema
adminRoutes.use(verificarSuperAdmin);

// Rota 1: Listar todos os usuários pendentes (ativo = false)
adminRoutes.get('/pendentes', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT u.id as usuario_id, u.nome as nome_usuario, u.email, u.criado_em, u.ativo,
                   e.id as empresa_id, e.nome_fantasia as nome_empresa, e.cnpj
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.ativo = false
            ORDER BY u.criado_em DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pendentes:', error);
        res.status(500).json({ error: 'Erro ao buscar cadastros pendentes.' });
    }
});

// Rota 2: Ativar um usuário
adminRoutes.patch('/ativar/:id', async (req: Request, res: Response): Promise<void> => {
    const usuarioId = req.params.id;
    try {
        const query = `UPDATE usuarios SET ativo = true WHERE id = $1 RETURNING id, nome`;
        const result = await db.query(query, [usuarioId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.json({ message: 'Usuário ativado com sucesso!', usuario: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao ativar o usuário.' });
    }
});

// Rota 3: Listar TODOS os usuários cadastrados
adminRoutes.get('/usuarios', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT u.id as usuario_id, u.nome as nome_usuario, u.email, u.criado_em, u.ativo,
                   e.id as empresa_id, e.nome_fantasia as nome_empresa, e.cnpj
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            ORDER BY u.criado_em DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar lista global de usuários.' });
    }
});

// Rota 4: Bloquear um usuário (revogar acesso)
adminRoutes.patch('/bloquear/:id', async (req: Request, res: Response): Promise<void> => {
    const usuarioId = req.params.id;

    // Impede o administrador de revogar o proprio acesso e ficar trancado para fora
    if (Number(usuarioId) === req.usuario!.id) {
        res.status(400).json({ error: 'Não é possível bloquear sua própria conta.' });
        return;
    }

    try {
        const query = `UPDATE usuarios SET ativo = false WHERE id = $1 RETURNING id, nome`;
        const result = await db.query(query, [usuarioId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.json({ message: 'Usuário bloqueado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao bloquear o usuário.' });
    }
});

// ==========================================
// NOVAS ROTAS: FLUXO DE ALTERAÇÃO DE PERFIL
// ==========================================

// Rota 5: Listar solicitações pendentes de alteração
adminRoutes.get('/solicitacoes', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT s.*, e.nome_fantasia as nome_empresa
            FROM solicitacoes_alteracao s
            JOIN empresas e ON s.empresa_id = e.id
            WHERE s.status = 'PENDENTE'
            ORDER BY s.criado_em ASC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar solicitações de alteração.' });
    }
});

// Rota 6: Aprovar uma alteração
adminRoutes.post('/solicitacoes/:id/aprovar', async (req: Request, res: Response): Promise<void> => {
    const solicitacaoId = req.params.id;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Busca os dados da solicitação
        const result = await client.query('SELECT * FROM solicitacoes_alteracao WHERE id = $1 AND status = $2 FOR UPDATE', [solicitacaoId, 'PENDENTE']);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Solicitação não encontrada ou já processada.' });
            return;
        }

        const { usuario_id, empresa_id, dados_novos } = result.rows[0];

        // 1. Atualiza Empresa
        await client.query(
            'UPDATE empresas SET nome_fantasia = $1, cnpj = $2 WHERE id = $3',
            [dados_novos.nome_empresa, dados_novos.cnpj || null, empresa_id]
        );

        // 2. Atualiza Usuário (Aplica a senha se houver, ignora caso contrário)
        if (dados_novos.senha_hash) {
            await client.query(
                'UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3 WHERE id = $4',
                [dados_novos.nome_usuario, dados_novos.email, dados_novos.senha_hash, usuario_id]
            );
        } else {
            await client.query(
                'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3',
                [dados_novos.nome_usuario, dados_novos.email, usuario_id]
            );
        }

        // 3. Atualiza o status da solicitação
        await client.query(
            "UPDATE solicitacoes_alteracao SET status = 'APROVADA', analisado_em = CURRENT_TIMESTAMP WHERE id = $1", 
            [solicitacaoId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Alterações aplicadas com sucesso!' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(error);
        
        if (error.code === '23505') { // Restrição UNIQUE violada durante o UPDATE
            res.status(409).json({ error: 'Conflito: Estes dados já foram registrados por outra empresa/usuário recentemente.' });
            return;
        }
        res.status(500).json({ error: 'Erro interno ao processar a aprovação.' });
    } finally {
        client.release();
    }
});

// Rota 7: Rejeitar uma alteração
adminRoutes.post('/solicitacoes/:id/rejeitar', async (req: Request, res: Response): Promise<void> => {
    const solicitacaoId = req.params.id;
    try {
        const query = `UPDATE solicitacoes_alteracao SET status = 'REJEITADA', analisado_em = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'PENDENTE' RETURNING id`;
        const result = await db.query(query, [solicitacaoId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Solicitação não encontrada ou já processada.' });
            return;
        }
        res.json({ message: 'Solicitação rejeitada e arquivada.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao rejeitar a solicitação.' });
    }
});

export default adminRoutes;