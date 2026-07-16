// ✅ CORRIGIDO: removido acento das chaves (receitaMês → receitaMes, lucroMês → lucroMes)
// Acentos em nomes de propriedades TypeScript causam problemas de encoding entre
// o JSON do backend e a tipagem do frontend dependendo do ambiente/SO.

export interface DashboardResumo {
    indicadores: {
        taxaCustoFixo: number;
        faturamentoBase: number;
        totalDespesas: number;
        valorMaoObra: number;
        receitaMes: number;  // ✅ era: receitaMês
        lucroMes: number;    // ✅ era: lucroMês
    };
    funilProducao: {
        fila: number;
        andamento: number;
        concluido: number;
    };
}
