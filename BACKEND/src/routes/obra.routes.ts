import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

// ============================================================================
// INTERFACES (Tipagem Estrita)
// ============================================================================

interface TaxaFuncaoRow {
    funcao_id: number;
    funcao_nome: string;
    total_funcionarios_ativos: string; 
    custo_mensal_setor: string;        
    horas_totais_setor: string;
    custo_hora_calculado: string;      
}

interface RecursoObraInput {
    funcao_id: number;
    qtd_profissionais: number; // <-- ADICIONADO: Mantendo a granularidade
    horas_estimadas: number;
    custo_hora_aplicado: number;
}

interface NovaObraBody {
    titulo: string;
    cliente: string;
    data_entrega?: string;
    recursos: RecursoObraInput[];
}

// ============================================================================
// ROTA 1: MOTOR DE CÁLCULO DINÂMICO (GET /taxas)
// ============================================================================
router.get('/taxas', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                func.id AS funcao_id,
                func.nome AS funcao_nome,
                COUNT(f.id) AS total_funcionarios_ativos,
                COALESCE(SUM(f.custo_total_mensal), 0) AS custo_mensal_setor,
                (COUNT(f.id) * func.base_horas_mensais) AS horas_totais_setor,
                CASE 
                    WHEN COUNT(f.id) > 0 AND func.base_horas_mensais > 0 THEN 
                        -- Precisão de 6 casas decimais para evitar furo financeiro
                        ROUND((SUM(f.custo_total_mensal) / (COUNT(f.id) * func.base_horas_mensais))::numeric, 6)
                    ELSE 
                        COALESCE(func.custo_hora_mercado, 0)::numeric
                END AS custo_hora_calculado
            FROM 
                public.funcoes func
            LEFT JOIN 
                public.funcionarios f ON f.funcao_id = func.id AND f.ativo = true
            GROUP BY 
                func.id, func.nome, func.base_horas_mensais, func.custo_hora_mercado
            ORDER BY 
                func.nome;
        `;

        const result = await pool.query<TaxaFuncaoRow>(query);

        const taxasLimpas = result.rows.map(row => ({
            funcao_id: row.funcao_id,
            funcao_nome: row.funcao_nome,
            total_funcionarios_ativos: Number(row.total_funcionarios_ativos),
            custo_mensal_setor: Number(row.custo_mensal_setor),
            custo_hora_calculado: Number(row.custo_hora_calculado)
        }));

        res.json(taxasLimpas);
    } catch (err) {
        console.error("Erro ao calcular taxas das funções:", err);
        res.status(500).json({ error: 'Erro interno ao processar as taxas de produção.' });
    }
});

// ============================================================================
// ROTA 2: SALVAR ORÇAMENTO DE OBRA (POST /)
// ============================================================================
router.post('/', async (req: Request<{}, {}, NovaObraBody>, res: Response): Promise<void> => {
    const { titulo, cliente, data_entrega, recursos } = req.body;

    if (!titulo || !cliente || !recursos || recursos.length === 0) {
        res.status(400).json({ error: 'Título, cliente e ao menos um recurso são obrigatórios.' });
        return;
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const custoTotalEstimado = recursos.reduce((acc, recurso) => {
            return acc + (recurso.horas_estimadas * recurso.custo_hora_aplicado);
        }, 0);

        const insertObraQuery = `
            INSERT INTO public.obras (titulo, cliente, data_entrega, custo_total_estimado)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;
        const obraResult = await client.query(insertObraQuery, [
            titulo, 
            cliente, 
            data_entrega || null, 
            custoTotalEstimado
        ]);
        const obraId = obraResult.rows[0].id;

        // <-- CORREÇÃO: Adicionando qtd_profissionais no INSERT
        const insertRecursoQuery = `
            INSERT INTO public.obra_recursos_humanos (obra_id, funcao_id, qtd_profissionais, horas_estimadas, custo_hora_aplicado)
            VALUES ($1, $2, $3, $4, $5);
        `;
        
        for (const recurso of recursos) {
            await client.query(insertRecursoQuery, [
                obraId,
                recurso.funcao_id,
                recurso.qtd_profissionais, // <-- INJETANDO NO BANCO
                recurso.horas_estimadas,
                recurso.custo_hora_aplicado
            ]);
        }

        await client.query('COMMIT');

        res.status(201).json({ 
            message: 'Obra e orçamento criados com sucesso!', 
            obra_id: obraId,
            custo_total: custoTotalEstimado 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro na transação de salvar obra:", err);
        res.status(500).json({ error: 'Erro ao salvar o orçamento da obra.' });
    } finally {
        client.release();
    }
});

// ============================================================================
// ROTA 3: LISTAR HISTÓRICO DE OBRAS (GET /)
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                o.id, 
                o.titulo, 
                o.cliente, 
                o.data_inicio, 
                o.data_entrega, 
                o.status, 
                o.custo_total_estimado, 
                o.criado_em,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'funcao_nome', f.nome,
                            'qtd_profissionais', orh.qtd_profissionais, -- <-- CORREÇÃO: Puxando dado real do banco
                            'horas_estimadas', orh.horas_estimadas,
                            'custo_hora_aplicado', orh.custo_hora_aplicado
                        )
                    ) FILTER (WHERE orh.id IS NOT NULL), '[]'
                ) AS recursos
            FROM public.obras o
            LEFT JOIN public.obra_recursos_humanos orh ON o.id = orh.obra_id
            LEFT JOIN public.funcoes f ON orh.funcao_id = f.id
            GROUP BY o.id
            ORDER BY o.criado_em ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar obras:", err);
        res.status(500).json({ error: 'Erro ao buscar o histórico de obras.' });
    }
});

// ============================================================================
// ROTA 4: EXCLUIR OBRA (DELETE /:id)
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM public.obras WHERE id = $1', [id]);
        res.json({ message: 'Obra excluída com sucesso.' });
    } catch (err) {
        console.error("Erro ao excluir obra:", err);
        res.status(500).json({ error: 'Erro ao excluir a obra.' });
    }
});

export default router;