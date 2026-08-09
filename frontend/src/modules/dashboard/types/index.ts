export interface DashboardResumo {
    indicadores: {
        taxaCustoFixo: number;
        faturamentoBase: number;
        totalDespesas: number;
        receitaMes: number;
        lucroMes: number;
    };
    funilProducao: {
        fila: number;
        andamento: number;
        concluido: number;
    };
    topCustos: {
        funcao: string;
        custo_total: number;
    }[];
}