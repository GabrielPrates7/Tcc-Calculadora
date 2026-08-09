import { pool as db } from './db';

export interface IOrdemServicoEdicao {
    data_entrega?: string | null;
    responsaveis_execucao?: string | null;
    observacoes?: string | null;
    laudo_tecnico?: string | null;
    custo_extra_materiais?: number;
    descricao_materiais_extras?: string | null;
    data_finalizacao?: string | null;
}

export class OrdemServicoService {
    // CTE centralizada para garantir o cálculo financeiro em todas as requisições
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
            os.responsaveis_execucao,
            os.observacoes,
            os.laudo_tecnico,
            os.custo_extra_materiais,
            os.descricao_materiais_extras,
            os.data_finalizacao,
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
    `;

    async listarTodas() {
        const query = `${this.queryBaseOS} ORDER BY os.id DESC;`;
        const result = await db.query(query);
        return result.rows;
    }

    async criarDeOrcamento(orcamentoId: number, dataEntrega?: string) {
        const insertQuery = `
            INSERT INTO public.ordens_servico (orcamento_id, status_producao, status_financeiro, data_entrega, atualizado_em)
            VALUES ($1, 'fila', 'pendente', $2, NOW())
            RETURNING id;
        `;
        const insertResult = await db.query(insertQuery, [orcamentoId, dataEntrega || null]);
        
        // Retorna a O.S formatada com a query base
        const query = `${this.queryBaseOS} WHERE os.id = $1`;
        const result = await db.query(query, [insertResult.rows[0].id]);
        return result.rows[0];
    }

    async atualizarStatus(id: number, status_producao?: string) {
        const query = `
            UPDATE public.ordens_servico
            SET 
                status_producao = COALESCE($1, status_producao),
                data_finalizacao = CASE 
                    WHEN COALESCE($1, status_producao) IN ('pronto', 'entregue') THEN COALESCE(data_finalizacao, CURRENT_DATE)
                    ELSE NULL 
                END,
                atualizado_em = NOW()
            WHERE id = $2
        `;
        await db.query(query, [status_producao || null, id]);
        
        const returnQuery = `${this.queryBaseOS} WHERE os.id = $1`;
        const result = await db.query(returnQuery, [id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return result.rows[0];
    }

    async atualizarDados(id: number, dados: IOrdemServicoEdicao) {
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
                atualizado_em = NOW()
            WHERE id = $8
        `;
        const values = [
            dados.data_entrega || null, dados.responsaveis_execucao || null, dados.observacoes || null,
            dados.laudo_tecnico || null, Number(dados.custo_extra_materiais) || 0, dados.descricao_materiais_extras || null,
            dados.data_finalizacao || null, id
        ];
        await db.query(query, values);

        const returnQuery = `${this.queryBaseOS} WHERE os.id = $1`;
        const result = await db.query(returnQuery, [id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return result.rows[0];
    }

    async excluir(id: number): Promise<boolean> {
        const query = 'DELETE FROM public.ordens_servico WHERE id = $1';
        const result = await db.query(query, [id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return true;
    }

    // --- NOVOS MÉTODOS FINANCEIROS ---
    async registrarPagamento(os_id: number, valor: number, forma_pagamento: string, data_pagamento: string) {
        const query = `
            INSERT INTO public.pagamentos_os (os_id, valor, forma_pagamento, data_pagamento)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        await db.query(query, [os_id, valor, forma_pagamento, data_pagamento]);
        
        // Retorna a O.S. inteira atualizada com os novos cálculos
        const returnQuery = `${this.queryBaseOS} WHERE os.id = $1`;
        const result = await db.query(returnQuery, [os_id]);
        return result.rows[0];
    }

    async excluirPagamento(pagamento_id: number) {
        // Busca a qual OS pertence antes de deletar
        const getOsIdQuery = 'SELECT os_id FROM public.pagamentos_os WHERE id = $1';
        const osIdResult = await db.query(getOsIdQuery, [pagamento_id]);
        if (osIdResult.rowCount === 0) throw new Error('Pagamento não encontrado.');
        const os_id = osIdResult.rows[0].os_id;

        const deleteQuery = 'DELETE FROM public.pagamentos_os WHERE id = $1';
        await db.query(deleteQuery, [pagamento_id]);

        // Retorna a O.S. atualizada
        const returnQuery = `${this.queryBaseOS} WHERE os.id = $1`;
        const result = await db.query(returnQuery, [os_id]);
        return result.rows[0];
    }
}