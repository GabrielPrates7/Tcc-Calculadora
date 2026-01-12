export type TipoTempo = 'dias' | 'horas';
export type TipoOrganizacao = 'individual' | 'grupo';

export interface CustoConfig {
    tipoTempo: TipoTempo;
    tipoOrganizacao: TipoOrganizacao;
    tempoInput: number;
    qtdUnidades: number;
    tamanhoGrupo: number;
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