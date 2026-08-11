export interface PagamentoOS {
    id: number;
    os_id: number;
    valor: number | string;
    forma_pagamento: string;
    data_pagamento: string;
}

export interface OrdemServico {
    os_id: number;
    orcamento_id: number;
    status_producao: 'fila' | 'producao' | 'pausado' | 'pronto' | 'entregue';
    status_financeiro: string;
    data_entrega?: string;
    criado_em: string;
    
    esta_atrasado?: boolean;
    
    cliente: string;
    nome_produto: string;
    preco_venda: number | string;

    responsaveis_execucao?: string;
    observacoes?: string;
    observacoes_cliente?: string;
    laudo_tecnico?: string;
    custo_extra_materiais?: number;
    descricao_materiais_extras?: string;
    data_finalizacao?: string;
    data_entregue?: string;
    atualizado_em?: string;

    total_pago?: number;
    pagamentos?: PagamentoOS[];
}