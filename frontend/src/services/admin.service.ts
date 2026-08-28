import { api } from './api';

export interface CadastroPendente {
    usuario_id: number;
    nome_usuario: string;
    email: string;
    criado_em: string;
    empresa_id: number;
    nome_empresa: string;
    cnpj: string | null;
    ativo?: boolean; 
}

// Interface tipada para o novo fluxo
export interface AlteracaoPendente {
    id: number;
    nome_empresa: string;
    dados_antigos: {
        nome_empresa?: string;
        cnpj?: string;
        nome_usuario?: string;
        email?: string;
    };
    dados_novos: {
        nome_empresa?: string;
        cnpj?: string;
        nome_usuario?: string;
        email?: string;
        senha_hash?: string;
    };
}

export interface FuncionarioEncargoZerado {
    id: number;
    nome: string;
    empresa_id: number;
    nome_empresa: string;
}

export interface SolicitacaoRecuperacaoSenha {
    id: number;
    identificador_informado: string;
    usuario_id: number | null;
    nome_usuario: string | null;
    nome_empresa: string | null;
    criado_em: string;
}

export const AdminService = {
    async listarPendentes(): Promise<CadastroPendente[]> {
        const response = await api.get('/admin/pendentes');
        return response.data;
    },

    async listarTodos(): Promise<CadastroPendente[]> {
        const response = await api.get('/admin/usuarios');
        return response.data;
    },

    async ativarUsuario(id: number): Promise<void> {
        const response = await api.patch(`/admin/ativar/${id}`);
        return response.data;
    },

    async recusarCadastro(id: number): Promise<void> {
        await api.delete(`/admin/cadastros/${id}`);
    },

    async bloquearUsuario(id: number): Promise<void> {
        const response = await api.patch(`/admin/bloquear/${id}`);
        return response.data;
    },

    async redefinirSenha(id: number): Promise<{ senhaTemporaria: string; usuario: { id: number; nome: string; email: string } }> {
        const response = await api.post(`/admin/redefinir-senha/${id}`);
        return response.data;
    },

    // MÉTODOS DO FLUXO DE ALTERAÇÃO
    async listarAlteracoesPendentes(): Promise<AlteracaoPendente[]> {
        const response = await api.get('/admin/solicitacoes');
        return response.data;
    },

    async aprovarAlteracao(id: number): Promise<void> {
        await api.post(`/admin/solicitacoes/${id}/aprovar`);
    },

    async rejeitarAlteracao(id: number): Promise<void> {
        await api.post(`/admin/solicitacoes/${id}/rejeitar`);
    },

    // MANUTENÇÃO
    async diagnosticarEncargosZerados(): Promise<FuncionarioEncargoZerado[]> {
        const response = await api.get('/admin/funcionarios-encargos-zerados');
        return response.data;
    },

    async corrigirEncargosZerados(): Promise<{ corrigidos: number; total: number }> {
        const response = await api.post('/admin/funcionarios-encargos-zerados/corrigir');
        return response.data;
    },

    // RECUPERAÇÃO DE SENHA
    async listarRecuperacoesSenha(): Promise<SolicitacaoRecuperacaoSenha[]> {
        const response = await api.get('/admin/solicitacoes-recuperacao-senha');
        return response.data;
    },

    async gerarSenhaRecuperacao(id: number): Promise<{ senhaTemporaria: string; usuario: { id: number; nome: string; email: string } }> {
        const response = await api.post(`/admin/solicitacoes-recuperacao-senha/${id}/gerar-senha`);
        return response.data;
    },

    async recusarRecuperacaoSenha(id: number): Promise<void> {
        await api.post(`/admin/solicitacoes-recuperacao-senha/${id}/recusar`);
    }
};