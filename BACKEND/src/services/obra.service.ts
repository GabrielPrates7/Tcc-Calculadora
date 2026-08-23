import { pool } from './db';

// Tipagem Estrita alinhada com o Frontend
export interface TaxaFuncao {
    funcao_id: number;
    funcao_nome: string;
    total_funcionarios_ativos: number;
    custo_mensal_setor: number;
    custo_hora_calculado: number;
    custo_dia_calculado: number;
}

export const ObraService = {
    async obterTaxasPorFuncao(empresa_id: number): Promise<TaxaFuncao[]> {
        const query = `
            SELECT 
                func.id AS funcao_id,
                func.nome AS funcao_nome,
                COUNT(f.id) AS total_funcionarios_ativos,
                SUM(f.custo_total_mensal) AS custo_mensal_setor,
                CASE
                    WHEN cp.horas_trabalhadas_dia > 0 THEN
                        ROUND((SUM(f.custo_total_mensal) / (COUNT(f.id) * cp.horas_trabalhadas_dia))::numeric, 2)
                    ELSE 0
                END AS custo_hora_calculado,
                CASE
                    WHEN cp.dias_trabalhados_mes > 0 THEN
                        ROUND((SUM(f.custo_total_mensal) / (COUNT(f.id) * cp.dias_trabalhados_mes))::numeric, 2)
                    ELSE 0
                END AS custo_dia_calculado
            FROM public.funcoes func
            LEFT JOIN public.configuracao_producao cp ON cp.empresa_id = func.empresa_id
            LEFT JOIN public.funcionarios f ON f.funcao_id = func.id AND f.ativo = true AND f.empresa_id = $1
            WHERE func.empresa_id = $1
            GROUP BY func.id, func.nome, cp.horas_trabalhadas_dia, cp.dias_trabalhados_mes
            HAVING COUNT(f.id) > 0
            ORDER BY func.nome;
        `;
        
        const result = await pool.query(query, [empresa_id]);
        
        return result.rows.map((row: any) => ({
            funcao_id: Number(row.funcao_id),
            funcao_nome: row.funcao_nome,
            total_funcionarios_ativos: Number(row.total_funcionarios_ativos),
            custo_mensal_setor: Number(row.custo_mensal_setor) || 0,
            custo_hora_calculado: Number(row.custo_hora_calculado),
            custo_dia_calculado: Number(row.custo_dia_calculado)
        }));
    }
};