import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { calcularEncargos } from '../services/funcionario.service';

const router = Router();

// ==============================================================================
// 1. ROTAS DE LEITURA (GET)
// ==============================================================================

// --- RELATÓRIO HISTÓRICO (AGORA NO TOPO ABSOLUTO) ---
router.get('/relatorio', async (req: Request, res: Response) => {
    const { inicio, fim } = req.query;

    console.log("📝 [Backend] Relatório Solicitado. Inicio:", inicio, "Fim:", fim);

    if (!inicio || !fim) {
        return res.status(400).json({ error: 'Datas de início e fim são obrigatórias' });
    }

    try {
        // LÓGICA DE INTERSEÇÃO DE DATAS BLINDADA (::date)
        const query = `
            SELECT * FROM funcionarios
            WHERE 
                data_admissao <= $2::date 
                AND (data_inativacao IS NULL OR data_inativacao >= $1::date)
            ORDER BY nome ASC
        `;
        
        const values = [inicio, fim];
        const result = await pool.query(query, values);

        console.log(`✅ [Backend] Encontrados ${result.rowCount} registros no período.`);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ [Backend] Erro no relatório:", err);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

// --- LISTAR TODOS (PADRÃO) ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT * FROM funcionarios 
            ORDER BY ativo DESC, nome ASC
        `);
        res.json(result.rows);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados' }); 
    }
});

// ==============================================================================
// 2. ROTAS DE ESCRITA (POST, PUT, DELETE)
// ==============================================================================

// --- CADASTRAR (POST) ---
router.post('/', async (req: Request, res: Response) => {
    const { 
        nome, funcao, salario, epi, ativo, setor, 
        data_admissao, 
        data_inativacao, motivo_inativacao 
    } = req.body;

    const calculo = calcularEncargos(Number(salario), Number(epi));
    
    const isAtivo = ativo !== undefined ? ativo : true;
    const setorSalvar = setor || 'producao';
    const admissao = data_admissao || new Date().toISOString().split('T')[0];
    const dataSaida = isAtivo ? null : data_inativacao;
    const motivoSaida = isAtivo ? null : motivo_inativacao;

    try {
        const query = `
            INSERT INTO funcionarios
            (
                nome, funcao, salario_base, epi, 
                decimo_terceiro, ferias, um_terco_ferias, inss, multa_fgts, custo_total_mensal, 
                ativo, setor, data_admissao,
                data_inativacao, motivo_inativacao
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;
        
        const values = [
            nome, funcao, calculo.salarioBase, calculo.epi,
            calculo.decimoTerceiro, calculo.ferias, calculo.umTercoFerias, 
            calculo.inss, calculo.multaFgts, calculo.custoTotal,
            isAtivo, setorSalvar, admissao,
            dataSaida, motivoSaida
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Erro ao cadastrar' }); 
    }
});

// --- ATUALIZAR (PUT) ---
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        nome, funcao, salario, epi, ativo, setor,
        data_admissao, 
        data_inativacao, motivo_inativacao
    } = req.body;

    const calculo = calcularEncargos(Number(salario), Number(epi));

    let dataSaida = data_inativacao;
    let motivoSaida = motivo_inativacao;
    
    if (ativo === true) {
        dataSaida = null;
        motivoSaida = null;
    }

    try {
        const query = `
            UPDATE funcionarios SET
                nome = $1, 
                funcao = $2, 
                salario_base = $3, 
                epi = $4,
                decimo_terceiro = $5, 
                ferias = $6, 
                um_terco_ferias = $7,
                inss = $8, 
                multa_fgts = $9, 
                custo_total_mensal = $10,
                ativo = $11, 
                setor = $12, 
                data_admissao = $13,
                data_inativacao = $14,
                motivo_inativacao = $15
            WHERE id = $16
        `;
        
        const values = [
            nome, funcao, calculo.salarioBase, calculo.epi,
            calculo.decimoTerceiro, calculo.ferias, calculo.umTercoFerias,
            calculo.inss, calculo.multaFgts, calculo.custoTotal,
            ativo, setor, data_admissao,
            dataSaida, motivoSaida,
            id
        ];

        await pool.query(query, values);
        res.json({ message: 'Atualizado com sucesso' });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Erro ao atualizar' }); 
    }
});

// --- EXCLUIR (DELETE) ---
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM funcionarios WHERE id = $1', [req.params.id]);
        res.json({ message: 'Deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar' });
    }
});

export default router;