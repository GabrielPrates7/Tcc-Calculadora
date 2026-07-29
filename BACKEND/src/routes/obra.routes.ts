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
    custo_dia_calculado: string; 
}

interface RecursoObraInput {
    funcao_id: number;
    qtd_profissionais: number;
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
                
                -- CUSTO HORA (CH): Unitário (Reflete os R$ 26,46 da planilha)
                -- Pega o total do setor e divide pelas (horas * qtd de profissionais)
                CASE 
                    WHEN COUNT(f.id) > 0 THEN 
                        ROUND((SUM(f.custo_total_mensal) / (COUNT(f.id) * 22 * 8))::numeric, 6)
                    ELSE 
                        COALESCE(func.custo_hora_mercado, 0)::numeric
                END AS custo_hora_calculado,

                -- CUSTO DIA (CD): Global/Setor Inteiro (Reflete os R$ 634,97 da planilha)
                -- Pega o total do setor e divide direto pelos 22 dias
                CASE 
                    WHEN COUNT(f.id) > 0 THEN 
                        ROUND((SUM(f.custo_total_mensal) / 22)::numeric, 6)
                    ELSE 
                        COALESCE(func.custo_hora_mercado * 8, 0)::numeric
                END AS custo_dia_calculado

            FROM public.funcoes func
            LEFT JOIN public.funcionarios f ON f.funcao_id = func.id AND f.ativo = true
            GROUP BY func.id, func.nome, func.base_horas_mensais, func.custo_hora_mercado
            ORDER BY func.nome;
        `;
        const result = await pool.query<TaxaFuncaoRow>(query);
        const taxasLimpas = result.rows.map(row => ({
            funcao_id: row.funcao_id,
            funcao_nome: row.funcao_nome,
            total_funcionarios_ativos: Number(row.total_funcionarios_ativos),
            custo_mensal_setor: Number(row.custo_mensal_setor),
            custo_hora_calculado: Number(row.custo_hora_calculado),
            custo_dia_calculado: Number(row.custo_dia_calculado)
        }));
        res.json(taxasLimpas);
    } catch (err) {
        console.error("Erro ao calcular taxas:", err);
        res.status(500).json({ error: 'Erro interno ao processar as taxas.' });
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
        const custoTotalEstimado = recursos.reduce((acc: number, recurso: RecursoObraInput) => {
            return acc + (recurso.horas_estimadas * recurso.custo_hora_aplicado);
        }, 0);

        const insertObraQuery = `INSERT INTO public.obras (titulo, cliente, data_entrega, custo_total_estimado) VALUES ($1, $2, $3, $4) RETURNING id;`;
        const obraResult = await client.query(insertObraQuery, [titulo, cliente, data_entrega || null, custoTotalEstimado]);
        const obraId = obraResult.rows[0].id;

        const insertRecursoQuery = `INSERT INTO public.obra_recursos_humanos (obra_id, funcao_id, qtd_profissionais, horas_estimadas, custo_hora_aplicado) VALUES ($1, $2, $3, $4, $5);`;
        for (const recurso of recursos) {
            await client.query(insertRecursoQuery, [obraId, recurso.funcao_id, recurso.qtd_profissionais, recurso.horas_estimadas, recurso.custo_hora_aplicado]);
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Criado com sucesso!', obra_id: obraId, custo_total: custoTotalEstimado });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro ao salvar obra:", err);
        res.status(500).json({ error: 'Erro ao salvar o orçamento.' });
    } finally {
        client.release();
    }
});

// ============================================================================
// NOVA ROTA 3: ATUALIZAR (PUT /:id)
// ============================================================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { titulo, cliente, data_entrega, recursos } = req.body;

    if (!titulo || !cliente || !recursos || recursos.length === 0) {
        res.status(400).json({ error: 'Dados incompletos para atualização.' });
        return;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const custoTotalEstimado = recursos.reduce((acc: number, recurso: RecursoObraInput) => {
            return acc + (recurso.horas_estimadas * recurso.custo_hora_aplicado);
        }, 0);
        
        await client.query(
            `UPDATE public.obras SET titulo = $1, cliente = $2, data_entrega = $3, custo_total_estimado = $4 WHERE id = $5`,
            [titulo, cliente, data_entrega || null, custoTotalEstimado, id]
        );

        await client.query(`DELETE FROM public.obra_recursos_humanos WHERE obra_id = $1`, [id]);

        const insertRecursoQuery = `INSERT INTO public.obra_recursos_humanos (obra_id, funcao_id, qtd_profissionais, horas_estimadas, custo_hora_aplicado) VALUES ($1, $2, $3, $4, $5);`;
        for (const recurso of recursos) {
            await client.query(insertRecursoQuery, [id, recurso.funcao_id, recurso.qtd_profissionais, recurso.horas_estimadas, recurso.custo_hora_aplicado]);
        }

        await client.query('COMMIT');
        res.json({ message: 'Atualizado com sucesso!', custo_total: custoTotalEstimado });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro ao atualizar obra:", err);
        res.status(500).json({ error: 'Erro ao atualizar o orçamento.' });
    } finally {
        client.release();
    }
});

// ============================================================================
// ROTA 4: LISTAR HISTÓRICO DE OBRAS (GET /)
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT o.id, o.titulo, o.cliente, o.data_inicio, o.data_entrega, o.status, o.custo_total_estimado, o.criado_em,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'funcao_id', f.id, 
                            'funcao_nome', f.nome,
                            'qtd_profissionais', orh.qtd_profissionais,
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
        res.status(500).json({ error: 'Erro ao buscar o histórico.' });
    }
});

// ============================================================================
// ROTA 5: EXCLUIR OBRA (DELETE /:id)
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM public.obras WHERE id = $1', [id]);
        res.json({ message: 'Obra excluída.' });
    } catch (err) {
        console.error("Erro ao excluir obra:", err);
        res.status(500).json({ error: 'Erro ao excluir a obra.' });
    }
});

export default router;