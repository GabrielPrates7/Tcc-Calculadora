import { pool } from './db';

interface CriarOrcamentoDTO {
    nomeProduto: string;
    custoMercadoria: number;
    tempoGasto: number;
    lucroPct: number;
    impostoPct: number;
}

export class OrcamentoService {

    // --- LÓGICA DE CÁLCULO (Reutilizável) ---
    private async calcularValores(dados: CriarOrcamentoDTO) {
        // 1. CUSTO FIXO (%)
        const despesasRes = await pool.query('SELECT SUM(valor) as total FROM despesas_fixas');
        const fatRes = await pool.query('SELECT valor_mensal FROM faturamento LIMIT 1');
        
        const totalDespesas = Number(despesasRes.rows[0].total) || 0;
        const faturamento = Number(fatRes.rows[0].valor_mensal) || 1;
        const custoFixoPct = (totalDespesas / faturamento) * 100;

        // 2. CUSTO MÃO DE OBRA (UNITÁRIO)
        const funcRes = await pool.query('SELECT SUM(custo_total_mensal) as total FROM funcionarios');
        const configRes = await pool.query('SELECT * FROM configuracao_producao LIMIT 1');
        
        const totalSalarios = Number(funcRes.rows[0].total) || 0;
        const config = configRes.rows[0];
        const divisorMO = (Number(config.qtd_tempo) * Number(config.qtd_equipes)) || 1;
        const custoUnitarioMO = totalSalarios / divisorMO;

        // 3. CÁLCULO FINAL
        const custoMaoDeObraTotal = custoUnitarioMO * dados.tempoGasto;
        const custoProducao = dados.custoMercadoria + custoMaoDeObraTotal;
        const somaTaxasPct = custoFixoPct + dados.lucroPct + dados.impostoPct;
        const divisorMarkup = 1 - (somaTaxasPct / 100);

        if (divisorMarkup <= 0) {
            throw new Error("As taxas somadas ultrapassam 100%.");
        }

        const precoVenda = custoProducao / divisorMarkup;

        return {
            custoFixoPct,
            custoUnitarioMO,
            custoMaoDeObraTotal,
            precoVenda
        };
    }

    // --- CRUD ---

    async criarOrcamento(dados: CriarOrcamentoDTO) {
        const calculo = await this.calcularValores(dados);

        const query = `
            INSERT INTO orcamentos (
                nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct,
                custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto, dados.lucroPct, dados.impostoPct,
            calculo.custoFixoPct.toFixed(2), calculo.custoUnitarioMO.toFixed(2), 
            calculo.custoMaoDeObraTotal.toFixed(2), calculo.precoVenda.toFixed(2)
        ];

        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }

    async listarOrcamentos() {
        const res = await pool.query('SELECT * FROM orcamentos ORDER BY criado_em DESC');
        return res.rows;
    }

    // --- NOVO: DELETE ---
    async deletarOrcamento(id: number) {
        await pool.query('DELETE FROM orcamentos WHERE id = $1', [id]);
        return { message: 'Deletado com sucesso' };
    }

    // --- NOVO: UPDATE ---
    async atualizarOrcamento(id: number, dados: CriarOrcamentoDTO) {
        const calculo = await this.calcularValores(dados);

        const query = `
            UPDATE orcamentos 
            SET nome_produto=$1, custo_mercadoria=$2, tempo_gasto=$3, lucro_desejado_pct=$4, imposto_pct=$5,
                custo_fixo_pct_snapshot=$6, custo_mao_obra_unitario=$7, custo_mao_obra_total=$8, preco_venda=$9
            WHERE id=$10
            RETURNING *
        `;
        const values = [
            dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto, dados.lucroPct, dados.impostoPct,
            calculo.custoFixoPct.toFixed(2), calculo.custoUnitarioMO.toFixed(2), 
            calculo.custoMaoDeObraTotal.toFixed(2), calculo.precoVenda.toFixed(2),
            id
        ];

        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }
}