import type { OrdemServico } from '../types';

const API_URL = 'http://localhost:3000/ordens-servico';

export const OrdemServicoService = {
    // Busca todas as O.S. para montar o Kanban
    listarTodas: async (): Promise<OrdemServico[]> => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar Ordens de Serviço');
        return response.json();
    },

    // Cria uma nova O.S. a partir de um orçamento aprovado
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

    // Atualiza a coluna (produção) ou a etiqueta de pagamento (financeiro)
    atualizarStatus: async (id: number, status_producao?: string, status_financeiro?: string) => {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_producao, status_financeiro })
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return response.json();
    }
};