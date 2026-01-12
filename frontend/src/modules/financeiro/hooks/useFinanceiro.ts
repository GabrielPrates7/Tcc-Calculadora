import { useState, useEffect } from 'react';
import { FinanceiroService } from '../services/financeiro.service';
import type { ItemFinanceiro, DashboardData } from '../types';

export function useFinanceiro() {
    const [loading, setLoading] = useState(true);
    const [versaoDados, setVersaoDados] = useState(0);

    // Dados
    const [dashboard, setDashboard] = useState<DashboardData>({
        faturamento: 0, totalDespesas: 0, totalInvestimentos: 0, taxaCustoFixo: 0
    });
    const [despesas, setDespesas] = useState<ItemFinanceiro[]>([]);
    const [investimentos, setInvestimentos] = useState<ItemFinanceiro[]>([]);

    useEffect(() => {
        async function carregar() {
            setLoading(true);
            try {
                // Carrega tudo em paralelo para ser mais rápido
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

    const atualizarFaturamento = async (valor: number) => {
        try {
            await FinanceiroService.atualizarConfig(valor);
            recarregar();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return {
        loading,
        dashboard,
        despesas,
        investimentos,
        salvarItem,
        excluirItem,
        atualizarFaturamento
    };
}