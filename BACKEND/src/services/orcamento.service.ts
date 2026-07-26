import { pool as db } from './db';

// Tipagem estrita para o Payload
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
    
    // --- NOVA LÓGICA: Busca a taxa oficial salva no último snapshot financeiro ---
    async obterTaxaFixoAtual(): Promise<number> {
        const query = `
            SELECT taxa_custo_fixo 
            FROM public.snapshots_financeiros 
            ORDER BY criado_em DESC 
            LIMIT 1;
        `;
        const result = await db.query(query);
        
        if (result.rows.length > 0 && result.rows[0].taxa_custo_fixo != null) {
            return Number(result.rows[0].taxa_custo_fixo);
        }
        return 0; // Fallback seguro caso o financeiro nunca tenha sido salvo
    }

    async listarCenariosMaoObra() {
        const query = `
            SELECT 
                id,
                titulo,
                valor_unitario_final AS "valorUnitario",
                configuracao_usada->>'tipo' AS "unidade"
            FROM public.historico_custo_obra
            ORDER BY data_alteracao DESC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async listarOrcamentos() {
        const query = `
            SELECT 
                id,
                cliente,
                nome_produto,
                custo_mercadoria AS custo_materiais,
                tempo_gasto AS horas_trabalhadas,
                lucro_desejado_pct AS lucro_desejado,
                imposto_pct AS imposto,
                custo_fixo_pct_snapshot AS taxa_fixa_snapshot,
                custo_mao_obra_unitario,
                custo_mao_obra_total,
                preco_venda,
                criado_em,
                id_cenario_mo
            FROM public.orcamentos
            ORDER BY criado_em DESC;
        `;
        const result = await db.query(query);
        return result.rows;
    }

    // LÓGICA DE NEGÓCIO: Cálculo 100% no Backend
    private async calcularPrecoVenda(dados: IOrcamentoPayload): Promise<{ precoVenda: number, taxaFixa: number, custoMaoObraTotal: number }> {
        
        // Reutiliza a função recém-criada (Código Limpo/DRY)
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
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, dados.idCenarioMo || null
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
            dados.idCenarioMo || null, id
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