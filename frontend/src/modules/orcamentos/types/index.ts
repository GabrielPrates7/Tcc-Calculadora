export interface Orcamento {
    id?: number;
    cliente?: string;
    nome_produto: string;
    custo_materiais: number | string;
    horas_trabalhadas: number | string; 
    lucro_desejado: number | string;
    imposto: number | string;
    preco_venda: number | string;
    
    // --- NOVIDADES ADICIONADAS AQUI ---
    taxa_fixa_snapshot?: number | string; // O erro vermelho some por causa desta linha!
    criado_em?: string;                   // Para a data de emissão no PDF funcionar certinho
    
    // Novo: salva qual cenário foi usado para histórico
    id_cenario_mo?: number; 
}

// Nova interface para o Dropdown
export interface CenarioMaoObra {
    id: number;
    titulo: string;       // Ex: "Custo Padrão 2026"
    valorUnitario: number;// Ex: 25.50
    unidade: 'horas' | 'dias' | string; // Adicionado 'string' por segurança para o JSONB
}