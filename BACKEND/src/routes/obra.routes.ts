import { Router, Request, Response } from 'express';
import { pool } from '../services/db';
import { verificarToken } from '../middlewares/auth.middleware';
import { ObraService } from '../services/obra.service';

const router = Router();

// Protege todas as rotas de obras
router.use(verificarToken);

// ============================================================================
// INTERFACES (Tipagem Estrita)
// ============================================================================

interface RecursoObraInput {
    funcao_id: number;
    qtd_profissionais: number;
    horas_estimadas: number;
    custo_hora_aplicado: number;
    unidade_tempo?: 'horas' | 'dias';
}

interface NovaObraBody {
    titulo: string;
    cliente: string;
    data_entrega?: string;
    tipo_tempo?: 'horas' | 'dias'; 
    recursos: RecursoObraInput[];
}

// ============================================================================
// ROTA 1: MOTOR DE CÁLCULO DINÂMICO (GET /taxas)
// ============================================================================
router.get('/taxas', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const taxas = await ObraService.obterTaxasPorFuncao(empresaId);
        res.json(taxas);
    } catch (err) {
        console.error("Erro ao calcular taxas:", err);
        res.status(500).json({ error: 'Erro interno ao processar as taxas.' });
    }
});

// ============================================================================
// ROTA 2: SALVAR ORÇAMENTO DE OBRA (POST /)
// ============================================================================
router.post('/', async (req: Request<{}, {}, NovaObraBody>, res: Response): Promise<void> => {
    const { titulo, cliente, data_entrega, tipo_tempo, recursos } = req.body;
    const empresaId = req.usuario!.empresa_id;

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

        const insertObraQuery = `
            INSERT INTO public.obras (titulo, cliente, data_entrega, custo_total_estimado, tipo_tempo, empresa_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id;
        `;
        const obraResult = await client.query(insertObraQuery, [
            titulo, 
            cliente, 
            data_entrega || null, 
            custoTotalEstimado, 
            tipo_tempo || 'horas',
            empresaId
        ]);
        const obraId = obraResult.rows[0].id;

        const insertRecursoQuery = `
            INSERT INTO public.obra_recursos_humanos 
            (obra_id, funcao_id, qtd_profissionais, horas_estimadas, custo_hora_aplicado, unidade_tempo, empresa_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        for (const recurso of recursos) {
            await client.query(insertRecursoQuery, [
                obraId, 
                recurso.funcao_id, 
                recurso.qtd_profissionais, 
                recurso.horas_estimadas, 
                recurso.custo_hora_aplicado,
                recurso.unidade_tempo || 'horas',
                empresaId
            ]);
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
// ROTA 3: ATUALIZAR ORÇAMENTO (PUT /:id)
// ============================================================================
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { titulo, cliente, data_entrega, tipo_tempo, recursos } = req.body;
    const empresaId = req.usuario!.empresa_id;

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
            `UPDATE public.obras 
             SET titulo = $1, cliente = $2, data_entrega = $3, custo_total_estimado = $4, tipo_tempo = $5 
             WHERE id = $6 AND empresa_id = $7`,
            [titulo, cliente, data_entrega || null, custoTotalEstimado, tipo_tempo || 'horas', id, empresaId]
        );

        await client.query(`DELETE FROM public.obra_recursos_humanos WHERE obra_id = $1 AND empresa_id = $2`, [id, empresaId]);

        const insertRecursoQuery = `
            INSERT INTO public.obra_recursos_humanos 
            (obra_id, funcao_id, qtd_profissionais, horas_estimadas, custo_hora_aplicado, unidade_tempo, empresa_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        for (const recurso of recursos) {
            await client.query(insertRecursoQuery, [
                id, 
                recurso.funcao_id, 
                recurso.qtd_profissionais, 
                recurso.horas_estimadas, 
                recurso.custo_hora_aplicado,
                recurso.unidade_tempo || 'horas',
                empresaId
            ]);
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
        const empresaId = req.usuario!.empresa_id;

        const query = `
            SELECT o.id, o.titulo, o.cliente, o.data_inicio, o.data_entrega, o.status, o.custo_total_estimado, o.criado_em, o.tipo_tempo,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'funcao_id', f.id, 
                            'funcao_nome', f.nome,
                            'qtd_profissionais', orh.qtd_profissionais,
                            'horas_estimadas', orh.horas_estimadas,
                            'custo_hora_aplicado', orh.custo_hora_aplicado,
                            'unidade_tempo', COALESCE(orh.unidade_tempo, 'horas')
                        )
                    ) FILTER (WHERE orh.id IS NOT NULL), '[]'
                ) AS recursos
            FROM public.obras o
            LEFT JOIN public.obra_recursos_humanos orh ON o.id = orh.obra_id
            LEFT JOIN public.funcoes f ON orh.funcao_id = f.id
            WHERE o.empresa_id = $1
            GROUP BY o.id
            ORDER BY o.criado_em ASC;
        `;
        const result = await pool.query(query, [empresaId]);
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
    const empresaId = req.usuario!.empresa_id;

    try {
        await pool.query('DELETE FROM public.obras WHERE id = $1 AND empresa_id = $2', [id, empresaId]);
        res.json({ message: 'Obra excluída.' });
    } catch (err) {
        console.error("Erro ao excluir obra:", err);
        res.status(500).json({ error: 'Erro ao excluir a obra.' });
    }
});

export default router;