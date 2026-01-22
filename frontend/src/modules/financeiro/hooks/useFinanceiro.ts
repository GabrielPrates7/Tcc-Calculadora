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

    // Atualiza o faturamento Global (Configuração Padrão)
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

    // --- NOVAS FUNÇÕES PARA FATURAMENTO MENSAL ---

    // 1. Busca o faturamento de um mês específico
    const buscarFaturamentoMensal = async (mes: number, ano: number) => {
        try {
            const response = await fetch(`${API_BASE}/financeiro/faturamento/${mes}/${ano}`);
            
            if (!response.ok) return null;
            
            const data = await response.json();
            
            // Log para debug (verificar se o banco retornou valor)
            // console.log(`HOOK: Buscando Faturamento ${mes}/${ano}:`, data);

            // CORREÇÃO: Converte string do banco para Number
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
                headers: { 'Content-Type': 'application/json' }, // Header OBRIGATÓRIO
                body: JSON.stringify({ mes, ano, valor })
            });
            
            if (response.ok) {
                console.log("HOOK: Faturamento salvo com sucesso!");
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

    return {
        loading,
        dashboard,
        despesas,
        investimentos,
        salvarItem,
        excluirItem,
        atualizarFaturamento,
        buscarFaturamentoMensal,
        salvarFaturamentoMensal
    };
}