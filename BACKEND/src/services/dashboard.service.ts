import { pool } from './db';

export class DashboardService {
    async getResumo() {
        const fatRes = await pool.query(
            "SELECT valor FROM faturamentos_mensais ORDER BY ano DESC, mes DESC LIMIT 1"
        );
        const faturamento = Number(fatRes.rows[0]?.valor) || 1;

        const mesAtual = new Date().getMonth() + 1;
        const anoAtual = new Date().getFullYear();

        const despesasRes = await pool.query(`
            SELECT SUM(valor) as total 
            FROM despesas_fixas 
            WHERE ativo = true
        `);
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;
        const taxaCustoFixo = (totalDespesas / faturamento) * 100;

        const receitaRes = await pool.query(`
            SELECT 
                SUM(orc.preco_venda) as receita_total,
                SUM(orc.preco_venda * (orc.lucro_desejado_pct / 100)) as lucro_projetado
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            WHERE EXTRACT(MONTH FROM os.criado_em) = $1 
            AND EXTRACT(YEAR FROM os.criado_em) = $2
            AND os.status_financeiro != 'cancelado'
        `, [mesAtual, anoAtual]);

        const receitaMes = Number(receitaRes.rows[0]?.receita_total) || 0;
        const lucroMes = Number(receitaRes.rows[0]?.lucro_projetado) || 0;

        const funilRes = await pool.query(`
            SELECT status_producao, COUNT(*) as quantidade 
            FROM ordens_servico 
            GROUP BY status_producao
        `);

        const funil = { fila: 0, andamento: 0, concluido: 0 };
        funilRes.rows.forEach((row: any) => {
            if (row.status_producao === 'fila') funil.fila = Number(row.quantidade);
            if (row.status_producao === 'andamento') funil.andamento = Number(row.quantidade);
            if (row.status_producao === 'concluido') funil.concluido = Number(row.quantidade);
        });

        // NOVO: Funções que mais consomem orçamento
        const topCustosRes = await pool.query(`
            SELECT f.nome as funcao, SUM(orh.horas_estimadas * orh.custo_hora_aplicado * orh.qtd_profissionais) as custo_total
            FROM obra_recursos_humanos orh
            INNER JOIN funcoes f ON orh.funcao_id = f.id
            GROUP BY f.nome
            ORDER BY custo_total DESC
            LIMIT 4
        `);

        const topCustos = topCustosRes.rows.map((row: any) => ({
            funcao: row.funcao,
            custo_total: Number(row.custo_total) || 0
        }));

        return {
            indicadores: {
                taxaCustoFixo,
                faturamentoBase: faturamento,
                totalDespesas,
                receitaMes,
                lucroMes
            },
            funilProducao: funil,
            topCustos
        };
    }
}