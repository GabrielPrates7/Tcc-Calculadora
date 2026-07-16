export interface Funcionario {
    id?: number;
    nome: string;
    funcao: string;
    setor: 'producao' | 'administrativo';
    ativo: boolean;
    data_admissao: string;
    
    // Valores Monetários Principais
    salario_base: number | string; 
    epi: number | string;
    epi_mensal?: number | string; // <-- CORREÇÃO: Propriedade adicionada
    custo_total_mensal?: number | string;

    // --- NOVOS CAMPOS (Detalhamento Financeiro) ---
    decimo_terceiro?: number;
    ferias?: number;
    um_terco_ferias?: number;
    inss?: number;
    multa_fgts?: number;
    outros_gastos?: number;

    // --- NOVOS CAMPOS (Desligamento) ---
    data_inativacao?: string | null;
    motivo_inativacao?: string | null;
}

export interface FuncionarioInput {
    id?: number;
    nome: string;
    funcao: string;
    setor: 'producao' | 'administrativo';
    ativo: boolean;
    data_admissao: string;
    
    salario: number; 
    epi: number;

    data_inativacao?: string | null;
    motivo_inativacao?: string | null;
}