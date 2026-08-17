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