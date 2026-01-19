// ARQUIVO: BACKEND/src/routes/financeiro.routes.ts

import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

// --- 1. DASHBOARD (Soma Inteligente) ---
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        // A. Busca Faturamento (Mantido igual)
        const configRes = await pool.query('SELECT faturamento_mensal FROM config_financeiro LIMIT 1');
        const faturamento = Number(configRes.rows[0]?.faturamento_mensal) || 1; 

        // B. Soma Despesas ATIVAS (Para o cálculo da taxa)
        // OBS: Só somamos na taxa o que está ATIVO. O que foi cancelado não pesa no preço.
        const despesasRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas WHERE ativo = true');
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;

        // C. Soma Investimentos ATIVOS
        const investRes = await pool.query('SELECT SUM(valor) as total FROM investimentos WHERE ativo = true');
        const totalInvestimentos = Number(investRes.rows[0]?.total) || 0;

        // D. Soma Contas PENDENTES (O que falta pagar neste mês)
        // Aqui somamos independente de estar ativo ou não, pois se gerou boleto, tem que pagar.
        // Mas geralmente filtramos ativos também. Vamos assumir: Se existe e não foi pago, soma.
        const pendentesRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas WHERE pago = false');
        const totalPendente = Number(pendentesRes.rows[0]?.total) || 0;

        // E. Calcula Taxa (Baseada apenas nos ativos)
        const taxaCustoFixo = (totalDespesas / faturamento) * 100;

        res.json({
            faturamento,
            totalDespesas,
            totalInvestimentos,
            taxaCustoFixo,
            totalPendente // Novo campo para o Front
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

// --- 3. CRUD DESPESAS (Com novos campos) ---
router.get('/despesas', async (req, res) => {
    // Trazemos tudo (ativos e inativos) para o histórico da lista
    const result = await pool.query('SELECT * FROM despesas_fixas ORDER BY data_vencimento ASC, id DESC');
    res.json(result.rows);
});

router.post('/despesas', async (req, res) => {
    // Recebendo os novos campos
    const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body;
    
    try {
        await pool.query(
            `INSERT INTO despesas_fixas 
            (nome, valor, ativo, pago, beneficiario, data_vencimento) 
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [nome, valor, ativo ?? true, pago ?? false, beneficiario, data_vencimento]
        );
        res.json({ message: 'Salvo' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar despesa' });
    }
});

router.put('/despesas/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body;
    
    try {
        await pool.query(
            `UPDATE despesas_fixas 
            SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 
            WHERE id=$7`, 
            [nome, valor, ativo, pago, beneficiario, data_vencimento, id]
        );
        res.json({ message: 'Atualizado' });
    } catch (err) { 
        res.status(500).json({ error: 'Erro ao atualizar despesa' }); 
    }
});

router.delete('/despesas/:id', async (req, res) => {
    await pool.query('DELETE FROM despesas_fixas WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deletado' });
});

// --- 4. CRUD INVESTIMENTOS (Com novos campos) ---
router.get('/investimentos', async (req, res) => {
    const result = await pool.query('SELECT * FROM investimentos ORDER BY data_vencimento ASC, id DESC');
    res.json(result.rows);
});

router.post('/investimentos', async (req, res) => {
    const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body;
    try {
        await pool.query(
            `INSERT INTO investimentos 
            (nome, valor, ativo, pago, beneficiario, data_vencimento) 
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [nome, valor, ativo ?? true, pago ?? false, beneficiario, data_vencimento]
        );
        res.json({ message: 'Salvo' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar investimento' });
    }
});

router.put('/investimentos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body;
    try {
        await pool.query(
            `UPDATE investimentos 
            SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 
            WHERE id=$7`, 
            [nome, valor, ativo, pago, beneficiario, data_vencimento, id]
        );
        res.json({ message: 'Atualizado' });
    } catch (err) { 
        res.status(500).json({ error: 'Erro ao atualizar investimento' }); 
    }
});

router.delete('/investimentos/:id', async (req, res) => {
    await pool.query('DELETE FROM investimentos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deletado' });
});

export default router;