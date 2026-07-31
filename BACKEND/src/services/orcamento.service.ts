import { pool as db } from './db';

export interface IOrcamentoPayload {
    cliente?: string;
    nomeProduto: string;
    custoMercadoria: number;
    tempoGasto: number;
    lucroPct: number;
    impostoPct: number;
    valorHoraSelecionado: number;
    idCenarioMo?: number | null;
}

export interface ICenarioMaoObraDTO {
    id: number;
    titulo: string;
    valorUnitario: number;
    unidade: string;
    tipoTempo: string;
    dataCriacao: string;
}

export class OrcamentoService {
    
    async obterTaxaFixoAtual(): Promise<number> {
        const query = `
            WITH despesas AS (
                SELECT COALESCE(SUM(valor), 0) AS total 
                FROM public.despesas_fixas 
                WHERE ativo = true
            ),
            faturamento AS (
                SELECT COALESCE(valor, 1) AS total 
                FROM public.faturamentos_mensais 
                WHERE valor > 100
                ORDER BY ano DESC, mes DESC 
                LIMIT 1
            )
            SELECT ROUND((d.total / GREATEST(f.total, 1)) * 100, 2) AS taxa_atual
            FROM despesas d CROSS JOIN faturamento f;
        `;
        const result = await db.query(query);
        return result.rows.length > 0 ? Number(result.rows[0].taxa_atual) : 0;
    }

    async listarCenariosMaoObra(): Promise<ICenarioMaoObraDTO[]> {
        const query = `
            WITH FolhaProducao AS (
                SELECT COALESCE(SUM(custo_total_mensal), 0) AS custo_folha
                FROM public.funcionarios 
                WHERE ativo = true AND setor ILIKE 'producao'
            ),
            ConfigAtual AS (
                SELECT 
                    COALESCE(dias_trabalhados_mes, 22) AS dias_trabalhados_mes,
                    COALESCE(horas_trabalhadas_dia, 8) AS horas_trabalhadas_dia,
                    COALESCE(qtd_unidades, 1) AS qtd_unidades,
                    COALESCE(tipo_tempo, 'horas') AS tipo_tempo
                FROM public.configuracao_producao 
                LIMIT 1
            ),
            CenarioTempoReal AS (
                SELECT 
                    0 AS id,
                    'Configuração Atual (Tempo Real)' AS titulo,
                    ROUND(
                        (f.custo_folha / GREATEST(
                            (c.dias_trabalhados_mes * 
                            CASE WHEN c.tipo_tempo = 'horas' THEN c.horas_trabalhadas_dia ELSE 1 END * 
                            GREATEST(c.qtd_unidades, 1)), 1
                        )), 2
                    )::numeric(10,2) AS "valorUnitario",
                    'total da obra' AS "unidade",
                    c.tipo_tempo AS "tipoTempo",
                    TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS "dataCriacao"
                FROM FolhaProducao f CROSS JOIN ConfigAtual c
            ),
            CenariosHistorico AS (
                SELECT 
                    (h.id + 100000) AS id,
                    COALESCE(h.titulo, 'Cenário #' || h.id) AS titulo,
                    CAST(h.valor_unitario_final AS numeric(10,2)) AS "valorUnitario",
                    'horas' AS "unidade",
                    COALESCE(h.configuracao_usada->>'tipo_tempo', h.configuracao_usada->>'tipo', 'horas') AS "tipoTempo",
                    TO_CHAR(h.data_alteracao, 'YYYY-MM-DD') AS "dataCriacao"
                FROM public.historico_custo_obra h
                WHERE h.valor_unitario_final IS NOT NULL
            ),
            CenariosObras AS (
                SELECT 
                    o.id,
                    o.titulo || COALESCE(' (' || o.cliente || ')', '') AS titulo,
                    CAST(o.custo_total_estimado AS numeric(10,2)) AS "valorUnitario",
                    'total da obra' AS "unidade",
                    COALESCE((SELECT c.tipo_tempo FROM public.configuracao_producao c LIMIT 1), 'horas') AS "tipoTempo",
                    TO_CHAR(o.criado_em, 'YYYY-MM-DD') AS "dataCriacao"
                FROM public.obras o
                WHERE o.custo_total_estimado IS NOT NULL
            )
            SELECT * FROM CenariosObras
            UNION ALL
            SELECT * FROM CenariosHistorico
            UNION ALL
            SELECT * FROM CenarioTempoReal
            ORDER BY id DESC;
        `;
        const result = await db.query(query);
        return result.rows.map(row => ({
            id: Number(row.id),
            titulo: String(row.titulo),
            valorUnitario: Number(row.valorUnitario),
            unidade: String(row.unidade),
            tipoTempo: String(row.tipoTempo),
            dataCriacao: String(row.dataCriacao)
        }));
    }

    async listarOrcamentos() {
        const query = `
            SELECT 
                id, cliente, nome_produto, custo_mercadoria AS custo_materiais,
                tempo_gasto AS horas_trabalhadas, lucro_desejado_pct AS lucro_desejado,
                imposto_pct AS imposto, custo_fixo_pct_snapshot AS taxa_fixa_snapshot,
                custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, 
                TO_CHAR(criado_em, 'YYYY-MM-DD') AS criado_em, id_cenario_mo
            FROM public.orcamentos
            ORDER BY id DESC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    private async calcularPrecoVenda(dados: IOrcamentoPayload): Promise<{ precoVenda: number, taxaFixa: number, custoMaoObraTotal: number }> {
        const taxaFixa = await this.obterTaxaFixoAtual();
        const custoMaoObraTotal = dados.tempoGasto * dados.valorHoraSelecionado;
        const custoProducao = dados.custoMercadoria + custoMaoObraTotal;

        const somaPorcentagens = taxaFixa + dados.lucroPct + dados.impostoPct;
        const divisor = 1 - (somaPorcentagens / 100);

        if (divisor <= 0) {
            throw new Error("A soma das taxas (Fixo + Lucro + Imposto) excede 100%. Divisor inválido.");
        }

        const precoVenda = custoProducao / divisor;
        return { precoVenda, taxaFixa, custoMaoObraTotal };
    }

    async criarOrcamento(dados: IOrcamentoPayload) {
        const calculo = await this.calcularPrecoVenda(dados);
        const query = `
            INSERT INTO public.orcamentos (
                cliente, nome_produto, custo_mercadoria, tempo_gasto, 
                lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, 
                custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, id_cenario_mo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            dados.cliente || null, dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto,
            dados.lucroPct, dados.impostoPct, calculo.taxaFixa, 
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, 
            dados.idCenarioMo || null
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async atualizarOrcamento(id: number, dados: IOrcamentoPayload) {
        const calculo = await this.calcularPrecoVenda(dados);
        const query = `
            UPDATE public.orcamentos
            SET cliente = $1, nome_produto = $2, custo_mercadoria = $3, tempo_gasto = $4,
                lucro_desejado_pct = $5, imposto_pct = $6, custo_fixo_pct_snapshot = $7,
                custo_mao_obra_unitario = $8, custo_mao_obra_total = $9, preco_venda = $10, id_cenario_mo = $11
            WHERE id = $12
            RETURNING *;
        `;
        const values = [
            dados.cliente || null, dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto,
            dados.lucroPct, dados.impostoPct, calculo.taxaFixa, 
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, 
            dados.idCenarioMo || null,
            id
        ];
        const result = await db.query(query, values);
        if (result.rowCount === 0) throw new Error("Orçamento não encontrado para atualização.");
        return result.rows[0];
    }

    async deletarOrcamento(id: number): Promise<boolean> {
        const query = `DELETE FROM public.orcamentos WHERE id = $1`;
        await db.query(query, [id]);
        return true;
    }
}