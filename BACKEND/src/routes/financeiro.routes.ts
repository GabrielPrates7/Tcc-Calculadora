import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { FaturamentoService } from '../services/faturamentoService';

const router = Router();

// --- 1. DASHBOARD ---
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        // Faturamento Padrão não existe mais. Retornamos 0 ou deixamos o Front calcular.
        // O Front agora vai buscar o faturamento específico, então aqui mandamos 0.
        const faturamento = 0; 

        const despesasRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas WHERE ativo = true');
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;

        const investRes = await pool.query('SELECT SUM(valor) as total FROM investimentos WHERE ativo = true');
        const totalInvestimentos = Number(investRes.rows[0]?.total) || 0;

        // Taxa global agora é irrelevante aqui, o front calcula por período.
        const taxaCustoFixo = 0; 

        res.json({ faturamento, totalDespesas, totalInvestimentos, taxaCustoFixo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no dashboard' });
    }
});

// --- 2. FATURAMENTO (Lógica Nova) ---

// POST: Busca a SOMA de um período (NOVO)
// Recebe: { meses: [1, 2, 3], ano: 2026 }
router.post('/faturamento/soma', async (req: Request, res: Response) => {
    try {
        const { meses, ano } = req.body;
        if (!meses || !ano) return res.json({ valor: 0 }); // Retorna 0 se faltar dados

        const total = await FaturamentoService.somarPorMeses(meses, Number(ano));
        res.json({ valor: total });
    } catch (error) {
        console.error("Erro soma:", error);
        res.status(500).json({ error: 'Erro ao somar' });
    }
});

// GET: Busca mês único
router.get('/faturamento/:mes/:ano', async (req: Request, res: Response) => {
    try {
        const { mes, ano } = req.params;
        const valor = await FaturamentoService.obterPorMes(Number(mes), Number(ano));
        res.json({ valor });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar' });
    }
});

// POST: Salva mês único
router.post('/faturamento', async (req: Request, res: Response) => {
    try {
        const { mes, ano, valor } = req.body;
        const novoValor = await FaturamentoService.salvar(Number(mes), Number(ano), Number(valor));
        res.json({ valor: novoValor });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// ... (Mantenha as rotas de DESPESAS e INVESTIMENTOS iguais) ...
// (Só copiei a parte do faturamento para economizar espaço, o resto não muda)
// MANTENHA AS ROTAS CRUD DESPESAS/INVESTIMENTOS AQUI EMBAIXO IGUAL ANTES
router.get('/despesas', async (req, res) => { const result = await pool.query('SELECT * FROM despesas_fixas ORDER BY data_vencimento ASC, id DESC'); res.json(result.rows); });
router.post('/despesas', async (req, res) => { const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body; await pool.query(`INSERT INTO despesas_fixas (nome, valor, ativo, pago, beneficiario, data_vencimento) VALUES ($1, $2, $3, $4, $5, $6)`, [nome, valor, ativo ?? true, pago ?? false, beneficiario, data_vencimento]); res.json({ message: 'Salvo' }); });
router.put('/despesas/:id', async (req, res) => { const { id } = req.params; const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body; await pool.query(`UPDATE despesas_fixas SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 WHERE id=$7`, [nome, valor, ativo, pago, beneficiario, data_vencimento, id]); res.json({ message: 'Atualizado' }); });
router.delete('/despesas/:id', async (req, res) => { await pool.query('DELETE FROM despesas_fixas WHERE id = $1', [req.params.id]); res.json({ message: 'Deletado' }); });
router.get('/investimentos', async (req, res) => { const result = await pool.query('SELECT * FROM investimentos ORDER BY data_vencimento ASC, id DESC'); res.json(result.rows); });
router.post('/investimentos', async (req, res) => { const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body; await pool.query(`INSERT INTO investimentos (nome, valor, ativo, pago, beneficiario, data_vencimento) VALUES ($1, $2, $3, $4, $5, $6)`, [nome, valor, ativo ?? true, pago ?? false, beneficiario, data_vencimento]); res.json({ message: 'Salvo' }); });
router.put('/investimentos/:id', async (req, res) => { const { id } = req.params; const { nome, valor, ativo, pago, beneficiario, data_vencimento } = req.body; await pool.query(`UPDATE investimentos SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 WHERE id=$7`, [nome, valor, ativo, pago, beneficiario, data_vencimento, id]); res.json({ message: 'Atualizado' }); });
router.delete('/investimentos/:id', async (req, res) => { await pool.query('DELETE FROM investimentos WHERE id = $1', [req.params.id]); res.json({ message: 'Deletado' }); });

router.post('/snapshots', async (req: Request, res: Response) => {
    const { 
        descricao, 
        faturamento, 
        totalDespesas, 
        totalInvestimentos, 
        taxaCustoFixo, 
        dadosBackup // Recebe o objeto { despesas: [], investimentos: [] }
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO snapshots_financeiros 
            (descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                descricao || 'Checkpoint Manual',
                faturamento,
                totalDespesas,
                totalInvestimentos,
                taxaCustoFixo,
                JSON.stringify(dadosBackup) // Salva o JSON no banco
            ]
        );
        res.json({ message: 'Snapshot salvo com sucesso!' });
    } catch (err) {
        console.error("Erro ao salvar snapshot:", err);
        res.status(500).json({ error: 'Erro ao salvar histórico' });
    }
});

// LISTAR CHECKPOINTS
router.get('/snapshots', async (req: Request, res: Response) => {
    try {
        // Busca apenas o resumo (sem o JSON pesado) para a lista
        const result = await pool.query(
            `SELECT id, criado_em, descricao, faturamento, total_despesas, taxa_custo_fixo 
             FROM snapshots_financeiros 
             ORDER BY criado_em DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

// RECUPERAR UM CHECKPOINT COMPLETO (Para gerar PDF)
router.get('/snapshots/:id', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM snapshots_financeiros WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Snapshot não encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar detalhes' });
    }
});
router.delete('/snapshots/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM snapshots_financeiros WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deletado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar' });
    }
});

export default router;