import { pool } from './db';

interface TotalRow { total: string | number | null; }
interface FaturamentoRow { valor: string | number; }
interface GraficoRow { mes_abreviado: string; receita_prevista: number; receita_realizada: number; }

export class DashboardService {
    async getResumo(mes: number, ano: number) {
        // 1. Faturamento Base
        const fatRes = await pool.query<FaturamentoRow>(
            "SELECT valor FROM faturamentos_mensais WHERE mes = $1 AND ano = $2 LIMIT 1",
            [mes, ano]
        );
        const faturamentoBase = Number(fatRes.rows[0]?.valor) || 0;

        // 2. Custo Operacional Total Estrito (Histórico)
        const despesasRes = await pool.query<TotalRow>(`
            SELECT SUM(valor) as total FROM despesas_fixas 
            WHERE EXTRACT(MONTH FROM data_vencimento) = $1 AND EXTRACT(YEAR FROM data_vencimento) = $2
        `, [mes, ano]);
        const totalDespesasFixas = Number(despesasRes.rows[0]?.total) || 0;

        const folhaRes = await pool.query<TotalRow>(`
            SELECT SUM(custo_total_mensal) as total FROM funcionarios 
            WHERE data_admissao < (make_date($2::int, $1::int, 1) + interval '1 month')
            AND (data_inativacao IS NULL OR data_inativacao >= make_date($2::int, $1::int, 1))
        `, [mes, ano]);
        const totalFolha = Number(folhaRes.rows[0]?.total) || 0;

        const invRes = await pool.query<TotalRow>(`
            SELECT SUM(valor) as total FROM investimentos 
            WHERE EXTRACT(MONTH FROM data_vencimento) = $1 AND EXTRACT(YEAR FROM data_vencimento) = $2
        `, [mes, ano]);
        const totalInvestimentos = Number(invRes.rows[0]?.total) || 0;

        const custoOperacionalTotal = totalDespesasFixas + totalFolha + totalInvestimentos;

        // 3. Taxa de Custo Fixo
        const taxaCustoFixo = faturamentoBase > 0 ? (totalDespesasFixas / faturamentoBase) * 100 : 0;

        // 4. Receita Realizada Estrita e Ticket Médio
        const receitaRealizadaRes = await pool.query<{ total: string | number | null, qtd: string | number }>(`
            SELECT SUM(valor) as total, COUNT(DISTINCT id) as qtd 
            FROM pagamentos_os 
            WHERE EXTRACT(MONTH FROM data_pagamento) = $1 AND EXTRACT(YEAR FROM data_pagamento) = $2
        `, [mes, ano]);
        
        const receitaRealizada = Number(receitaRealizadaRes.rows[0]?.total) || 0;
        const qtdPagamentos = Number(receitaRealizadaRes.rows[0]?.qtd) || 0;
        
        const ticketMedio = qtdPagamentos > 0 ? (receitaRealizada / qtdPagamentos) : 0;

        // 5. Receita Prevista Estrita
        const receitaPrevistaRes = await pool.query<TotalRow>(`
            SELECT SUM(orc.preco_venda) as total
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 AND EXTRACT(YEAR FROM os.criado_em) = $2
            AND os.status_financeiro != 'cancelado'
        `, [mes, ano]);
        const receitaPrevista = Number(receitaPrevistaRes.rows[0]?.total) || 0;

        // 6. Funil de Produção Filtrado
        const funilRes = await pool.query(`
            SELECT status_producao, COUNT(*) as quantidade 
            FROM ordens_servico 
            WHERE EXTRACT(MONTH FROM criado_em) = $1 AND EXTRACT(YEAR FROM criado_em) = $2
            GROUP BY status_producao
        `, [mes, ano]);
        
        const funil = { fila: 0, andamento: 0, concluido: 0 };
        funilRes.rows.forEach((row: any) => {
            if (row.status_producao === 'fila') funil.fila += Number(row.quantidade);
            if (row.status_producao === 'andamento' || row.status_producao === 'producao') funil.andamento += Number(row.quantidade);
            if (row.status_producao === 'concluido' || row.status_producao === 'pronto') funil.concluido += Number(row.quantidade);
        });

        // 7. Painel de O.S. em Destaque (As 3 Visões)
        const urgentesRes = await pool.query(`
            SELECT os.id, orc.cliente, os.data_entrega as info_secundaria, os.status_producao
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE os.status_producao NOT IN ('concluido', 'pronto') 
            AND os.data_entrega IS NOT NULL
            AND EXTRACT(MONTH FROM os.data_entrega) = $1 
            AND EXTRACT(YEAR FROM os.data_entrega) = $2
            ORDER BY os.data_entrega ASC LIMIT 4
        `, [mes, ano]);

        const maiorValorRes = await pool.query(`
            SELECT os.id, orc.cliente, orc.preco_venda as info_secundaria, os.status_producao
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 AND EXTRACT(YEAR FROM os.criado_em) = $2
            AND os.status_financeiro != 'cancelado'
            ORDER BY orc.preco_venda DESC NULLS LAST LIMIT 4
        `, [mes, ano]);

        const recentesRes = await pool.query(`
            SELECT os.id, orc.cliente, os.criado_em as info_secundaria, os.status_producao
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 AND EXTRACT(YEAR FROM os.criado_em) = $2
            ORDER BY os.criado_em DESC LIMIT 4
        `, [mes, ano]);

        // 8. Gráfico Histórico Dinâmico
        const graficoRes = await pool.query<GraficoRow>(`
            WITH meses AS (
                SELECT generate_series(
                    make_date($2::int, $1::int, 1) - interval '5 months',
                    make_date($2::int, $1::int, 1),
                    '1 month'
                )::date AS mes_data
            )
            SELECT 
                to_char(m.mes_data, 'TMMon') AS mes_abreviado,
                COALESCE((
                    SELECT SUM(orc.preco_venda)
                    FROM ordens_servico os
                    INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
                    WHERE date_trunc('month', os.criado_em) = m.mes_data
                ), 0) AS receita_prevista,
                COALESCE((
                    SELECT SUM(valor)
                    FROM pagamentos_os p
                    WHERE date_trunc('month', p.data_pagamento) = m.mes_data
                ), 0) AS receita_realizada
            FROM meses m
            ORDER BY m.mes_data ASC;
        `, [mes, ano]);

        return {
            indicadores: {
                taxaCustoFixo,
                faturamentoBase,
                custoOperacionalTotal,
                receitaRealizada,
                receitaPrevista,
                ticketMedio,
                qtdPagamentos
            },
            funilProducao: funil,
            ordensDestaque: {
                urgentes: urgentesRes.rows,
                maiorValor: maiorValorRes.rows,
                recentes: recentesRes.rows
            },
            graficoFinanceiro: graficoRes.rows.map(row => ({
                mes: row.mes_abreviado,
                prevista: Number(row.receita_prevista),
                realizada: Number(row.receita_realizada)
            }))
        };
    }
}