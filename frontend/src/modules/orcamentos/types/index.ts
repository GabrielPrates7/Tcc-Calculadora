export interface Orcamento {
    id?: number;
    cliente: string;
    nome_produto: string;
    custo_materiais: number;
    horas_trabalhadas: number; 
    lucro_desejado: number;
    imposto: number;
    preco_venda: number;
    // Novo: salva qual cenário foi usado para histórico
    id_cenario_mo?: number; 
}

// Nova interface para o Dropdown
export interface CenarioMaoObra {
    id: number;
    titulo: string;       // Ex: "Custo Padrão 2026"
    valorUnitario: number;// Ex: 25.50
    unidade: 'horas' | 'dias';
}