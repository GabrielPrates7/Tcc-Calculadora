import { pool } from './db';

export class DashboardService {
    async getResumo() {
        // 1. Taxa de Custo Fixo (cf%)
        const fatRes = await pool.query(
            "SELECT valor, mes, ano FROM faturamentos_mensais ORDER BY ano DESC, mes DESC LIMIT 1"
        );
        const faturamentoData = fatRes.rows[0];
        const faturamento = Number(faturamentoData?.valor) || 1;

        const mesAtual = new Date().getMonth() + 1;
        const anoAtual = new Date().getFullYear();

        const despesasRes = await pool.query(`
            SELECT SUM(valor) as total 
            FROM despesas_fixas 
            WHERE ativo = true
        `);
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;
        const taxaCustoFixo = (totalDespesas / faturamento) * 100;

        // 2. Valor da Unidade Produtiva Atual
        const moRes = await pool.query(
            "SELECT valor_unitario_final FROM historico_custo_obra ORDER BY id DESC LIMIT 1"
        );
        const valorMaoObra = Number(moRes.rows[0]?.valor_unitario_final) || 0;

        // 3. Receita Prevista e Lucro (Mês Atual)
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

        // 4. Funil de Produção
        const funilRes = await pool.query(`
            SELECT status_producao, COUNT(*) as quantidade 
            FROM ordens_servico 
            GROUP BY status_producao
        `);

        const funil = { fila: 0, andamento: 0, concluido: 0 };
        funilRes.rows.forEach(row => {
            if (row.status_producao === 'fila') funil.fila = Number(row.quantidade);
            if (row.status_producao === 'andamento') funil.andamento = Number(row.quantidade);
            if (row.status_producao === 'concluido') funil.concluido = Number(row.quantidade);
        });

        return {
            indicadores: {
                taxaCustoFixo,
                faturamentoBase: faturamento,
                totalDespesas,
                valorMaoObra,
                receitaMes,
                lucroMes
            },
            funilProducao: funil
        };
    }
}