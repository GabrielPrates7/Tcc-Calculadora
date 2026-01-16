// Adicione 'type' aqui
import type { ItemFinanceiro, DashboardData } from '../types';

const API_URL = 'http://localhost:3000/financeiro';

export const FinanceiroService = {
    async getDashboard(): Promise<DashboardData> {
        const res = await fetch(`${API_URL}/dashboard`);
        return res.json();
    },
    async getDespesas(): Promise<ItemFinanceiro[]> {
        const res = await fetch(`${API_URL}/despesas`);
        return res.json();
    },
    async getInvestimentos(): Promise<ItemFinanceiro[]> {
        const res = await fetch(`${API_URL}/investimentos`);
        return res.json();
    },
    async salvarItem(tipo: 'despesas' | 'investimentos', item: Partial<ItemFinanceiro>): Promise<void> {
        const url = item.id ? `${API_URL}/${tipo}/${item.id}` : `${API_URL}/${tipo}`;
        const method = item.id ? 'PUT' : 'POST';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: item.nome, valor: Number(item.valor) })
        });
    },
    async excluirItem(tipo: 'despesas' | 'investimentos', id: number): Promise<void> {
        await fetch(`${API_URL}/${tipo}/${id}`, { method: 'DELETE' });
    },
    async atualizarConfig(faturamento: number): Promise<void> {
        await fetch(`${API_URL}/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ faturamento })
        });
    }
};