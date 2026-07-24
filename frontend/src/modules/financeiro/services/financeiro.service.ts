// ARQUIVO: src/modules/financeiro/services/financeiro.service.ts (FRONTEND / REACT)

import type { ItemFinanceiro, DashboardData } from '../types';

const API_URL = 'http://localhost:3000/api/financeiro';

// DTO (Data Transfer Object): Tipagem rigorosa do que esperamos receber do Backend via fetch
interface ItemBackend {
    id: number;
    nome: string;
    valor: string | number;
    ativo: boolean;
    pago: boolean;
    beneficiario?: string | null;
    dataVencimento?: string | null;
    data_vencimento?: string | null; // Absorve caso o backend envie snake_case
}

export const FinanceiroService = {
    async getDashboard(): Promise<DashboardData> {
        const res = await fetch(`${API_URL}/dashboard`);
        if (!res.ok) throw new Error('Erro ao buscar dashboard');
        return res.json();
    },

    async getDespesas(): Promise<ItemFinanceiro[]> {
        const res = await fetch(`${API_URL}/despesas`);
        if (!res.ok) throw new Error('Erro ao buscar despesas');
        
        // Avisamos ao TypeScript que o JSON recebido é um array de ItemBackend
        const dados: ItemBackend[] = await res.json();
        
        // Agora o 'd' já é reconhecido e tipado automaticamente, sem precisar de 'any'
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
        const res = await fetch(`${API_URL}/investimentos`);
        if (!res.ok) throw new Error('Erro ao buscar investimentos');
        
        const dados: ItemBackend[] = await res.json();
        
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
        const url = item.id ? `${API_URL}/${tipo}/${item.id}` : `${API_URL}/${tipo}`;
        const method = item.id ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nome: item.nome, 
                valor: Number(item.valor),
                ativo: item.ativo,
                pago: item.pago,
                beneficiario: item.beneficiario,
                dataVencimento: item.dataVencimento 
            })
        });

        if (!res.ok) {
            const erroBackend = await res.json().catch(() => ({}));
            throw new Error(erroBackend.error || `Erro interno no servidor ao salvar ${tipo}`);
        }
    },

    async excluirItem(tipo: 'despesas' | 'investimentos', id: number): Promise<void> {
        const res = await fetch(`${API_URL}/${tipo}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir item');
    },

    async salvarFaturamento(mes: number, ano: number, valor: number): Promise<void> {
        const res = await fetch(`${API_URL}/faturamento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mes, ano, valor })
        });
        if (!res.ok) throw new Error('Erro ao salvar faturamento');
    }
};