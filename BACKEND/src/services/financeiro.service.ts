import { pool } from './db'; 

export interface ItemFinanceiroInput {
    nome: string;
    valor: number;
    ativo: boolean;
    pago: boolean;
    beneficiario?: string;
    dataVencimento?: string; 
}

interface ItemFinanceiroRow {
    id: number;
    nome: string;
    valor: string; 
    ativo: boolean;
    pago: boolean;
    beneficiario: string | null;
    dataVencimento: string | null; 
}

const validarDataObrigatoria = (data?: string): string => {
    if (!data || data.trim() === '') {
        throw new Error("A data de vencimento é obrigatória para o fluxo de caixa."); 
    }
    return data; 
};

export const FinanceiroService = {
    // ==========================================
    // TAXA DE CUSTO FIXO (fonte única)
    // ==========================================
    /**
     * Percentual das despesas fixas sobre o faturamento — a única
     * implementação deste indicador no sistema. Dashboard, tela Financeira,
     * relatório em PDF e o markup do orçamento devem todos passar por aqui,
     * para não divergirem entre si.
     *
     * - Sem `mes`/`ano`: usa o período do faturamento mais recente lançado.
     * - Com `mes`/`ano`: usa exatamente aquele período. `mes` aceita uma lista
     *   para o caso do relatório, que soma um intervalo de vários meses.
     *
     * Despesas e faturamento saem sempre do MESMO período, e o resultado é
     * sempre arredondado em 2 casas.
     */
    async calcularTaxaCustoFixo(empresa_id: number, mes?: number | number[], ano?: number): Promise<number> {
        let mesesAlvo: number[];
        let anoAlvo: number;

        const mesesInformados = mes === undefined ? [] : (Array.isArray(mes) ? mes : [mes]);

        if (mesesInformados.length === 0 || !ano) {
            // Sem período explícito: ancora no faturamento mais recente lançado
            const ultimoRes = await pool.query(
                `SELECT mes, ano FROM faturamentos_mensais
                 WHERE empresa_id = $1
                 ORDER BY ano DESC, mes DESC
                 LIMIT 1`,
                [empresa_id]
            );
            if (ultimoRes.rowCount === 0) return 0;
            mesesAlvo = [Number(ultimoRes.rows[0].mes)];
            anoAlvo = Number(ultimoRes.rows[0].ano);
        } else {
            mesesAlvo = mesesInformados;
            anoAlvo = ano;
        }

        const faturamentoRes = await pool.query(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM faturamentos_mensais
             WHERE mes = ANY($1::int[]) AND ano = $2 AND empresa_id = $3`,
            [mesesAlvo, anoAlvo, empresa_id]
        );
        const faturamento = Number(faturamentoRes.rows[0]?.total) || 0;

        // Sem faturamento no período não há base de rateio — evita divisão por zero
        if (faturamento <= 0) return 0;

        const despesasRes = await pool.query(
            `SELECT COALESCE(SUM(valor), 0) AS total
             FROM despesas_fixas
             WHERE ativo = true
               AND EXTRACT(MONTH FROM data_vencimento) = ANY($1::int[])
               AND EXTRACT(YEAR FROM data_vencimento) = $2
               AND empresa_id = $3`,
            [mesesAlvo, anoAlvo, empresa_id]
        );
        const totalDespesas = Number(despesasRes.rows[0]?.total) || 0;

        return Number(((totalDespesas / faturamento) * 100).toFixed(2));
    },

    // ==========================================
    // MÉTODOS DE DESPESAS FIXAS
    // ==========================================
    async listarDespesas(empresa_id: number) {
        const query = `
            SELECT id, nome, valor, ativo, pago, beneficiario, data_vencimento AS "dataVencimento"
            FROM despesas_fixas 
            WHERE empresa_id = $1
            ORDER BY data_vencimento ASC, id DESC
        `;
        const { rows } = await pool.query<ItemFinanceiroRow>(query, [empresa_id]);
        return rows.map(row => ({ ...row, valor: Number(row.valor) }));
    },

    async salvarDespesa(dados: ItemFinanceiroInput, empresa_id: number) {
        const query = `
            INSERT INTO despesas_fixas (nome, valor, ativo, pago, beneficiario, data_vencimento, empresa_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); 
        
        const values = [
            dados.nome, dados.valor, dados.ativo ?? true, dados.pago ?? false, dados.beneficiario || null, dataFinal, empresa_id
        ];
        await pool.query(query, values);
    },

    async atualizarDespesa(id: number, dados: ItemFinanceiroInput, empresa_id: number) {
        const query = `
            UPDATE despesas_fixas 
            SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 
            WHERE id=$7 AND empresa_id=$8
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); 
        
        const values = [
            dados.nome, dados.valor, dados.ativo, dados.pago, dados.beneficiario || null, dataFinal, id, empresa_id
        ];
        await pool.query(query, values);
    },

    async deletarDespesa(id: number, empresa_id: number) {
        await pool.query('DELETE FROM despesas_fixas WHERE id = $1 AND empresa_id = $2', [id, empresa_id]);
    },

    // ==========================================
    // MÉTODOS DE INVESTIMENTOS
    // ==========================================
    async listarInvestimentos(empresa_id: number) {
        const query = `
            SELECT id, nome, valor, ativo, pago, beneficiario, data_vencimento AS "dataVencimento"
            FROM investimentos 
            WHERE empresa_id = $1
            ORDER BY data_vencimento ASC, id DESC
        `;
        const { rows } = await pool.query<ItemFinanceiroRow>(query, [empresa_id]);
        return rows.map(row => ({ ...row, valor: Number(row.valor) }));
    },

    async salvarInvestimento(dados: ItemFinanceiroInput, empresa_id: number) {
        const query = `
            INSERT INTO investimentos (nome, valor, ativo, pago, beneficiario, data_vencimento, empresa_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); 
        
        const values = [
            dados.nome, dados.valor, dados.ativo ?? true, dados.pago ?? false, dados.beneficiario || null, dataFinal, empresa_id
        ];
        await pool.query(query, values);
    },

    async atualizarInvestimento(id: number, dados: ItemFinanceiroInput, empresa_id: number) {
        const query = `
            UPDATE investimentos 
            SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 
            WHERE id=$7 AND empresa_id=$8
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); 
        
        const values = [
            dados.nome, dados.valor, dados.ativo, dados.pago, dados.beneficiario || null, dataFinal, id, empresa_id
        ];
        await pool.query(query, values);
    },

    async deletarInvestimento(id: number, empresa_id: number) {
        await pool.query('DELETE FROM investimentos WHERE id = $1 AND empresa_id = $2', [id, empresa_id]);
    }
};