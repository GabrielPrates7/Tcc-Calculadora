// ARQUIVO: src/modules/financeiro/hooks/useFinanceiro.ts

import { useState, useEffect } from 'react';
import { FinanceiroService } from '../services/financeiro.service';
import type { ItemFinanceiro, DashboardData } from '../types';

// Ajuste a URL base conforme o seu backend
const API_BASE = 'http://localhost:3000'; 

export function useFinanceiro() {
    const [loading, setLoading] = useState(true);
    const [versaoDados, setVersaoDados] = useState(0);

    // Dados
    const [dashboard, setDashboard] = useState<DashboardData>({
        faturamento: 0, 
        totalDespesas: 0, 
        totalInvestimentos: 0, 
        taxaCustoFixo: 0,
        totalPendente: 0 
    });
    
    const [despesas, setDespesas] = useState<ItemFinanceiro[]>([]);
    const [investimentos, setInvestimentos] = useState<ItemFinanceiro[]>([]);

    useEffect(() => {
        async function carregar() {
            setLoading(true);
            try {
                // Carrega tudo em paralelo
                // O Dashboard agora retorna faturamento: 0, pois calculamos dinamicamente no front
                const [dash, desp, inv] = await Promise.all([
                    FinanceiroService.getDashboard(),
                    FinanceiroService.getDespesas(),
                    FinanceiroService.getInvestimentos()
                ]);
                
                setDashboard(dash);
                setDespesas(desp);
                setInvestimentos(inv);
            } catch (error) {
                console.error("Erro ao carregar financeiro:", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [versaoDados]);

    const recarregar = () => setVersaoDados(v => v + 1);

    const salvarItem = async (tipo: 'despesas' | 'investimentos', item: Partial<ItemFinanceiro>) => {
        try {
            await FinanceiroService.salvarItem(tipo, item);
            recarregar();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const excluirItem = async (tipo: 'despesas' | 'investimentos', id: number) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await FinanceiroService.excluirItem(tipo, id);
            recarregar();
        } catch (error) {
            console.error(error);
        }
    };

    // --- FUNÇÕES DE FATURAMENTO MENSAL E POR PERÍODO ---

    // 1. Busca o faturamento de um mês específico (Ex: Janeiro)
    const buscarFaturamentoMensal = async (mes: number, ano: number) => {
        try {
            const response = await fetch(`${API_BASE}/financeiro/faturamento/${mes}/${ano}`);
            
            if (!response.ok) return null;
            
            const data = await response.json();
            
            // Garante que é número
            if (data.valor !== null && data.valor !== undefined) {
                return Number(data.valor);
            }
            
            return null;
        } catch (error) {
            console.error("Erro ao buscar faturamento mensal:", error);
            return null;
        }
    };

    // 2. Salva o faturamento de um mês específico
    const salvarFaturamentoMensal = async (mes: number, ano: number, valor: number) => {
        try {
            console.log("HOOK: Tentando salvar faturamento...", { mes, ano, valor });

            const response = await fetch(`${API_BASE}/financeiro/faturamento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mes, ano, valor })
            });
            
            if (response.ok) {
                // recarregar(); // Opcional: se quiser forçar atualização global
                return true;
            } else {
                console.error("HOOK: Erro na resposta da API ao salvar");
                return false;
            }
        } catch (error) {
            console.error("Erro ao salvar faturamento mensal:", error);
            return false;
        }
    };

    // 3. NOVO: Soma o faturamento de uma lista de meses (Ex: Jan, Fev, Mar)
    const somarFaturamentoPeriodo = async (meses: number[], ano: number) => {
        try {
            const response = await fetch(`${API_BASE}/financeiro/faturamento/soma`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meses, ano })
            });
            
            if (!response.ok) return 0;
            
            const data = await response.json();
            return Number(data.valor) || 0;
        } catch (error) {
            console.error("Erro ao somar período:", error);
            return 0;
        }
    };

    return {
        loading,
        dashboard,
        despesas,
        investimentos,
        salvarItem,
        excluirItem,
        // Funções de faturamento exportadas:
        buscarFaturamentoMensal,
        salvarFaturamentoMensal,
        somarFaturamentoPeriodo
    };
}