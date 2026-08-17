import { pool as db } from './db';

export interface IOrdemServicoEdicao {
    data_entrega?: string | null;
    responsaveis_execucao?: string | null;
    observacoes?: string | null;
    laudo_tecnico?: string | null;
    custo_extra_materiais?: number;
    descricao_materiais_extras?: string | null;
    data_finalizacao?: string | null;
    data_entregue?: string | null;
    observacoes_cliente?: string | null;
}

export class OrdemServicoService {
    private queryBaseOS = `
        WITH pagamentos_agg AS (
            SELECT 
                os_id,
                COALESCE(SUM(valor), 0) AS total_pago,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', id,
                            'valor', valor,
                            'forma_pagamento', forma_pagamento,
                            'data_pagamento', data_pagamento
                        ) ORDER BY data_pagamento DESC
                    ), '[]'::json
                ) AS lista_pagamentos
            FROM public.pagamentos_os
            GROUP BY os_id
        )
        SELECT 
            os.id AS os_id,
            os.orcamento_id,
            os.status_producao,
            os.data_entrega,
            os.data_finalizacao,
            os.data_entregue,
            os.responsaveis_execucao,
            os.observacoes,
            os.observacoes_cliente,
            os.laudo_tecnico,
            os.custo_extra_materiais,
            os.descricao_materiais_extras,
            os.atualizado_em,
            os.criado_em,
            o.cliente,
            o.nome_produto,
            o.preco_venda,
            COALESCE(p.total_pago, 0) AS total_pago,
            COALESCE(p.lista_pagamentos, '[]'::json) AS pagamentos,
            (CASE 
                WHEN os.data_entrega < CURRENT_DATE AND os.status_producao NOT IN ('pronto', 'entregue') 
                THEN true ELSE false 
            END) AS esta_atrasado,
            (CASE
                WHEN COALESCE(p.total_pago, 0) >= o.preco_venda THEN 'pago'
                WHEN COALESCE(p.total_pago, 0) > 0 THEN 'sinal_pago'
                ELSE 'pendente'
            END) AS status_financeiro
        FROM public.ordens_servico os
        INNER JOIN public.orcamentos o ON o.id = os.orcamento_id
        LEFT JOIN pagamentos_agg p ON p.os_id = os.id
        WHERE os.empresa_id = $1
    `;

    async listarTodas(empresa_id: number) {
        const query = `${this.queryBaseOS} ORDER BY os.id DESC;`;
        const result = await db.query(query, [empresa_id]);
        return result.rows;
    }

    async criarDeOrcamento(orcamentoId: number, dataEntrega: string | undefined, empresa_id: number) {
        const insertQuery = `
            INSERT INTO public.ordens_servico (orcamento_id, status_producao, status_financeiro, data_entrega, atualizado_em, empresa_id)
            VALUES ($1, 'fila', 'pendente', $2, NOW(), $3)
            RETURNING id;
        `;
        const insertResult = await db.query(insertQuery, [orcamentoId, dataEntrega || null, empresa_id]);
        
        const query = `${this.queryBaseOS} AND os.id = $2`;
        const result = await db.query(query, [empresa_id, insertResult.rows[0].id]);
        return result.rows[0];
    }

    async atualizarStatus(id: number, status_producao: string | undefined, empresa_id: number) {
        const query = `
            UPDATE public.ordens_servico
            SET 
                status_producao = COALESCE($1, status_producao),
                data_finalizacao = CASE 
                    WHEN COALESCE($1, status_producao) IN ('pronto', 'entregue') THEN COALESCE(data_finalizacao, CURRENT_DATE)
                    ELSE NULL 
                END,
                data_entregue = CASE 
                    WHEN COALESCE($1, status_producao) = 'entregue' THEN COALESCE(data_entregue, CURRENT_DATE)
                    ELSE NULL 
                END,
                atualizado_em = NOW()
            WHERE id = $2 AND empresa_id = $3
        `;
        await db.query(query, [status_producao || null, id, empresa_id]);
        
        const returnQuery = `${this.queryBaseOS} AND os.id = $2`;
        const result = await db.query(returnQuery, [empresa_id, id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return result.rows[0];
    }

    async atualizarDados(id: number, dados: IOrdemServicoEdicao, empresa_id: number) {
        const query = `
            UPDATE public.ordens_servico
            SET 
                data_entrega = COALESCE($1, data_entrega),
                responsaveis_execucao = $2,
                observacoes = $3,
                laudo_tecnico = $4,
                custo_extra_materiais = COALESCE($5, 0),
                descricao_materiais_extras = $6,
                data_finalizacao = $7,
                data_entregue = $8,
                observacoes_cliente = $9,
                atualizado_em = NOW()
            WHERE id = $10 AND empresa_id = $11
        `;
        const values = [
            dados.data_entrega || null, dados.responsaveis_execucao || null, dados.observacoes || null,
            dados.laudo_tecnico || null, Number(dados.custo_extra_materiais) || 0, dados.descricao_materiais_extras || null,
            dados.data_finalizacao || null, dados.data_entregue || null, dados.observacoes_cliente || null, id, empresa_id
        ];
        await db.query(query, values);

        const returnQuery = `${this.queryBaseOS} AND os.id = $2`;
        const result = await db.query(returnQuery, [empresa_id, id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return result.rows[0];
    }

    async excluir(id: number, empresa_id: number): Promise<boolean> {
        const query = 'DELETE FROM public.ordens_servico WHERE id = $1 AND empresa_id = $2';
        const result = await db.query(query, [id, empresa_id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return true;
    }

    async registrarPagamento(os_id: number, valor: number, forma_pagamento: string, data_pagamento: string, empresa_id: number) {
        // Verifica se a OS pertence à empresa antes de adicionar pagamento
        const checkOsQuery = 'SELECT id FROM public.ordens_servico WHERE id = $1 AND empresa_id = $2';
        const osResult = await db.query(checkOsQuery, [os_id, empresa_id]);
        if (osResult.rowCount === 0) throw new Error('Ordem de Serviço não encontrada para esta empresa.');

        const query = `
            INSERT INTO public.pagamentos_os (os_id, valor, forma_pagamento, data_pagamento, empresa_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        await db.query(query, [os_id, valor, forma_pagamento, data_pagamento, empresa_id]);
        
        const returnQuery = `${this.queryBaseOS} AND os.id = $2`;
        const result = await db.query(returnQuery, [empresa_id, os_id]);
        return result.rows[0];
    }

    async excluirPagamento(pagamento_id: number, empresa_id: number) {
        const getOsIdQuery = 'SELECT os_id FROM public.pagamentos_os WHERE id = $1 AND empresa_id = $2';
        const osIdResult = await db.query(getOsIdQuery, [pagamento_id, empresa_id]);
        if (osIdResult.rowCount === 0) throw new Error('Pagamento não encontrado.');
        const os_id = osIdResult.rows[0].os_id;

        const deleteQuery = 'DELETE FROM public.pagamentos_os WHERE id = $1 AND empresa_id = $2';
        await db.query(deleteQuery, [pagamento_id, empresa_id]);

        const returnQuery = `${this.queryBaseOS} AND os.id = $2`;
        const result = await db.query(returnQuery, [empresa_id, os_id]);
        return result.rows[0];
    }
}