import { api } from '../../../services/api';

// ============================================================================
// CONTRATOS (Interfaces)
// ============================================================================

export interface TaxaFuncao {
    funcao_id: number;
    funcao_nome: string;
    total_funcionarios_ativos: number;
    custo_mensal_setor: number;
    custo_hora_calculado: number;
    custo_dia_calculado: number;
}

export interface RecursoObraInput {
    funcao_id: number;
    qtd_profissionais: number;
    horas_estimadas: number;
    custo_hora_aplicado: number;
    unidade_tempo?: 'horas' | 'dias'; 
}

export interface NovaObraBody {
    titulo: string;
    cliente: string;
    data_entrega?: string | null;
    tipo_tempo?: 'horas' | 'dias';
    recursos: RecursoObraInput[];
}

export interface ObraHistorico {
    id: number;
    titulo: string;
    cliente: string;
    data_inicio: string;
    data_entrega: string;
    status: string;
    custo_total_estimado: string; 
    criado_em: string;
    tipo_tempo?: 'horas' | 'dias';
    recursos: {
        funcao_id: number;
        funcao_nome: string;
        qtd_profissionais: number;
        horas_estimadas: number;
        custo_hora_aplicado: number;
        unidade_tempo?: 'horas' | 'dias'; 
    }[];
}

// ============================================================================
// SERVIÇO (Data Fetching)
// ============================================================================
export const CustoObraService = {
    
    async obterTaxas(): Promise<TaxaFuncao[]> {
        try {
            const res = await api.get('/obras/taxas');
            return res.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Falha ao buscar as taxas de produção por função.');
        }
    },

    async salvarOrcamento(dados: NovaObraBody): Promise<{ message: string; obra_id: number; custo_total: number }> {
        try {
            const res = await api.post('/obras', dados);
            return res.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Falha ao salvar o orçamento da obra.');
        }
    },

    async atualizarOrcamento(id: number, dados: NovaObraBody): Promise<{ message: string; custo_total: number }> {
        try {
            const res = await api.put(`/obras/${id}`, dados);
            return res.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Falha ao atualizar o orçamento da obra.');
        }
    },

    async listarHistorico(): Promise<ObraHistorico[]> {
        try {
            const res = await api.get('/obras');
            return res.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Falha ao carregar o histórico de obras.');
        }
    },

    async excluirObra(id: number): Promise<void> {
        try {
            await api.delete(`/obras/${id}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Falha ao excluir a obra no servidor.');
        }
    }
};