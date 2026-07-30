import type { IOrcamento, IOrcamentoPayload, ICenarioMaoObra } from '../types';

const API_BASE_URL = '/api/orcamentos';

export const OrcamentosService = {
    /**
     * Busca simultaneamente os cenários de mão de obra, a taxa fixa atual e a lista de orçamentos.
     */
    async buscarDadosIniciais(): Promise<{
        listaCenarios: ICenarioMaoObra[];
        taxaFixa: number;
        listaOrcamentos: IOrcamento[];
    }> {
        const [resCenarios, resTaxa, resOrcamentos] = await Promise.all([
            fetch(`${API_BASE_URL}/historico-obra`),
            fetch(`${API_BASE_URL}/taxa-fixa`),
            fetch(API_BASE_URL)
        ]);

        if (!resCenarios.ok || !resTaxa.ok || !resOrcamentos.ok) {
            throw new Error('Falha ao carregar dados iniciais do módulo de orçamentos.');
        }

        const listaCenarios = await resCenarios.json();
        const dadosTaxa = await resTaxa.json();
        const listaOrcamentos = await resOrcamentos.json();

        return {
            listaCenarios: Array.isArray(listaCenarios) ? listaCenarios : [],
            taxaFixa: Number(dadosTaxa?.taxaCustoFixo) || 0,
            listaOrcamentos: Array.isArray(listaOrcamentos) ? listaOrcamentos : []
        };
    },

    async listarOrcamentos(): Promise<IOrcamento[]> {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Falha ao listar orçamentos.');
        return response.json();
    },

    /**
     * Centraliza criação e atualização: se existir id, executa PUT; caso contrário, POST.
     */
    async salvar(payload: IOrcamentoPayload): Promise<IOrcamento> {
        const url = payload.id ? `${API_BASE_URL}/${payload.id}` : API_BASE_URL;
        const method = payload.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao salvar orçamento.');
        }
        return payload.id ? data.data : data;
    },

    async excluir(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Erro ao deletar orçamento.');
        }
    }
};

// Alias de compatibilidade para evitar quebra de contratos em outros arquivos
export const orcamentosService = OrcamentosService;