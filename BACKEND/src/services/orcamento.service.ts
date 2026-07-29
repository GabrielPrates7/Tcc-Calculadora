import { pool as db } from './db';

export interface IOrcamentoPayload {
    cliente: string;
    nomeProduto: string;
    custoMercadoria: number;
    tempoGasto: number;
    lucroPct: number;
    impostoPct: number;
    valorHoraSelecionado: number;
    idCenarioMo?: number | null;
}

export class OrcamentoService {
    
    // TAXA FIXA: Mantida impecável e sincronizada com a tela do Financeiro
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

    // CORREÇÃO CRÍTICA: Apontando para a tabela 'obras' onde os dados reais estão salvos
    async listarCenariosMaoObra() {
        const query = `
            SELECT 
                id,
                titulo || ' (' || cliente || ')' AS titulo,
                CAST(custo_total_estimado AS numeric(10,2)) AS "valorUnitario",
                'total da obra' AS "unidade"
            FROM public.obras
            ORDER BY criado_em DESC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async listarOrcamentos() {
        const query = `
            SELECT 
                id, cliente, nome_produto, custo_mercadoria AS custo_materiais,
                tempo_gasto AS horas_trabalhadas, lucro_desejado_pct AS lucro_desejado,
                imposto_pct AS imposto, custo_fixo_pct_snapshot AS taxa_fixa_snapshot,
                custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, criado_em, id_cenario_mo
            FROM public.orcamentos
            ORDER BY criado_em DESC;
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
            throw new Error("A soma das taxas (Fixo + Lucro + Imposto) ultrapassa 100%. Cálculo impossível.");
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
            dados.cliente, dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto,
            dados.lucroPct, dados.impostoPct, calculo.taxaFixa, 
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, 
            null // Bypass da constraint de Chave Estrangeira
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
            dados.cliente, dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto,
            dados.lucroPct, dados.impostoPct, calculo.taxaFixa, 
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, 
            null, // Bypass da constraint de Chave Estrangeira
            id
        ];

        const result = await db.query(query, values);
        if (result.rowCount === 0) throw new Error("Orçamento não encontrado.");
        return result.rows[0];
    }

    async deletarOrcamento(id: number) {
        const query = `DELETE FROM public.orcamentos WHERE id = $1`;
        await db.query(query, [id]);
        return true;
    }
}