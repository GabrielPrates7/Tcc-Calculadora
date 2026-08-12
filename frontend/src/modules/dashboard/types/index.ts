export interface DashboardResumo {
    indicadores: {
        taxaCustoFixo: number;
        faturamentoBase: number;
        custoOperacionalTotal: number;
        receitaRealizada: number;
        receitaPrevista: number;
        ticketMedio: number;
        qtdPagamentos: number;
    };
    funilProducao: {
        fila: number;
        andamento: number;
        concluido: number;
        entregue: number;
    };
    ordensDestaque: {
        urgentes: { id: number; cliente: string; info_secundaria: string; status_producao: string; }[];
        maiorValor: { id: number; cliente: string; info_secundaria: string; status_producao: string; }[];
        recentes: { id: number; cliente: string; info_secundaria: string; status_producao: string; }[];
    };
    graficoFinanceiro: {
        mes: string;
        prevista: number;
        realizada: number;
    }[];
    graficoProdutividade: {
        mes: string;
        criadas: number;
        finalizadas: number;
    }[];
    distribuicaoCustos: {
        nome: string;
        valor: number;
        cor: string;
    }[];
}