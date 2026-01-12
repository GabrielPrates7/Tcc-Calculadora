// ARQUIVO: src/modules/funcionarios/types/index.ts

export interface Funcionario {
    id: number;
    nome: string;
    funcao?: string;
    salario_base: string;
    epi: string;
    custo_total_mensal: string;
    ativo: boolean;
    setor: 'producao' | 'administrativo';
  
    // Datas
    data_admissao: string;
    data_inativacao?: string;
    motivo_inativacao?: string;
  
    // Detalhes Financeiros
    decimo_terceiro: string;
    ferias: string;
    um_terco_ferias: string;
    inss: string;
    multa_fgts: string;
}
  
// Tipos auxiliares para os filtros e ordenação
export type TipoFiltroSetor = 'todos' | 'producao' | 'administrativo';
export type TipoFiltroStatus = 'todos' | 'ativos' | 'inativos';
export type TipoSetor = 'producao' | 'administrativo';

export type SortConfig = { 
    key: keyof Funcionario | 'custo'; 
    direction: 'asc' | 'desc' 
} | null;

