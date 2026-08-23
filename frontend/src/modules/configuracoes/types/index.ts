export interface Funcao {
    id: number;
    nome: string;
    base_horas_mensais?: number | string;
    total_funcionarios?: number;
}

export interface PerfilBanco {
    nome_empresa?: string;
    nome_usuario?: string;
    nome?: string;
    cnpj?: string;
    email?: string;
}

export interface FormPerfilState {
    nomeEmpresa: string;
    nomeUsuario: string;
    cnpj: string;
    email: string;
    senhaAntiga: string;
    novaSenha: string;
}

export interface FormFinanceiroState {
    baseHorasProdutivas: number | string;
    baseDiasProdutivos: number | string;
}

export interface FormOrcamentoState {
    margemLucroPadrao: number | string;
    impostoPadrao: number | string;
}

export interface ConfiguracoesGlobaisPayload {
    baseHorasProdutivas: number;
    baseDiasProdutivos: number;
    margemLucroPadrao: number;
    impostoPadrao: number;
}