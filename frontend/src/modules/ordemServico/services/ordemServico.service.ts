import type { OrdemServico } from '../types';

const API_URL = 'http://localhost:3000/api/ordens-servico';

export const OrdemServicoService = {
    listarTodas: async (): Promise<OrdemServico[]> => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar Ordens de Serviço');
        return response.json();
    },

    criarDeOrcamento: async (orcamentoId: number, dataEntrega?: string) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orcamento_id: orcamentoId, data_entrega: dataEntrega })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erro ao criar O.S.');
        }
        return response.json();
    },

    atualizarStatus: async (id: number, status_producao?: string, status_financeiro?: string) => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_producao, status_financeiro })
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return response.json();
    },

    atualizarDados: async (id: number, dados: Partial<OrdemServico>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar dados da O.S.');
        return response.json();
    },

    excluir: async (id: number) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao excluir Ordem de Serviço');
        return true;
    }
};