import type { OrdemServico } from '../types';

const API_URL = 'http://localhost:3000/api/ordens-servico';

// Helper privado para extrair a mensagem de erro real enviada pelo Node.js
async function extrairErroAPI(response: Response, mensagemPadrao: string): Promise<never> {
    try {
        const err = await response.json();
        throw new Error(err.error || err.message || mensagemPadrao);
    } catch (e: unknown) {
        if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
            throw e;
        }
        throw new Error(mensagemPadrao);
    }
}

export const OrdemServicoService = {
    listarTodas: async (): Promise<OrdemServico[]> => {
        const response = await fetch(API_URL);
        if (!response.ok) {
            await extrairErroAPI(response, 'Erro ao buscar Ordens de Serviço no servidor.');
        }
        return response.json();
    },

    criarDeOrcamento: async (orcamentoId: number, dataEntrega?: string): Promise<OrdemServico> => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orcamento_id: orcamentoId, data_entrega: dataEntrega || null })
        });
        
        if (!response.ok) {
            await extrairErroAPI(response, 'Erro ao criar Ordem de Serviço.');
        }
        return response.json();
    },

    atualizarStatus: async (
        id: number, 
        status_producao?: string, 
        status_financeiro?: string
    ): Promise<OrdemServico> => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_producao, status_financeiro })
        });
        
        if (!response.ok) {
            await extrairErroAPI(response, 'Erro ao atualizar status da Ordem de Serviço.');
        }
        return response.json();
    },

    atualizarDados: async (id: number, dados: Partial<OrdemServico>): Promise<OrdemServico> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            await extrairErroAPI(response, 'Erro ao atualizar dados operacionais da O.S.');
        }
        return response.json();
    },

    excluir: async (id: number): Promise<boolean> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            await extrairErroAPI(response, 'Erro ao excluir Ordem de Serviço no servidor.');
        }
        return true;
    }
};