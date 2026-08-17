import { pool } from './db';

interface TotalRow { total: string | number | null; }
interface FaturamentoRow { valor: string | number; }
interface GraficoRow { mes_abreviado: string; receita_prevista: number; receita_realizada: number; }
interface ProdutividadeRow { mes_abreviado: string; criadas: number; finalizadas: number; }

export class DashboardService {
    async getResumo(mes: number, ano: number, empresa_id: number) {
        // 1. Faturamento Base
        const fatRes = await pool.query<FaturamentoRow>(
            "SELECT valor FROM faturamentos_mensais WHERE mes = $1 AND ano = $2 AND empresa_id = $3 LIMIT 1",
            [mes, ano, empresa_id]
        );
        const faturamentoBase = Number(fatRes.rows[0]?.valor) || 0;

        // 2. Custo Operacional Total Estrito (Histórico)
        const despesasRes = await pool.query<TotalRow>(`
            SELECT SUM(valor) as total FROM despesas_fixas 
            WHERE EXTRACT(MONTH FROM data_vencimento) = $1 
            AND EXTRACT(YEAR FROM data_vencimento) = $2
            AND empresa_id = $3
        `, [mes, ano, empresa_id]);
        const totalDespesasFixas = Number(despesasRes.rows[0]?.total) || 0;

        // 2.1 Custo Folha (Sincronizado estritamente com a Gestão de Equipe)
        const folhaRes = await pool.query<TotalRow>(`
            SELECT SUM(custo_total_mensal) as total FROM funcionarios 
            WHERE ativo = true
            AND data_admissao < (make_date($2::int, $1::int, 1) + interval '1 month')
            AND empresa_id = $3
        `, [mes, ano, empresa_id]);
        const totalFolha = Number(folhaRes.rows[0]?.total) || 0;

        const invRes = await pool.query<TotalRow>(`
            SELECT SUM(valor) as total FROM investimentos 
            WHERE EXTRACT(MONTH FROM data_vencimento) = $1 
            AND EXTRACT(YEAR FROM data_vencimento) = $2
            AND empresa_id = $3
        `, [mes, ano, empresa_id]);
        const totalInvestimentos = Number(invRes.rows[0]?.total) || 0;

        const custoOperacionalTotal = totalDespesasFixas + totalFolha + totalInvestimentos;

        // Distribuição de Custos para o Gráfico de Rosca
        const distribuicaoCustos = [
            { nome: 'Despesas Fixas', valor: totalDespesasFixas, cor: '#ef4444' }, // Vermelho
            { nome: 'Folha de Pag.', valor: totalFolha, cor: '#f59e0b' },         // Laranja
            { nome: 'Investimentos', valor: totalInvestimentos, cor: '#3b82f6' }     // Azul
        ].filter(item => item.valor > 0);

        // 3. Taxa de Custo Fixo
        const taxaCustoFixo = faturamentoBase > 0 ? (totalDespesasFixas / faturamentoBase) * 100 : 0;

        // 4. Receita Realizada Estrita e Ticket Médio
        const receitaRealizadaRes = await pool.query<{ total: string | number | null, qtd: string | number }>(`
            SELECT SUM(valor) as total, COUNT(DISTINCT id) as qtd 
            FROM pagamentos_os 
            WHERE EXTRACT(MONTH FROM data_pagamento) = $1 
            AND EXTRACT(YEAR FROM data_pagamento) = $2
            AND empresa_id = $3
        `, [mes, ano, empresa_id]);
        
        const receitaRealizada = Number(receitaRealizadaRes.rows[0]?.total) || 0;
        const qtdPagamentos = Number(receitaRealizadaRes.rows[0]?.qtd) || 0;
        const ticketMedio = qtdPagamentos > 0 ? (receitaRealizada / qtdPagamentos) : 0;

        // 5. Receita Prevista Estrita
        const receitaPrevistaRes = await pool.query<TotalRow>(`
            SELECT SUM(orc.preco_venda) as total
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 
            AND EXTRACT(YEAR FROM os.criado_em) = $2
            AND os.status_financeiro != 'cancelado'
            AND os.empresa_id = $3
        `, [mes, ano, empresa_id]);
        const receitaPrevista = Number(receitaPrevistaRes.rows[0]?.total) || 0;

        // 6. Funil de Produção Filtrado
        const funilRes = await pool.query(`
            SELECT status_producao, COUNT(*) as quantidade 
            FROM ordens_servico 
            WHERE EXTRACT(MONTH FROM criado_em) = $1 
            AND EXTRACT(YEAR FROM criado_em) = $2
            AND empresa_id = $3
            GROUP BY status_producao
        `, [mes, ano, empresa_id]);
        
        const funil = { fila: 0, andamento: 0, concluido: 0, entregue: 0 };
        funilRes.rows.forEach((row: any) => {
            if (row.status_producao === 'fila') funil.fila += Number(row.quantidade);
            if (row.status_producao === 'andamento' || row.status_producao === 'producao') funil.andamento += Number(row.quantidade);
            if (row.status_producao === 'concluido' || row.status_producao === 'pronto') funil.concluido += Number(row.quantidade);
            if (row.status_producao === 'entregue') funil.entregue += Number(row.quantidade);
        });

        // 7. Painel de O.S. em Destaque
        const urgentesRes = await pool.query(`
            SELECT os.id, orc.cliente, os.data_entrega as info_secundaria, os.status_producao
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE os.status_producao NOT IN ('concluido', 'pronto', 'entregue') 
            AND os.data_entrega IS NOT NULL
            AND EXTRACT(MONTH FROM os.data_entrega) = $1 
            AND EXTRACT(YEAR FROM os.data_entrega) = $2
            AND os.empresa_id = $3
            ORDER BY os.data_entrega ASC LIMIT 4
        `, [mes, ano, empresa_id]);

        const maiorValorRes = await pool.query(`
            SELECT os.id, orc.cliente, orc.preco_venda as info_secundaria, os.status_producao
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 
            AND EXTRACT(YEAR FROM os.criado_em) = $2
            AND os.status_financeiro != 'cancelado'
            AND os.empresa_id = $3
            ORDER BY orc.preco_venda DESC NULLS LAST LIMIT 4
        `, [mes, ano, empresa_id]);

        const recentesRes = await pool.query(`
            SELECT os.id, orc.cliente, os.criado_em as info_secundaria, os.status_producao
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 
            AND EXTRACT(YEAR FROM os.criado_em) = $2
            AND os.empresa_id = $3
            ORDER BY os.criado_em DESC LIMIT 4
        `, [mes, ano, empresa_id]);

        // 8. Gráfico Histórico Financeiro
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
                    AND os.empresa_id = $3
                ), 0) AS receita_prevista,
                COALESCE((
                    SELECT SUM(valor)
                    FROM pagamentos_os p
                    WHERE date_trunc('month', p.data_pagamento) = m.mes_data
                    AND p.empresa_id = $3
                ), 0) AS receita_realizada
            FROM meses m
            ORDER BY m.mes_data ASC;
        `, [mes, ano, empresa_id]);

        // 9. Gráfico Histórico de Produtividade Fabril
        const produtividadeRes = await pool.query<ProdutividadeRow>(`
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
                    SELECT COUNT(*) FROM ordens_servico os 
                    WHERE date_trunc('month', os.criado_em) = m.mes_data
                    AND os.empresa_id = $3
                ), 0)::int AS criadas,
                COALESCE((
                    SELECT COUNT(*) FROM ordens_servico os 
                    WHERE date_trunc('month', os.data_entrega) = m.mes_data 
                    AND os.status_producao IN ('pronto', 'concluido', 'entregue')
                    AND os.empresa_id = $3
                ), 0)::int AS finalizadas
            FROM meses m
            ORDER BY m.mes_data ASC;
        `, [mes, ano, empresa_id]);

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
            })),
            graficoProdutividade: produtividadeRes.rows.map(row => ({
                mes: row.mes_abreviado,
                criadas: Number(row.criadas),
                finalizadas: Number(row.finalizadas)
            })),
            distribuicaoCustos
        };
    }
}