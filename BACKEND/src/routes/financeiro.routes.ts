// ARQUIVO: BACKEND/src/routes/financeiro.routes.ts

import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

// --- 1. DASHBOARD (Soma Tudo) ---
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        // A. Busca Faturamento
        const configRes = await pool.query('SELECT faturamento_mensal FROM config_financeiro LIMIT 1');
        const faturamento = Number(configRes.rows[0]?.faturamento_mensal) || 1; 

        // B. Soma Despesas
        const despesasRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas');
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;

        // C. Soma Investimentos
        const investRes = await pool.query('SELECT SUM(valor) as total FROM investimentos');
        const totalInvestimentos = Number(investRes.rows[0]?.total) || 0;

        // D. Calcula Taxa
        const taxaCustoFixo = (totalDespesas / faturamento) * 100;

        res.json({
            faturamento,
            totalDespesas,
            totalInvestimentos,
            taxaCustoFixo
        });

    } catch (err) {
        console.error("Erro no Dashboard Financeiro:", err);
        res.status(500).json({ error: 'Erro ao carregar dados' });
    }
});

// --- 2. EDITAR FATURAMENTO ---
router.put('/config', async (req: Request, res: Response) => {
    const { faturamento } = req.body;
    try {
        const check = await pool.query('SELECT id FROM config_financeiro LIMIT 1');
        if (check.rows.length === 0) {
            await pool.query('INSERT INTO config_financeiro (faturamento_mensal) VALUES ($1)', [faturamento]);
        } else {
            await pool.query('UPDATE config_financeiro SET faturamento_mensal = $1', [faturamento]);
        }
        res.json({ message: 'Atualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar' });
    }
});

// --- 3. CRUD DESPESAS ---
router.get('/despesas', async (req, res) => {
    const result = await pool.query('SELECT * FROM despesas_fixas ORDER BY id DESC');
    res.json(result.rows);
});
router.post('/despesas', async (req, res) => {
    const { nome, valor } = req.body;
    await pool.query('INSERT INTO despesas_fixas (nome, valor) VALUES ($1, $2)', [nome, valor]);
    res.json({ message: 'Salvo' });
});
// NOVO: Rota de Edição
router.put('/despesas/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, valor } = req.body;
    try {
        await pool.query('UPDATE despesas_fixas SET nome=$1, valor=$2 WHERE id=$3', [nome, valor, id]);
        res.json({ message: 'Atualizado' });
    } catch (err) { res.status(500).json({ error: 'Erro ao atualizar despesa' }); }
});
router.delete('/despesas/:id', async (req, res) => {
    await pool.query('DELETE FROM despesas_fixas WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deletado' });
});

// --- 4. CRUD INVESTIMENTOS ---
router.get('/investimentos', async (req, res) => {
    const result = await pool.query('SELECT * FROM investimentos ORDER BY id DESC');
    res.json(result.rows);
});
router.post('/investimentos', async (req, res) => {
    const { nome, valor } = req.body;
    await pool.query('INSERT INTO investimentos (nome, valor) VALUES ($1, $2)', [nome, valor]);
    res.json({ message: 'Salvo' });
});
// NOVO: Rota de Edição
router.put('/investimentos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, valor } = req.body;
    try {
        await pool.query('UPDATE investimentos SET nome=$1, valor=$2 WHERE id=$3', [nome, valor, id]);
        res.json({ message: 'Atualizado' });
    } catch (err) { res.status(500).json({ error: 'Erro ao atualizar investimento' }); }
});
router.delete('/investimentos/:id', async (req, res) => {
    await pool.query('DELETE FROM investimentos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deletado' });
});

export default router;