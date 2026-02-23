import { pool } from './db';

interface CriarOrcamentoDTO {
    cliente?: string;
    nomeProduto: string;
    custoMercadoria: number;
    tempoGasto: number;
    lucroPct: number;
    impostoPct: number;
}

export class OrcamentoService {

    // --- 1. LÓGICA DE CÁLCULO (Motor Financeiro) ---
    // Aqui corrigimos as queries para bater com o banco_dados.sql
    private async calcularValores(dados: CriarOrcamentoDTO) {
        
        // A. CÁLCULO DA TAXA DE CUSTO FIXO (Financeiro)
        // Busca despesas ativas
        const despesasRes = await pool.query("SELECT SUM(valor) as total FROM despesas_fixas WHERE ativo = true");
        // Busca o último faturamento lançado (ordenado por ano/mês)
        const fatRes = await pool.query("SELECT valor FROM faturamentos_mensais ORDER BY ano DESC, mes DESC LIMIT 1");
        
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;
        const faturamento = Number(fatRes.rows[0]?.valor) || 1; // Evita divisão por zero
        
        // Fórmula: (Despesas / Faturamento) * 100
        const custoFixoPct = (totalDespesas / faturamento) * 100;

        // B. CÁLCULO DO CUSTO DA MÃO DE OBRA (Custo de Obra)
        // Soma apenas funcionários da PRODUÇÃO ativos
        const funcRes = await pool.query("SELECT SUM(custo_total_mensal) as total FROM funcionarios WHERE ativo = true AND setor = 'producao'");
        const configRes = await pool.query("SELECT * FROM configuracao_producao LIMIT 1");
        
        const totalSalarios = Number(funcRes.rows[0]?.total) || 0;
        const config = configRes.rows[0];

        // Define o divisor de tempo (Horas ou Dias) baseado na configuração
        let tempoDisponivel = 1;
        if (config.tipo_tempo === 'horas') {
            tempoDisponivel = Number(config.horas_trabalhadas_dia) * 22; // Ex: 176h mensais
        } else {
            tempoDisponivel = Number(config.dias_trabalhados_mes); // Ex: 20 dias
        }

        // Divisor Final = Tempo x Capacidade (Qtd Equipes ou Pessoas)
        const capacidade = Number(config.qtd_unidades) || 1;
        const divisorMO = tempoDisponivel * capacidade;
        
        // Preço unitário (R$/hora ou R$/dia)
        const custoUnitarioMO = divisorMO > 0 ? totalSalarios / divisorMO : 0;

        // C. CÁLCULO DO PREÇO DE VENDA (Markup Divisor)
        const custoMaoDeObraTotal = custoUnitarioMO * dados.tempoGasto;
        const custoProducao = dados.custoMercadoria + custoMaoDeObraTotal;
        
        // Soma das taxas (Custo Fixo + Lucro + Imposto)
        const somaTaxasPct = custoFixoPct + dados.lucroPct + dados.impostoPct;
        
        // O famoso "Divisor" (1 - taxas)
        const divisorMarkup = 1 - (somaTaxasPct / 100);

        if (divisorMarkup <= 0) {
            throw new Error("Atenção: A soma das taxas (Lucro + Imposto + Custo Fixo) ultrapassa 100%. Impossível precificar.");
        }

        const precoVenda = custoProducao / divisorMarkup;

        return {
            custoFixoPct,
            custoUnitarioMO,
            custoMaoDeObraTotal,
            precoVenda
        };
    }

    // --- 2. MÉTODOS CRUD ---

    async criarOrcamento(dados: CriarOrcamentoDTO) {
        const calculo = await this.calcularValores(dados);

        const query = `
            INSERT INTO orcamentos (
                cliente, nome_produto, custo_mercadoria, tempo_gasto, lucro_desejado_pct, imposto_pct,
                custo_fixo_pct_snapshot, custo_mao_obra_unitario, custo_mao_obra_total, preco_venda
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            dados.cliente || 'Consumidor Final',
            dados.nomeProduto, 
            dados.custoMercadoria, 
            dados.tempoGasto, 
            dados.lucroPct, 
            dados.impostoPct,
            calculo.custoFixoPct.toFixed(2), 
            calculo.custoUnitarioMO.toFixed(2), 
            calculo.custoMaoDeObraTotal.toFixed(2), 
            calculo.precoVenda.toFixed(2)
        ];

        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }

    async listarOrcamentos() {
        // Mapeamos os nomes do banco (snake_case) para o frontend (camelCase ou amigável)
        const query = `
            SELECT 
                id,
                cliente,
                nome_produto, 
                custo_mercadoria as custo_materiais, 
                tempo_gasto as horas_trabalhadas, 
                lucro_desejado_pct as lucro_desejado, 
                imposto_pct as imposto, 
                custo_fixo_pct_snapshot as taxa_fixa_snapshot,
                preco_venda,
                criado_em
            FROM orcamentos 
            ORDER BY id DESC
        `;
        const res = await pool.query(query);
        return res.rows;
    }

    async atualizarOrcamento(id: number, dados: CriarOrcamentoDTO) {
        const calculo = await this.calcularValores(dados);

        const query = `
            UPDATE orcamentos SET
                cliente = $1,
                nome_produto = $2,
                custo_mercadoria = $3,
                tempo_gasto = $4,
                lucro_desejado_pct = $5,
                imposto_pct = $6,
                custo_fixo_pct_snapshot = $7,
                custo_mao_obra_unitario = $8,
                custo_mao_obra_total = $9,
                preco_venda = $10
            WHERE id = $11
            RETURNING *
        `;
        
        const values = [
            dados.cliente,
            dados.nomeProduto, 
            dados.custoMercadoria, 
            dados.tempoGasto, 
            dados.lucroPct, 
            dados.impostoPct,
            calculo.custoFixoPct.toFixed(2), 
            calculo.custoUnitarioMO.toFixed(2), 
            calculo.custoMaoDeObraTotal.toFixed(2), 
            calculo.precoVenda.toFixed(2),
            id
        ];

        const resultado = await pool.query(query, values);
        return resultado.rows[0];
    }

    async deletarOrcamento(id: number) {
        await pool.query('DELETE FROM orcamentos WHERE id = $1', [id]);
        return { message: 'Orçamento excluído com sucesso.' };
    }
}