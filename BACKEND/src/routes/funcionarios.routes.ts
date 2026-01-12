import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { calcularEncargos } from '../services/funcionario.service';

const router = Router();

// --- 1. LISTAR TODOS ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM funcionarios ORDER BY ativo DESC, nome ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar:", err);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// --- 2. CADASTRAR NOVO ---
router.post('/', async (req: Request, res: Response) => {
    // Recebendo novos campos: ativo e setor
    const { nome, funcao, salario, epi, ativo, setor } = req.body;

    const calculo = calcularEncargos(Number(salario), Number(epi));
    // Se o frontend não mandar, assume true (ativo) e 'producao'
    const isAtivo = ativo !== undefined ? ativo : true;
    const setorSalvar = setor || 'producao';

    try {
        const query = `
            INSERT INTO funcionarios 
            (nome, funcao, salario_base, epi, decimo_terceiro, ferias, um_terco_ferias, inss, multa_fgts, custo_total_mensal, ativo, setor)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [
            nome, funcao, calculo.salarioBase, calculo.epi, 
            calculo.decimoTerceiro, calculo.ferias, calculo.umTercoFerias, 
            calculo.inss, calculo.multaFgts, calculo.custoTotal,
            isAtivo, setorSalvar
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao salvar:", err);
        res.status(500).json({ error: 'Erro ao cadastrar' });
    }
});

// --- 3. EXCLUIR ---
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM funcionarios WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deletado com sucesso' });
    } catch (err) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

// --- 4. ATUALIZAR ---
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, funcao, salario, epi, ativo, setor } = req.body;
    const calculo = calcularEncargos(Number(salario), Number(epi));

    try {
        const query = `
            UPDATE funcionarios SET
            nome = $1, funcao = $2, salario_base = $3, epi = $4,
            decimo_terceiro = $5, ferias = $6, um_terco_ferias = $7,
            inss = $8, multa_fgts = $9, custo_total_mensal = $10,
            ativo = $11, setor = $12
            WHERE id = $13
        `;
        const values = [
            nome, funcao, calculo.salarioBase, calculo.epi,
            calculo.decimoTerceiro, calculo.ferias, calculo.umTercoFerias,
            calculo.inss, calculo.multaFgts, calculo.custoTotal,
            ativo, setor,
            id
        ];
        await pool.query(query, values);
        res.json({ message: 'Atualizado' });
    } catch (err) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

export default router;