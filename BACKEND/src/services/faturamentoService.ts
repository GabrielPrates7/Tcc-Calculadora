import { pool } from './db'; 

export const FaturamentoService = {
    // 1. Busca o faturamento de um mês específico
    async obterPorMes(mes: number, ano: number) {
        // Agora busca na tabela correta: 'faturamentos_mensais'
        const query = `SELECT valor FROM faturamentos_mensais WHERE mes = $1 AND ano = $2`;
        const { rows } = await pool.query(query, [mes, ano]);
        
        if (rows.length > 0) {
            return Number(rows[0].valor);
        }
        return null;
    },

    // 2. Salva ou Atualiza o faturamento do mês
    async salvar(mes: number, ano: number, valor: number) {
        console.log(`💾 Salvando Mês ${mes}/${ano}: R$ ${valor}`);

        // Usa 'faturamentos_mensais' e atualiza se o mês já existir (Upsert)
        const query = `
            INSERT INTO faturamentos_mensais (mes, ano, valor)
            VALUES ($1, $2, $3)
            ON CONFLICT (mes, ano) 
            DO UPDATE SET valor = EXCLUDED.valor
            RETURNING valor;
        `;
        
        try {
            const { rows } = await pool.query(query, [mes, ano, valor]);
            console.log("✅ Salvo com sucesso:", rows[0]);
            return Number(rows[0].valor);
        } catch (error) {
            console.error("❌ Erro ao salvar faturamento:", error);
            throw error;
        }
    }
};