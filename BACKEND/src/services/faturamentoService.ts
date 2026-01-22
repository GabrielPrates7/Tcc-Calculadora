import { pool } from './db'; 

export const FaturamentoService = {
    // Busca mês único
    async obterPorMes(mes: number, ano: number) {
        const query = `SELECT valor FROM faturamentos_mensais WHERE mes = $1 AND ano = $2`;
        const { rows } = await pool.query(query, [mes, ano]);
        return rows.length > 0 ? Number(rows[0].valor) : 0; // Retorna 0 se não achar
    },

    // NOVO: Soma vários meses (Para o período selecionado)
    async somarPorMeses(meses: number[], ano: number) {
        if (meses.length === 0) return 0;

        // Query inteligente: Soma onde o mês está na lista de meses passados
        const query = `
            SELECT SUM(valor) as total 
            FROM faturamentos_mensais 
            WHERE ano = $1 AND mes = ANY($2::int[])
        `;
        const { rows } = await pool.query(query, [ano, meses]);
        return Number(rows[0].total) || 0;
    },

    // Salva mês único
    async salvar(mes: number, ano: number, valor: number) {
        console.log(`💾 Salvando Mês ${mes}/${ano}: R$ ${valor}`);
        const query = `
            INSERT INTO faturamentos_mensais (mes, ano, valor) VALUES ($1, $2, $3)
            ON CONFLICT (mes, ano) DO UPDATE SET valor = EXCLUDED.valor
            RETURNING valor;
        `;
        const { rows } = await pool.query(query, [mes, ano, valor]);
        return Number(rows[0].valor);
    }
};