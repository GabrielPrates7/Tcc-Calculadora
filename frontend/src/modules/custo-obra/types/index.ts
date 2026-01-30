export type TipoTempo = 'dias' | 'horas';
export type TipoOrganizacao = 'individual' | 'grupo';

export interface CustoConfig {
    tipoTempo: TipoTempo;
    tipoOrganizacao: TipoOrganizacao;
    tempoInput: number;
    qtdUnidades: number;
    tamanhoGrupo: number;
    tituloCenario?: string;
    idHistoricoParaEditar?: number | null;
    salvarHistorico?: boolean; // Define se grava no banco ou só calcula na tela
}

export interface CustoResultado {
    custoEquipeMensal: number;
    valorUnitario: number;
}

export interface CustoObraResponse {
    config: {
        tipo_tempo?: TipoTempo;
        tipo_organizacao?: TipoOrganizacao;
        qtd_unidades?: number;
        tamanho_grupo?: number;
        dias_trabalhados_mes?: number;
        horas_trabalhadas_dia?: number;
    };
    calculo: CustoResultado;
}

export interface HistoricoItem {
    id: number;
    titulo: string;
    data_alteracao: string;
    valor_unitario_final: number;
    custo_total_folha?: number; // Importante para o PDF detalhado funcionar sem erros
    configuracao_usada: {
        tipo: TipoTempo;
        tempo: number;
        equipes: number;
        organizacao: TipoOrganizacao;
        tamanhoGrupo?: number;
    }; 
}