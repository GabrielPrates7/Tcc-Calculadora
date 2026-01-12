export interface ItemFinanceiro {
    id: number;
    nome: string;
    valor: number; // Padronizei para number para facilitar cálculos
}

export interface DashboardData {
    faturamento: number;
    totalDespesas: number;
    totalInvestimentos: number;
    taxaCustoFixo: number;
}

// Tipos visuais
export type TipoModal = 'despesa' | 'investimento' | 'faturamento';
export type ViewMode = 'despesas' | 'investimentos';
export type SortField = 'nome' | 'valor';
export type SortDirection = 'asc' | 'desc';