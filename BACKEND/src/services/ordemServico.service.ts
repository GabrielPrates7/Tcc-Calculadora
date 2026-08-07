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
    async listarTodas() {
        const query = `
            SELECT 
                os.id AS os_id,
                os.orcamento_id,
                os.status_producao,
                os.status_financeiro,
                os.data_entrega,
                os.responsaveis_execucao,
                os.observacoes,
                os.laudo_tecnico,
                os.custo_extra_materiais,
                os.descricao_materiais_extras,
                os.data_finalizacao,
                os.atualizado_em,
                os.criado_em,
                (CASE 
                    WHEN os.data_entrega < CURRENT_DATE AND os.status_producao NOT IN ('pronto', 'entregue') 
                    THEN true 
                    ELSE false 
                END) AS esta_atrasado,
                o.cliente,
                o.nome_produto,
                o.preco_venda
            FROM public.ordens_servico os
            INNER JOIN public.orcamentos o ON o.id = os.orcamento_id
            ORDER BY os.id DESC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async criarDeOrcamento(orcamentoId: number, dataEntrega?: string) {
        const query = `
            INSERT INTO public.ordens_servico (
                orcamento_id, 
                status_producao, 
                status_financeiro, 
                data_entrega,
                atualizado_em
            )
            VALUES ($1, 'fila', 'pendente', $2, NOW())
            RETURNING *;
        `;
        const result = await db.query(query, [orcamentoId, dataEntrega || null]);
        return result.rows[0];
    }

    async atualizarStatus(id: number, status_producao?: string, status_financeiro?: string) {
        const query = `
            WITH atualizada AS (
                UPDATE public.ordens_servico
                SET 
                    status_producao = COALESCE($1, status_producao),
                    status_financeiro = COALESCE($2, status_financeiro),
                    data_finalizacao = CASE 
                        WHEN COALESCE($1, status_producao) IN ('pronto', 'entregue') 
                            THEN COALESCE(data_finalizacao, CURRENT_DATE)
                        ELSE NULL 
                    END,
                    atualizado_em = NOW()
                WHERE id = $3
                RETURNING *
            )
            SELECT 
                a.id AS os_id,
                a.orcamento_id,
                a.status_producao,
                a.status_financeiro,
                a.data_entrega,
                a.responsaveis_execucao,
                a.observacoes,
                a.laudo_tecnico,
                a.custo_extra_materiais,
                a.descricao_materiais_extras,
                a.data_finalizacao,
                a.atualizado_em,
                a.criado_em,
                (CASE 
                    WHEN a.data_entrega < CURRENT_DATE AND a.status_producao NOT IN ('pronto', 'entregue') 
                    THEN true 
                    ELSE false 
                END) AS esta_atrasado,
                o.cliente,
                o.nome_produto,
                o.preco_venda
            FROM atualizada a
            INNER JOIN public.orcamentos o ON o.id = a.orcamento_id;
        `;
        const result = await db.query(query, [status_producao || null, status_financeiro || null, id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return result.rows[0];
    }

    async atualizarDados(id: number, dados: IOrdemServicoEdicao) {
        const query = `
            WITH atualizada AS (
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
                RETURNING *
            )
            SELECT 
                a.id AS os_id,
                a.orcamento_id,
                a.status_producao,
                a.status_financeiro,
                a.data_entrega,
                a.responsaveis_execucao,
                a.observacoes,
                a.laudo_tecnico,
                a.custo_extra_materiais,
                a.descricao_materiais_extras,
                a.data_finalizacao,
                a.atualizado_em,
                a.criado_em,
                (CASE 
                    WHEN a.data_entrega < CURRENT_DATE AND a.status_producao NOT IN ('pronto', 'entregue') 
                    THEN true 
                    ELSE false 
                END) AS esta_atrasado,
                o.cliente,
                o.nome_produto,
                o.preco_venda
            FROM atualizada a
            INNER JOIN public.orcamentos o ON o.id = a.orcamento_id;
        `;
        const values = [
            dados.data_entrega || null,
            dados.responsaveis_execucao || null,
            dados.observacoes || null,
            dados.laudo_tecnico || null,
            Number(dados.custo_extra_materiais) || 0,
            dados.descricao_materiais_extras || null,
            dados.data_finalizacao || null,
            id
        ];

        const result = await db.query(query, values);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return result.rows[0];
    }

    async excluir(id: number): Promise<boolean> {
        const query = 'DELETE FROM public.ordens_servico WHERE id = $1';
        const result = await db.query(query, [id]);
        if (result.rowCount === 0) throw new Error('Ordem de Serviço não encontrada.');
        return true;
    }
}