export interface ICenarioMaoObra {
    id: number;
    titulo: string;
    valorUnitario: number;
    unidade: 'horas' | 'dias' | string;
    tipoTempo?: string;
    dataCriacao?: string;
}

export interface ITaxaFixoResponse {
    taxaCustoFixo: number;
}

export interface IOrcamento {
    id?: number;
    cliente?: string;
    nome_produto: string;
    custo_materiais: number | string;
    horas_trabalhadas: number | string;
    lucro_desejado: number | string;
    imposto: number | string;
    preco_venda: number | string;
    taxa_fixa_snapshot?: number | string;
    custo_mao_obra_unitario?: number | string;
    custo_mao_obra_total?: number | string;
    criado_em?: string;
    id_cenario_mo?: number | null;
}

export interface IOrcamentoPayload {
    id?: number;
    cliente?: string;
    nome_produto: string;
    custo_materiais: number;
    horas_trabalhadas: number;
    lucro_desejado: number;
    imposto: number;
    preco_venda?: number;
    valorHoraSelecionado: number;
    id_cenario_mo?: number | null;
}

// Aliases de compatibilidade (exporta com e sem o prefixo 'I')
export type CenarioMaoObra = ICenarioMaoObra;
export type Orcamento = IOrcamento;
export type OrcamentoPayload = IOrcamentoPayload;