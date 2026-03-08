import { pool } from './db';

interface CriarOrcamentoDTO {
    cliente?: string;
    nomeProduto: string;
    custoMercadoria: number;
    tempoGasto: number;
    lucroPct: number;
    impostoPct: number;
    valorHoraSelecionado?: number; 
}

export class OrcamentoService {

    // --- 1. LÓGICA DE CÁLCULO (Motor Financeiro) ---
    private async calcularValores(dados: CriarOrcamentoDTO) {
        
        // A. CÁLCULO DA TAXA DE CUSTO FIXO (Filtrado pelo Mês/Ano do último Faturamento)
        const fatRes = await pool.query("SELECT mes, ano, valor FROM faturamentos_mensais ORDER BY ano DESC, mes DESC LIMIT 1");
        const faturamentoData = fatRes.rows[0];
        const faturamento = Number(faturamentoData?.valor) || 1; // Evita divisão por zero
        
        // Pega o mês e ano do faturamento para filtrar as despesas iguais à tela de Dashboard
        const mesFiltro = faturamentoData?.mes || new Date().getMonth() + 1;
        const anoFiltro = faturamentoData?.ano || new Date().getFullYear();

        const despesasRes = await pool.query(`
            SELECT SUM(valor) as total 
            FROM despesas_fixas 
            WHERE ativo = true 
            AND EXTRACT(MONTH FROM CAST(data_vencimento AS DATE)) = $1 
            AND EXTRACT(YEAR FROM CAST(data_vencimento AS DATE)) = $2
        `, [mesFiltro, anoFiltro]);
        
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;
        const custoFixoPct = (totalDespesas / faturamento) * 100;

        // B. CÁLCULO DO CUSTO DA MÃO DE OBRA (Custo de Obra)
        let custoUnitarioMO = 0;

        // SE o frontend enviou o valor do Dropdown, nós usamos ele!
        if (dados.valorHoraSelecionado && dados.valorHoraSelecionado > 0) {
            custoUnitarioMO = dados.valorHoraSelecionado;
        } else {
            // FALLBACK: Se não enviou, calcula com base nos funcionários ativos hoje
            const funcRes = await pool.query("SELECT SUM(custo_total_mensal) as total FROM funcionarios WHERE ativo = true AND setor = 'producao'");
            const configRes = await pool.query("SELECT * FROM configuracao_producao LIMIT 1");
            
            const totalSalarios = Number(funcRes.rows[0]?.total) || 0;
            const config = configRes.rows[0];

            let tempoDisponivel = 1;
            if (config?.tipo_tempo === 'horas') {
                tempoDisponivel = Number(config.horas_trabalhadas_dia) * 22; 
            } else if (config) {
                tempoDisponivel = Number(config.dias_trabalhados_mes); 
            }

            const capacidade = Number(config?.qtd_unidades) || 1;
            const divisorMO = tempoDisponivel * capacidade;
            custoUnitarioMO = divisorMO > 0 ? totalSalarios / divisorMO : 0;
        }

        // C. CÁLCULO DO PREÇO DE VENDA (Markup Divisor)
        const custoMaoDeObraTotal = custoUnitarioMO * dados.tempoGasto;
        const custoProducao = dados.custoMercadoria + custoMaoDeObraTotal;
        
        const somaTaxasPct = custoFixoPct + dados.lucroPct + dados.impostoPct;
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

    // --- 3. BUSCAR CENÁRIOS PARA O DROPDOWN (100% DINÂMICO JSONB) ---
    async listarCenariosMaoObra() {
        try {
            // Usamos configuracao_usada->>'tipo' para ler o JSON direto no banco de dados
            const query = `
                SELECT 
                    id, 
                    titulo, 
                    valor_unitario_final as "valorUnitario",
                    configuracao_usada->>'tipo' as unidade
                FROM historico_custo_obra 
                ORDER BY id DESC
            `;
            const res = await pool.query(query);
            
            return res.rows.map(row => ({
                id: row.id,
                titulo: row.titulo,
                valorUnitario: Number(row.valorUnitario),
                // Puxa exatamente o que estava no JSON (dias ou horas).
                unidade: row.unidade ? row.unidade : 'unid.' 
            }));
            
        } catch (error) {
            console.error("Erro ao buscar histórico extraindo do JSON:", error);
            // Retorna array vazio para não quebrar a tela em caso de falha
            return []; 
        }
    }
}