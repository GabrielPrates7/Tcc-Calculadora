// ARQUIVO: src/modules/financeiro/services/financeiro.service.ts

import type { ItemFinanceiro, DashboardData } from '../types';

const API_URL = 'http://localhost:3000/financeiro';

// Interface interna para representar o dado "cru" que vem do Banco (Snake Case)
interface ItemBackend {
    id: number;
    nome: string;
    valor: string | number; // O banco pode retornar string numérica
    ativo: boolean;
    pago: boolean;
    beneficiario?: string;
    data_vencimento?: string; // Aqui está o campo snake_case
}

export const FinanceiroService = {
    async getDashboard(): Promise<DashboardData> {
        const res = await fetch(`${API_URL}/dashboard`);
        return res.json();
    },

    async getDespesas(): Promise<ItemFinanceiro[]> {
        const res = await fetch(`${API_URL}/despesas`);
        const dados: ItemBackend[] = await res.json();
        
        // Mapeamento Explícito: Backend (snake) -> Frontend (camel)
        return dados.map((d) => ({
            id: d.id,
            nome: d.nome,
            valor: Number(d.valor), // Garante que seja número
            ativo: d.ativo,
            pago: d.pago,
            beneficiario: d.beneficiario,
            dataVencimento: d.data_vencimento // Converte snake_case para camelCase
        }));
    },

    async getInvestimentos(): Promise<ItemFinanceiro[]> {
        const res = await fetch(`${API_URL}/investimentos`);
        const dados: ItemBackend[] = await res.json();
        
        return dados.map((d) => ({
            id: d.id,
            nome: d.nome,
            valor: Number(d.valor),
            ativo: d.ativo,
            pago: d.pago,
            beneficiario: d.beneficiario,
            dataVencimento: d.data_vencimento
        }));
    },

    async salvarItem(tipo: 'despesas' | 'investimentos', item: Partial<ItemFinanceiro>): Promise<void> {
        const url = item.id ? `${API_URL}/${tipo}/${item.id}` : `${API_URL}/${tipo}`;
        const method = item.id ? 'PUT' : 'POST';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nome: item.nome, 
                valor: Number(item.valor),
                ativo: item.ativo,
                pago: item.pago,
                beneficiario: item.beneficiario,
                data_vencimento: item.dataVencimento // Envia para o banco como snake_case
            })
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