import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { FaturamentoService } from '../services/faturamentoService';
import { FinanceiroService, ItemFinanceiroInput } from '../services/financeiro.service';

const router = Router();

// CONSTANTE DE SEGURANÇA: Limite de 9 Trilhões (Compatível com NUMERIC(15,2))
const MAX_VALOR_PERMITIDO = 9999999999999.99;

// ==========================================
// 1. DASHBOARD
// ==========================================
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
    try {
        const fatRes = await pool.query('SELECT mes, ano, valor FROM faturamentos_mensais ORDER BY ano DESC, mes DESC LIMIT 1');
        const faturamentoData = fatRes.rows[0];
        const faturamento = Number(faturamentoData?.valor) || 0;
        
        const mesFiltro = faturamentoData?.mes || new Date().getMonth() + 1;
        const anoFiltro = faturamentoData?.ano || new Date().getFullYear();

        const despesasRes = await pool.query(`
            SELECT SUM(valor) as total 
            FROM despesas_fixas 
            WHERE ativo = true 
            AND EXTRACT(MONTH FROM data_vencimento) = $1 
            AND EXTRACT(YEAR FROM data_vencimento) = $2
        `, [mesFiltro, anoFiltro]);
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;

        const investRes = await pool.query(`
            SELECT SUM(valor) as total 
            FROM investimentos 
            WHERE ativo = true
            AND EXTRACT(MONTH FROM data_vencimento) = $1 
            AND EXTRACT(YEAR FROM data_vencimento) = $2
        `, [mesFiltro, anoFiltro]);
        const totalInvestimentos = Number(investRes.rows[0]?.total) || 0;

        const taxaCustoFixo = faturamento > 0 ? (totalDespesas / faturamento) * 100 : 0;

        res.json({ faturamento, totalDespesas, totalInvestimentos, taxaCustoFixo });
    } catch (err) {
        console.error("Erro no dashboard:", err);
        res.status(500).json({ error: 'Erro interno ao processar dashboard' });
    }
});

// ==========================================
// 2. FATURAMENTO
// ==========================================
router.post('/faturamento/soma', async (req: Request, res: Response): Promise<void> => {
    try {
        const { meses, ano } = req.body;
        if (!meses || !ano) {
            res.json({ valor: 0 });
            return;
        }
        const total = await FaturamentoService.somarPorMeses(meses, Number(ano));
        res.json({ valor: total });
    } catch (error) {
        console.error("Erro soma:", error);
        res.status(500).json({ error: 'Erro ao somar faturamentos' });
    }
});

router.get('/faturamento/:mes/:ano', async (req: Request, res: Response): Promise<void> => {
    try {
        const { mes, ano } = req.params;
        const valor = await FaturamentoService.obterPorMes(Number(mes), Number(ano));
        res.json({ valor });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar faturamento' });
    }
});

router.post('/faturamento', async (req: Request, res: Response): Promise<void> => {
    try {
        const { mes, ano, valor } = req.body;
        
        // VALIDAÇÃO DE SEGURANÇA
        if (Number(valor) > MAX_VALOR_PERMITIDO) {
            res.status(400).json({ error: 'Faturamento excede o limite numérico permitido.' });
            return;
        }

        const novoValor = await FaturamentoService.salvar(Number(mes), Number(ano), Number(valor));
        res.status(201).json({ valor: novoValor });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar faturamento' });
    }
});

// ==========================================
// 3. DESPESAS FIXAS
// ==========================================
router.get('/despesas', async (req: Request, res: Response): Promise<void> => {
    try {
        const despesas = await FinanceiroService.listarDespesas();
        res.json(despesas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar despesas' });
    }
});

router.post('/despesas', async (req: Request, res: Response): Promise<void> => {
    try {
        const dados: ItemFinanceiroInput = req.body;
        
        // VALIDAÇÃO DE SEGURANÇA
        if (Number(dados.valor) > MAX_VALOR_PERMITIDO) {
            res.status(400).json({ error: 'Valor da despesa excede o limite numérico.' });
            return;
        }

        await FinanceiroService.salvarDespesa(dados);
        res.status(201).json({ message: 'Despesa salva com sucesso' });
    } catch (error) {
        console.error("Erro backend (Salvar Despesa):", error);
        res.status(500).json({ error: 'Erro ao salvar despesa' });
    }
});

router.put('/despesas/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const dados: ItemFinanceiroInput = req.body;

        // VALIDAÇÃO DE SEGURANÇA
        if (Number(dados.valor) > MAX_VALOR_PERMITIDO) {
            res.status(400).json({ error: 'Valor da despesa excede o limite numérico.' });
            return;
        }

        await FinanceiroService.atualizarDespesa(id, dados);
        res.json({ message: 'Despesa atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar despesa' });
    }
});

router.delete('/despesas/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        await FinanceiroService.deletarDespesa(id);
        res.json({ message: 'Despesa deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar despesa' });
    }
});

// ==========================================
// 4. INVESTIMENTOS
// ==========================================
router.get('/investimentos', async (req: Request, res: Response): Promise<void> => {
    try {
        const investimentos = await FinanceiroService.listarInvestimentos();
        res.json(investimentos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar investimentos' });
    }
});

router.post('/investimentos', async (req: Request, res: Response): Promise<void> => {
    try {
        const dados: ItemFinanceiroInput = req.body;

        // VALIDAÇÃO DE SEGURANÇA
        if (Number(dados.valor) > MAX_VALOR_PERMITIDO) {
            res.status(400).json({ error: 'Valor do investimento excede o limite numérico.' });
            return;
        }

        await FinanceiroService.salvarInvestimento(dados);
        res.status(201).json({ message: 'Investimento salvo com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar investimento' });
    }
});

router.put('/investimentos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const dados: ItemFinanceiroInput = req.body;

        // VALIDAÇÃO DE SEGURANÇA
        if (Number(dados.valor) > MAX_VALOR_PERMITIDO) {
            res.status(400).json({ error: 'Valor do investimento excede o limite numérico.' });
            return;
        }

        await FinanceiroService.atualizarInvestimento(id, dados);
        res.json({ message: 'Investimento atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar investimento' });
    }
});

router.delete('/investimentos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        await FinanceiroService.deletarInvestimento(id);
        res.json({ message: 'Investimento deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar investimento' });
    }
});

// ==========================================
// 5. SNAPSHOTS (HISTÓRICO)
// ==========================================
router.post('/snapshots', async (req: Request, res: Response): Promise<void> => {
    const descricao = req.body.descricao || 'Checkpoint Manual';
    const faturamento = req.body.faturamento ?? 0;
    const totalDespesas = req.body.total_despesas ?? req.body.totalDespesas ?? 0;
    const totalInvestimentos = req.body.total_investimentos ?? req.body.totalInvestimentos ?? 0;
    const taxaCustoFixo = req.body.taxa_custo_fixo ?? req.body.taxaCustoFixo ?? 0;

    const dadosBackup = req.body.dados_backup ?? req.body.dadosBackup ?? { despesas: [], investimentos: [] };

    try {
        await pool.query(
            `INSERT INTO snapshots_financeiros 
            (descricao, faturamento, total_despesas, total_investimentos, taxa_custo_fixo, dados_backup) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [descricao, faturamento, totalDespesas, totalInvestimentos, taxaCustoFixo, JSON.stringify(dadosBackup)]
        );
        res.status(201).json({ message: 'Snapshot salvo com sucesso!' });
    } catch (err) {
        console.error("Erro ao salvar snapshot:", err);
        res.status(500).json({ error: 'Erro ao salvar histórico' });
    }
});

router.get('/snapshots', async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(`SELECT id, criado_em, descricao, faturamento, total_despesas, taxa_custo_fixo FROM snapshots_financeiros ORDER BY criado_em DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

router.get('/snapshots/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await pool.query('SELECT * FROM snapshots_financeiros WHERE id = $1', [id]);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];

            let backupParsed = { despesas: [], investimentos: [] };
            
            if (row.dados_backup) {
                if (typeof row.dados_backup === 'string') {
                    try {
                        backupParsed = JSON.parse(row.dados_backup);
                    } catch (e) {
                        console.error("Erro no Parse do JSON do banco:", e);
                    }
                } else {
                    backupParsed = row.dados_backup;
                }
            }
            row.dados_backup = backupParsed;

            res.json(row);
        } else {
            res.status(404).json({ error: 'Snapshot não encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar detalhes' });
    }
});

router.delete('/snapshots/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        await pool.query('DELETE FROM snapshots_financeiros WHERE id = $1', [id]);
        res.json({ message: 'Deletado com sucesso' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar' });
    }
});

export const financeiroRoutes = router;