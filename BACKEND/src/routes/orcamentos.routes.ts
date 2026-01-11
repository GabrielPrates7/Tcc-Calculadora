import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

// --- 1. LISTAR TODOS (GET) ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                id,
                cliente,
                nome_produto, 
                custo_mercadoria as custo_materiais, 
                tempo_gasto as horas_trabalhadas, 
                lucro_desejado_pct as lucro_desejado, 
                imposto_pct as imposto, 
                preco_venda
            FROM orcamentos 
            ORDER BY id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar orçamentos:", err);
        res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
});

// --- 2. SALVAR NOVO (POST) ---
router.post('/', async (req: Request, res: Response) => {
    const { 
        cliente, nome_produto, custo_materiais, horas_trabalhadas, 
        lucro_desejado, imposto, preco_venda 
    } = req.body;

    try {
        const query = `
            INSERT INTO orcamentos 
            (cliente, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct, preco_venda)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            cliente || 'Cliente Padrão',
            nome_produto, 
            Number(custo_materiais), 
            Number(horas_trabalhadas), 
            Number(lucro_desejado), 
            Number(imposto), 
            Number(preco_venda)
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao salvar:", err);
        res.status(500).json({ error: 'Erro ao salvar' });
    }
});

// --- 3. ATUALIZAR EXISTENTE (PUT) - NOVO! ---
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { 
        cliente, nome_produto, custo_materiais, horas_trabalhadas, 
        lucro_desejado, imposto, preco_venda 
    } = req.body;

    try {
        const query = `
            UPDATE orcamentos SET
                cliente = $1,
                nome_produto = $2,
                custo_mercadoria = $3,
                tempo_gasto = $4,
                lucro_desejado_pct = $5,
                imposto_pct = $6,
                preco_venda = $7
            WHERE id = $8
        `;
        
        const values = [
            cliente,
            nome_produto, 
            Number(custo_materiais), 
            Number(horas_trabalhadas), 
            Number(lucro_desejado), 
            Number(imposto), 
            Number(preco_venda),
            id
        ];

        await pool.query(query, values);
        res.json({ message: 'Orçamento atualizado com sucesso!' });
    } catch (err) {
        console.error("Erro ao atualizar:", err);
        res.status(500).json({ error: 'Erro ao atualizar' });
    }
});

// --- 4. EXCLUIR (DELETE) ---
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM orcamentos WHERE id = $1', [id]);
        res.json({ message: 'Orçamento excluído' });
    } catch (err) {
        console.error("Erro ao excluir:", err);
        res.status(500).json({ error: 'Erro ao excluir' });
    }
});

export default router;