// ARQUIVO: src/modules/financeiro/services/financeiro.service.ts

import type { ItemFinanceiro, DashboardData } from '../types';
import { api } from '../../../services/api';

interface ItemBackend {
    id: number;
    nome: string;
    valor: string | number;
    ativo: boolean;
    pago: boolean;
    beneficiario?: string | null;
    dataVencimento?: string | null;
    data_vencimento?: string | null;
}

export const FinanceiroService = {
    /**
     * Indicadores do período. `meses` em 1-12. Sem período informado, o
     * backend mantém o comportamento padrão (faturamento mais recente) —
     * é assim que o carregamento inicial da tela continua chamando.
     */
    async getDashboard(meses?: number[], ano?: number): Promise<DashboardData> {
        const params = (meses && meses.length > 0 && ano)
            ? { meses: meses.join(','), ano }
            : undefined;
        const res = await api.get('/financeiro/dashboard', { params });
        return res.data;
    },

    async getDespesas(): Promise<ItemFinanceiro[]> {
        const res = await api.get<ItemBackend[]>('/financeiro/despesas');
        const dados = res.data;

        return dados.map((d) => ({
            id: d.id,
            nome: d.nome,
            valor: Number(d.valor),
            ativo: Boolean(d.ativo),
            pago: Boolean(d.pago),
            beneficiario: d.beneficiario || '',
            dataVencimento: d.dataVencimento || d.data_vencimento || ''
        }));
    },

    async getInvestimentos(): Promise<ItemFinanceiro[]> {
        const res = await api.get<ItemBackend[]>('/financeiro/investimentos');
        const dados = res.data;

        return dados.map((d) => ({
            id: d.id,
            nome: d.nome,
            valor: Number(d.valor),
            ativo: Boolean(d.ativo),
            pago: Boolean(d.pago),
            beneficiario: d.beneficiario || '',
            dataVencimento: d.dataVencimento || d.data_vencimento || ''
        }));
    },

    async salvarItem(tipo: 'despesas' | 'investimentos', item: Partial<ItemFinanceiro>): Promise<void> {
        const endpoint = item.id ? `/financeiro/${tipo}/${item.id}` : `/financeiro/${tipo}`;
        
        const payload = { 
            nome: item.nome, 
            valor: Number(item.valor),
            ativo: item.ativo,
            pago: item.pago,
            beneficiario: item.beneficiario,
            dataVencimento: item.dataVencimento 
        };

        try {
            if (item.id) {
                await api.put(endpoint, payload);
            } else {
                await api.post(endpoint, payload);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const mensagem = err.response?.data?.error || `Erro interno no servidor ao salvar ${tipo}`;
            throw new Error(mensagem);
        }
    },

    async excluirItem(tipo: 'despesas' | 'investimentos', id: number): Promise<void> {
        await api.delete(`/financeiro/${tipo}/${id}`);
    },

    async salvarFaturamento(mes: number, ano: number, valor: number): Promise<void> {
        await api.post('/financeiro/faturamento', { mes, ano, valor });
    },

    /**
     * Taxa de Custo Fixo do período, calculada pelo backend (fonte única).
     * `meses` em 1-12. Sem período, o backend usa o faturamento mais recente.
     */
    async getTaxaCustoFixo(meses?: number[], ano?: number): Promise<number> {
        const params = (meses && meses.length > 0 && ano)
            ? { meses: meses.join(','), ano }
            : undefined;
        const res = await api.get<{ taxaCustoFixo: number }>('/financeiro/taxa-custo-fixo', { params });
        return Number(res.data.taxaCustoFixo) || 0;
    }
};