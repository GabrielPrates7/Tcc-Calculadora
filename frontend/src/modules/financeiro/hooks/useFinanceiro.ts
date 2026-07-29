import { useState, useEffect } from 'react';
import { FinanceiroService } from '../services/financeiro.service';
import type { ItemFinanceiro, DashboardData } from '../types';

const API_BASE = 'http://localhost:3000/api/financeiro'; 

export function useFinanceiro() {
    const [loading, setLoading] = useState(true);
    const [versaoDados, setVersaoDados] = useState(0);

    const [dashboard, setDashboard] = useState<DashboardData>({ 
        faturamento: 0, totalDespesas: 0, totalInvestimentos: 0, taxaCustoFixo: 0, totalPendente: 0 
    });
    
    const [despesas, setDespesas] = useState<ItemFinanceiro[]>([]);
    const [investimentos, setInvestimentos] = useState<ItemFinanceiro[]>([]);

    useEffect(() => {
        let isMounted = true; 

        async function carregarDados() {
            try {
                const [dashResult, despResult, invResult] = await Promise.allSettled([
                    FinanceiroService.getDashboard(),
                    FinanceiroService.getDespesas(),
                    FinanceiroService.getInvestimentos()
                ]);
                
                if (isMounted) {
                    if (dashResult.status === 'fulfilled') setDashboard(dashResult.value);
                    
                    if (despResult.status === 'fulfilled') {
                        setDespesas(despResult.value);
                    }
                    
                    if (invResult.status === 'fulfilled') {
                        setInvestimentos(invResult.value);
                    }
                }
            } catch (error) {
                console.error("Erro de execução no carregamento:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        carregarDados();

        return () => { isMounted = false; };
    }, [versaoDados]); 

    const recarregar = () => { setLoading(true); setVersaoDados(v => v + 1); };

    const salvarItem = async (tipo: 'despesas' | 'investimentos', item: Partial<ItemFinanceiro>) => {
        try { 
            await FinanceiroService.salvarItem(tipo, item); 
            recarregar(); 
            return true; 
        } catch (error) { 
            console.error(`Erro ao salvar item (${tipo}):`, error);
            return false; 
        }
    };

    const excluirItem = async (tipo: 'despesas' | 'investimentos', id: number) => {
        try { 
            await FinanceiroService.excluirItem(tipo, id); 
            recarregar(); 
        } catch (error) {
            console.error("Erro ao excluir item:", error);
        }
    };

    const buscarFaturamentoMensal = async (mes: number, ano: number) => {
        try {
            const response = await fetch(`${API_BASE}/faturamento/${mes}/${ano}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.valor != null ? Number(data.valor) : null;
        } catch (error) { 
            console.error("Erro ao buscar faturamento:", error);
            return null; 
        }
    };

    const salvarFaturamentoMensal = async (mes: number, ano: number, valor: number) => {
        try { 
            await FinanceiroService.salvarFaturamento(mes, ano, valor); 
            recarregar(); 
            return true; 
        } catch (error) { 
            console.error("Erro ao salvar faturamento:", error);
            return false; 
        }
    };

    const somarFaturamentoPeriodo = async (meses: number[], ano: number) => {
        try {
            const response = await fetch(`${API_BASE}/faturamento/soma`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meses, ano })
            });
            if (!response.ok) return 0;
            const data = await response.json();
            return Number(data.valor) || 0;
        } catch (error) { 
            console.error("Erro ao somar faturamento:", error);
            return 0; 
        }
    };

    // NOVA FUNÇÃO: Persistência do Snapshot Financeiro
    const salvarSnapshot = async (descricao: string) => {
        try {
            const payload = {
                descricao,
                faturamento: dashboard.faturamento,
                total_despesas: dashboard.totalDespesas,
                total_investimentos: dashboard.totalInvestimentos,
                taxa_custo_fixo: dashboard.taxaCustoFixo,
                dados_backup: { despesas, investimentos }
            };

            const response = await fetch(`${API_BASE}/snapshots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Falha ao salvar snapshot no servidor");
            return true;
        } catch (error) {
            console.error("Erro ao persistir snapshot:", error);
            return false;
        }
    };

    return {
        loading, dashboard, despesas, investimentos,
        salvarItem, excluirItem, buscarFaturamentoMensal, salvarFaturamentoMensal, somarFaturamentoPeriodo, salvarSnapshot, recarregar
    };
}