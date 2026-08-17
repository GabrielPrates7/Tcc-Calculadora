import type { IOrcamento, IOrcamentoPayload, ICenarioMaoObra } from '../types';
import { api } from '../../../services/api'; // <-- Injeção do Interceptador Axios

export const OrcamentosService = {
    /**
     * Carrega os dados de forma isolada usando Promise.allSettled. 
     * O Axios irá rejeitar individualmente as rotas que falharem, sem quebrar o restante.
     */
    async buscarDadosIniciais(): Promise<{
        listaCenarios: ICenarioMaoObra[];
        taxaFixa: number;
        listaOrcamentos: IOrcamento[];
    }> {
        const [resCenarios, resTaxa, resOrcamentos] = await Promise.allSettled([
            api.get('/orcamentos/historico-obra'),
            api.get('/orcamentos/taxa-fixa'),
            api.get('/orcamentos')
        ]);

        let listaCenarios: ICenarioMaoObra[] = [];
        let taxaFixa = 0;
        let listaOrcamentos: IOrcamento[] = [];

        if (resCenarios.status === 'fulfilled') {
            const data = resCenarios.value.data;
            listaCenarios = Array.isArray(data) ? data : [];
        } else {
            console.error('Erro na rota /historico-obra:', resCenarios.reason);
        }

        if (resTaxa.status === 'fulfilled') {
            const data = resTaxa.value.data;
            taxaFixa = Number(data?.taxaCustoFixo) || 0;
        } else {
            console.error('Erro na rota /taxa-fixa:', resTaxa.reason);
        }

        if (resOrcamentos.status === 'fulfilled') {
            const data = resOrcamentos.value.data;
            listaOrcamentos = Array.isArray(data) ? data : [];
        } else {
            console.error('Erro na rota /orcamentos:', resOrcamentos.reason);
        }

        return { listaCenarios, taxaFixa, listaOrcamentos };
    },

    async listarOrcamentos(): Promise<IOrcamento[]> {
        try {
            const response = await api.get('/orcamentos');
            return response.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Falha ao listar orçamentos.');
        }
    },

    async salvar(payload: IOrcamentoPayload): Promise<IOrcamento> {
        try {
            if (payload.id) {
                const response = await api.put(`/orcamentos/${payload.id}`, payload);
                // Mantendo o fallback da sua estrutura anterior onde o PUT retorna dentro de "data"
                return response.data.data ? response.data.data : response.data;
            } else {
                const response = await api.post('/orcamentos', payload);
                return response.data;
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Erro ao salvar orçamento.');
        }
    },

    async excluir(id: number): Promise<void> {
        try {
            await api.delete(`/orcamentos/${id}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Erro ao deletar orçamento.');
        }
    }
};

export const orcamentosService = OrcamentosService;