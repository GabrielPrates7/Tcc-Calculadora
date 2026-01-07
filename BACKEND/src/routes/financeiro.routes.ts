import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

interface ItemFinanceiroBody {
    nome: string;
    valor: string | number;
}

// ==========================================
// 1. FATURAMENTO
// ==========================================

router.get('/faturamento', async (req: Request, res: Response) => {
    try {
        const resultado = await pool.query('SELECT * FROM faturamento ORDER BY id ASC LIMIT 1');
        const faturamento = resultado.rows.length > 0 ? resultado.rows[0] : { valor_mensal: 0 };
        res.json(faturamento);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar faturamento');
    }
});

router.put('/faturamento', async (req: Request, res: Response) => {
    const { valor } = req.body;
    try {
        const check = await pool.query('SELECT * FROM faturamento WHERE id = 1');
        if (check.rows.length === 0) {
            await pool.query('INSERT INTO faturamento (id, valor_mensal) VALUES (1, $1)', [valor]);
        } else {
            await pool.query('UPDATE faturamento SET valor_mensal = $1 WHERE id = 1', [valor]);
        }
        res.json({ message: 'Faturamento atualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar faturamento');
    }
});

// ==========================================
// 2. DESPESAS FIXAS
// ==========================================

router.get('/despesas', async (req: Request, res: Response) => {
    try {
        const resultado = await pool.query('SELECT * FROM despesas_fixas ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro nas despesas');
    }
});

router.post('/despesas', async (req: Request, res: Response) => {
    const { nome, valor } = req.body as ItemFinanceiroBody;
    try {
        const query = 'INSERT INTO despesas_fixas (nome, valor) VALUES ($1, $2) RETURNING *';
        const nova = await pool.query(query, [nome, valor]);
        res.json(nova.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar despesa');
    }
});

// --- NOVO: ATUALIZAR DESPESA ---
router.put('/despesas/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, valor } = req.body as ItemFinanceiroBody;
    try {
        await pool.query('UPDATE despesas_fixas SET nome = $1, valor = $2 WHERE id = $3', [nome, valor, id]);
        res.json({ message: 'Atualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar');
    }
});

router.delete('/despesas/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM despesas_fixas WHERE id = $1', [id]);
        res.json({ message: 'Deletado' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar');
    }
});

// ==========================================
// 3. INVESTIMENTOS
// ==========================================

router.get('/investimentos', async (req: Request, res: Response) => {
    try {
        const resultado = await pool.query('SELECT * FROM investimentos ORDER BY id ASC');
        res.json(resultado.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro nos investimentos');
    }
});

router.post('/investimentos', async (req: Request, res: Response) => {
    const { nome, valor } = req.body as ItemFinanceiroBody;
    try {
        const query = 'INSERT INTO investimentos (nome, valor) VALUES ($1, $2) RETURNING *';
        const novo = await pool.query(query, [nome, valor]);
        res.json(novo.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao salvar investimento');
    }
});

// --- NOVO: ATUALIZAR INVESTIMENTO ---
router.put('/investimentos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, valor } = req.body as ItemFinanceiroBody;
    try {
        await pool.query('UPDATE investimentos SET nome = $1, valor = $2 WHERE id = $3', [nome, valor, id]);
        res.json({ message: 'Atualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar');
    }
});

router.delete('/investimentos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM investimentos WHERE id = $1', [id]);
        res.json({ message: 'Deletado' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar');
    }
});

export default router;