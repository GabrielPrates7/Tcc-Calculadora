export interface ItemFinanceiro {
    id: number;
    nome: string;
    valor: number;
    ativo: boolean;
    pago: boolean;
    beneficiario?: string;
    dataVencimento?: string;
}

export interface DashboardData {
    faturamento: number;
    totalDespesas: number;
    totalInvestimentos: number;
    taxaCustoFixo: number;
    totalPendente: number;
}

// --- AQUI ESTÁ A CORREÇÃO DO ERRO CIRCULAR ---
export type StatusFilter = 'todos' | 'ativos' | 'pendentes' | 'pagos';

export type TipoModal = 'despesa' | 'investimento' | 'faturamento';
export type ViewMode = 'despesas' | 'investimentos';
export type SortField = 'nome' | 'valor' | 'dataVencimento' | 'status';
export type SortDirection = 'asc' | 'desc';