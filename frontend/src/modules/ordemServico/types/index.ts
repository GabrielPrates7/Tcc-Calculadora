export interface OrdemServico {
    os_id: number;
    orcamento_id: number;
    status_producao: 'fila' | 'producao' | 'pausado' | 'pronto' | 'entregue';
    status_financeiro: 'pendente' | 'sinal_pago' | 'pago';
    data_entrega?: string;
    criado_em: string;
    
    // Dados que vêm do JOIN com a tabela de Orçamentos
    cliente: string;
    nome_produto: string;
    preco_venda: number | string;
}