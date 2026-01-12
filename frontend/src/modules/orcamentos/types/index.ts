export interface Orcamento {
    id?: number;
    cliente: string;
    nome_produto: string;
    custo_materiais: number;
    horas_trabalhadas: number; 
    lucro_desejado: number;
    imposto: number;
    preco_venda: number;
}

export interface DetalhesCalculo {
    pv: number;     // Preço Venda
    mat: number;    // Materiais
    mo: number;     // Mão de Obra
    valImposto: number;
    valLucro: number;
    valFixo: number;
    impPct: number;
    lucPct: number;
    fixoPct: number;
    matPct: number;
    moPct: number;
}