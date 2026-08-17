import type { OrdemServico } from '../types';
import { api } from '../../../services/api'; // <-- Injeção do Interceptador Axios

// Helper privado ajustado para o formato de erro do Axios
function extrairErroAxios(error: unknown, mensagemPadrao: string): never {
    const err = error as { response?: { data?: { error?: string, message?: string } } };
    const mensagemReal = err.response?.data?.error || err.response?.data?.message || mensagemPadrao;
    throw new Error(mensagemReal);
}

export const OrdemServicoService = {
    listarTodas: async (): Promise<OrdemServico[]> => {
        try {
            const response = await api.get('/ordens-servico');
            return response.data;
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao buscar Ordens de Serviço no servidor.');
        }
    },

    criarDeOrcamento: async (orcamentoId: number, dataEntrega?: string): Promise<OrdemServico> => {
        try {
            const response = await api.post('/ordens-servico', { 
                orcamento_id: orcamentoId, 
                data_entrega: dataEntrega || null 
            });
            return response.data;
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao criar Ordem de Serviço.');
        }
    },

    atualizarStatus: async (id: number, status_producao?: string): Promise<OrdemServico> => {
        try {
            const response = await api.patch(`/ordens-servico/${id}/status`, { status_producao });
            return response.data;
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao atualizar status da Ordem de Serviço.');
        }
    },

    atualizarDados: async (id: number, dados: Partial<OrdemServico>): Promise<OrdemServico> => {
        try {
            const response = await api.put(`/ordens-servico/${id}`, dados);
            return response.data;
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao atualizar dados operacionais da O.S.');
        }
    },

    excluir: async (id: number): Promise<boolean> => {
        try {
            await api.delete(`/ordens-servico/${id}`);
            return true;
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao excluir Ordem de Serviço no servidor.');
        }
    },

    // --- MÓDULO FINANCEIRO (TRANSAÇÕES) ---
    registrarPagamento: async (osId: number, dados: { valor: number, forma_pagamento: string, data_pagamento: string }): Promise<OrdemServico> => {
        try {
            const response = await api.post(`/ordens-servico/${osId}/pagamentos`, dados);
            return response.data; // Retorna a O.S. com a lista de pagamentos e totalizados atualizados
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao registrar pagamento.');
        }
    },

    excluirPagamento: async (pagamentoId: number): Promise<OrdemServico> => {
        try {
            const response = await api.delete(`/ordens-servico/pagamentos/${pagamentoId}`);
            return response.data; // Retorna a O.S. atualizada
        } catch (error) {
            return extrairErroAxios(error, 'Erro ao excluir pagamento.');
        }
    }
};