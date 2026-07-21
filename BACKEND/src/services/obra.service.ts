import { pool } from './db';

// Tipagem Estrita
export interface TaxaFuncao {
    funcao_id: number;
    funcao_nome: string;
    total_funcionarios_ativos: number;
    custo_hora_calculado: number;
}

export const ObraService = {
    // Retorna o catálogo de custos por hora atualizado
    async obterTaxasPorFuncao(): Promise<TaxaFuncao[]> {
        const query = `
            SELECT 
                func.id AS funcao_id,
                func.nome AS funcao_nome,
                COUNT(f.id) AS total_funcionarios_ativos,
                CASE 
                    WHEN COUNT(f.id) > 0 AND func.base_horas_mensais > 0 THEN 
                        ROUND((SUM(f.custo_total_mensal) / (COUNT(f.id) * func.base_horas_mensais))::numeric, 2)
                    ELSE 
                        func.custo_hora_mercado
                END AS custo_hora_calculado
            FROM public.funcoes func
            LEFT JOIN public.funcionarios f ON f.funcao_id = func.id AND f.ativo = true
            GROUP BY func.id, func.nome, func.base_horas_mensais, func.custo_hora_mercado
            ORDER BY func.nome;
        `;
        
        const result = await pool.query<TaxaFuncao>(query);
        // O node-postgres retorna numéricos como string, precisamos converter.
        return result.rows.map(row => ({
            ...row,
            total_funcionarios_ativos: Number(row.total_funcionarios_ativos),
            custo_hora_calculado: Number(row.custo_hora_calculado)
        }));
    }
};