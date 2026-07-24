// ARQUIVO: src/services/financeiro.service.ts (BACKEND)

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

// 🚀 MUDANÇA AQUI: Validação rigorosa da Regra de Negócio
const validarDataObrigatoria = (data?: string): string => {
    if (!data || data.trim() === '') {
        // Se a data vier vazia, o backend aborta e devolve esse erro pro React
        throw new Error("A data de vencimento é obrigatória para o fluxo de caixa."); 
    }
    return data; 
};

export const FinanceiroService = {
    // ==========================================
    // MÉTODOS DE DESPESAS FIXAS
    // ==========================================
    async listarDespesas() {
        const query = `
            SELECT id, nome, valor, ativo, pago, beneficiario, data_vencimento AS "dataVencimento"
            FROM despesas_fixas 
            ORDER BY data_vencimento ASC, id DESC
        `;
        const { rows } = await pool.query<ItemFinanceiroRow>(query);
        return rows.map(row => ({ ...row, valor: Number(row.valor) }));
    },

    async salvarDespesa(dados: ItemFinanceiroInput) {
        const query = `
            INSERT INTO despesas_fixas (nome, valor, ativo, pago, beneficiario, data_vencimento) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); // <-- Aplica a validação
        
        const values = [
            dados.nome, dados.valor, dados.ativo ?? true, dados.pago ?? false, dados.beneficiario || null, dataFinal
        ];
        await pool.query(query, values);
    },

    async atualizarDespesa(id: number, dados: ItemFinanceiroInput) {
        const query = `
            UPDATE despesas_fixas 
            SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 
            WHERE id=$7
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); // <-- Aplica a validação
        
        const values = [
            dados.nome, dados.valor, dados.ativo, dados.pago, dados.beneficiario || null, dataFinal, id
        ];
        await pool.query(query, values);
    },

    async deletarDespesa(id: number) {
        await pool.query('DELETE FROM despesas_fixas WHERE id = $1', [id]);
    },

    // ==========================================
    // MÉTODOS DE INVESTIMENTOS
    // ==========================================
    async listarInvestimentos() {
        const query = `
            SELECT id, nome, valor, ativo, pago, beneficiario, data_vencimento AS "dataVencimento"
            FROM investimentos 
            ORDER BY data_vencimento ASC, id DESC
        `;
        const { rows } = await pool.query<ItemFinanceiroRow>(query);
        return rows.map(row => ({ ...row, valor: Number(row.valor) }));
    },

    async salvarInvestimento(dados: ItemFinanceiroInput) {
        const query = `
            INSERT INTO investimentos (nome, valor, ativo, pago, beneficiario, data_vencimento) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); // <-- Aplica a validação
        
        const values = [
            dados.nome, dados.valor, dados.ativo ?? true, dados.pago ?? false, dados.beneficiario || null, dataFinal
        ];
        await pool.query(query, values);
    },

    async atualizarInvestimento(id: number, dados: ItemFinanceiroInput) {
        const query = `
            UPDATE investimentos 
            SET nome=$1, valor=$2, ativo=$3, pago=$4, beneficiario=$5, data_vencimento=$6 
            WHERE id=$7
        `;
        
        const dataFinal = validarDataObrigatoria(dados.dataVencimento); // <-- Aplica a validação
        
        const values = [
            dados.nome, dados.valor, dados.ativo, dados.pago, dados.beneficiario || null, dataFinal, id
        ];
        await pool.query(query, values);
    },

    async deletarInvestimento(id: number) {
        await pool.query('DELETE FROM investimentos WHERE id = $1', [id]);
    }
};