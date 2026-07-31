import type { IOrcamento, IOrcamentoPayload, ICenarioMaoObra } from '../types';

const API_BASE_URL = 'http://localhost:3000/api/orcamentos';

export const OrcamentosService = {
    /**
     * Carrega os dados de forma isolada. Se um endpoint falhar, os outros mantêm a renderização na tela.
     */
    async buscarDadosIniciais(): Promise<{
        listaCenarios: ICenarioMaoObra[];
        taxaFixa: number;
        listaOrcamentos: IOrcamento[];
    }> {
        const [resCenarios, resTaxa, resOrcamentos] = await Promise.allSettled([
            fetch(`${API_BASE_URL}/historico-obra`),
            fetch(`${API_BASE_URL}/taxa-fixa`),
            fetch(API_BASE_URL)
        ]);

        let listaCenarios: ICenarioMaoObra[] = [];
        let taxaFixa = 0;
        let listaOrcamentos: IOrcamento[] = [];

        if (resCenarios.status === 'fulfilled' && resCenarios.value.ok) {
            const data = await resCenarios.value.json();
            listaCenarios = Array.isArray(data) ? data : [];
        } else {
            console.error('Erro na rota /historico-obra:', resCenarios);
        }

        if (resTaxa.status === 'fulfilled' && resTaxa.value.ok) {
            const data = await resTaxa.value.json();
            taxaFixa = Number(data?.taxaCustoFixo) || 0;
        } else {
            console.error('Erro na rota /taxa-fixa:', resTaxa);
        }

        if (resOrcamentos.status === 'fulfilled' && resOrcamentos.value.ok) {
            const data = await resOrcamentos.value.json();
            listaOrcamentos = Array.isArray(data) ? data : [];
        } else {
            console.error('Erro na rota /orcamentos:', resOrcamentos);
        }

        return { listaCenarios, taxaFixa, listaOrcamentos };
    },

    async listarOrcamentos(): Promise<IOrcamento[]> {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Falha ao listar orçamentos.');
        return response.json();
    },

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

export const orcamentosService = OrcamentosService;