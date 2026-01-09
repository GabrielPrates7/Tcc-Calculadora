import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

// 1. LISTAR TODOS (GET)
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM orcamentos ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
});

// 2. SALVAR NOVO (POST)
router.post('/', async (req: Request, res: Response) => {
    const { 
        cliente, nome_produto, custo_materiais, 
        horas_trabalhadas, lucro_desejado, imposto, 
        preco_venda, lucro_real 
    } = req.body;

    try {
        const query = `
            INSERT INTO orcamentos 
            (cliente, nome_produto, custo_materiais, horas_trabalhadas, lucro_desejado, imposto, preco_venda, lucro_real)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            cliente || 'Cliente Padrão', 
            nome_produto, 
            Number(custo_materiais), 
            Number(horas_trabalhadas), 
            Number(lucro_desejado), 
            Number(imposto), 
            Number(preco_venda), 
            Number(lucro_real)
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar orçamento' });
    }
});

// 3. EXCLUIR (DELETE)
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM orcamentos WHERE id = $1', [id]);
        res.json({ message: 'Orçamento excluído' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir' });
    }
});

export default router;