import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { calcularEncargos } from '../services/funcionario.service';

const router = Router();

// --- NOVO: RELATÓRIO HISTÓRICO ---
// ARQUIVO: src/routes/funcionarios.routes.ts

// --- ROTA DE RELATÓRIO ATUALIZADA ---
router.get('/relatorio', async (req: Request, res: Response) => {
    try {
        const { inicio, fim } = req.query;

        if (!inicio || !fim) {
            return res.status(400).json({ error: 'Datas obrigatórias.' });
        }

        // AGORA BUSCAMOS OS DADOS COMPLETOS, NÃO SÓ A SOMA
        const query = `
            SELECT id, nome, funcao, custo_total_mensal, data_admissao, data_inativacao
            FROM funcionarios
            WHERE 
                setor = 'producao'
                AND data_admissao <= $2::DATE
                AND (data_inativacao IS NULL OR data_inativacao >= $1::DATE)
            ORDER BY nome ASC
        `;

        const result = await pool.query(query, [inicio, fim]);
        
        // Retornamos a lista pura. O Frontend fará a soma.
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

// LISTAR
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM funcionarios ORDER BY ativo DESC, nome ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Erro ao buscar dados' }); }
});

// CADASTRAR
router.post('/', async (req: Request, res: Response) => {
    const { nome, funcao, salario, epi, ativo, setor, data_admissao } = req.body;

    const calculo = calcularEncargos(Number(salario), Number(epi));
    const isAtivo = ativo !== undefined ? ativo : true;
    const setorSalvar = setor || 'producao';
    // Se não vier data, usa a data atual
    const admissao = data_admissao || new Date().toISOString().split('T')[0];

    try {
        const query = `
            INSERT INTO funcionarios 
            (nome, funcao, salario_base, epi, decimo_terceiro, ferias, um_terco_ferias, inss, multa_fgts, custo_total_mensal, ativo, setor, data_admissao)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        const values = [
            nome, funcao, calculo.salarioBase, calculo.epi, 
            calculo.decimoTerceiro, calculo.ferias, calculo.umTercoFerias, 
            calculo.inss, calculo.multaFgts, calculo.custoTotal,
            isAtivo, setorSalvar, admissao
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao cadastrar' }); }
});

// ATUALIZAR
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { 
        nome, funcao, salario, epi, ativo, setor, 
        data_admissao, data_inativacao, motivo_inativacao 
    } = req.body;

    const calculo = calcularEncargos(Number(salario), Number(epi));

    // Lógica: Se reativar o funcionário, limpamos a data de saída e motivo
    let dataSaida = data_inativacao;
    let motivo = motivo_inativacao;
    
    if (ativo === true) {
        dataSaida = null;
        motivo = null;
    }

    try {
        const query = `
            UPDATE funcionarios SET
            nome = $1, funcao = $2, salario_base = $3, epi = $4,
            decimo_terceiro = $5, ferias = $6, um_terco_ferias = $7,
            inss = $8, multa_fgts = $9, custo_total_mensal = $10,
            ativo = $11, setor = $12, data_admissao = $13,
            data_inativacao = $14, motivo_inativacao = $15
            WHERE id = $16
        `;
        const values = [
            nome, funcao, calculo.salarioBase, calculo.epi,
            calculo.decimoTerceiro, calculo.ferias, calculo.umTercoFerias,
            calculo.inss, calculo.multaFgts, calculo.custoTotal,
            ativo, setor, data_admissao,
            dataSaida, motivo,
            id
        ];
        await pool.query(query, values);
        res.json({ message: 'Atualizado' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req: Request, res: Response) => {
    await pool.query('DELETE FROM funcionarios WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deletado com sucesso' });
});

export default router;