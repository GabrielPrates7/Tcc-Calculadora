// ARQUIVO: BACKEND/src/routes/financeiro.routes.ts

import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { FaturamentoService } from '../services/faturamentoService';

const router = Router();

// --- 1. DASHBOARD (Cálculos Inteligentes) ---
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        // A. Busca o Faturamento Padrão/Global (Fallback)
        // Mudamos a tabela para 'faturamento_padrao' e a coluna para 'valor'
        const configRes = await pool.query('SELECT valor FROM faturamento_padrao LIMIT 1');
        const faturamento = Number(configRes.rows[0]?.valor) || 1; 

        // B. Soma Despesas ATIVAS
        const despesasRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas WHERE ativo = true');
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;

        // C. Soma Investimentos ATIVOS
        const investRes = await pool.query('SELECT SUM(valor) as total FROM investimentos WHERE ativo = true');
        const totalInvestimentos = Number(investRes.rows[0]?.total) || 0;

        // D. Soma Contas PENDENTES (O que falta pagar no mês)
        const pendentesRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas WHERE pago = false');
        const totalPendente = Number(pendentesRes.rows[0]?.total) || 0;

        // E. Calcula a Taxa (Baseado no faturamento padrão aqui, mas o Front ajusta se tiver mês específico)
        const taxaCustoFixo = (totalDespesas / faturamento) * 100;

        res.json({
            faturamento,
            totalDespesas,
            totalInvestimentos,
            taxaCustoFixo,
            totalPendente
        });

    } catch (err) {
        console.error("Erro no Dashboard Financeiro:", err);
        res.status(500).json({ error: 'Erro ao carregar dados' });
    }
});

// --- 2. EDITAR FATURAMENTO PADRÃO (Configuração Geral) ---
router.put('/config', async (req: Request, res: Response) => {
    const { faturamento } = req.body;
    try {
        // Verifica se já existe configuração na tabela nova 'faturamento_padrao'
        const check = await pool.query('SELECT id FROM faturamento_padrao LIMIT 1');
        
        if (check.rows.length === 0) {
            await pool.query('INSERT INTO faturamento_padrao (valor) VALUES ($1)', [faturamento]);
        } else {
            await pool.query('UPDATE faturamento_padrao SET valor = $1', [faturamento]);
        }
        res.json({ message: 'Atualizado' });
    } catch (err) {
        console.error("Erro ao atualizar config:", err);
        res.status(500).json({ error: 'Erro ao atualizar' });
    }
});

// --- NOVAS ROTAS PARA FATURAMENTO MENSAL (Janeiro, Fevereiro...) ---

// GET: Busca mês específico
router.get('/faturamento/:mes/:ano', async (req: Request, res: Response) => {
    try {
        const { mes, ano } = req.params;
        
        if (isNaN(Number(mes)) || isNaN(Number(ano))) {
             res.status(400).json({ error: 'Mês e Ano devem ser números.' });
             return;
        }

        const valor = await FaturamentoService.obterPorMes(Number(mes), Number(ano));
        res.json({ valor });
    } catch (error) {
        console.error('Erro ao buscar faturamento mensal:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// POST: Salva mês específico
router.post('/faturamento', async (req: Request, res: Response) => {
    try {
        const { mes, ano, valor } = req.body;

        if (!mes || !ano || valor === undefined) {
             res.status(400).json({ error: 'Dados incompletos' });
             return;
        }

        const novoValor = await FaturamentoService.salvar(Number(mes), Number(ano), Number(valor));
        res.json({ valor: novoValor, message: 'Salvo com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar faturamento mensal:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});


// --- 3. CRUD DESPESAS ---
router.get('/despesas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM despesas_fixas ORDER BY data_vencimento ASC, id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
});

router.post('/despesas', async (req, res) => {
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
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar despesa' }); 
    }
});

router.delete('/despesas/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM despesas_fixas WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deletado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar despesa' });
    }
});

// --- 4. CRUD INVESTIMENTOS ---
router.get('/investimentos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM investimentos ORDER BY data_vencimento ASC, id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar investimentos' });
    }
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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar investimento' }); 
    }
});

router.delete('/investimentos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM investimentos WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deletado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar investimento' });
    }
});

export default router;