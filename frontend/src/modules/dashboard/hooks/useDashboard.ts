import { useState, useEffect } from 'react';
import type { DashboardResumo } from '../types';
import { dashboardService } from '../services/dashboard.service'; // Utilizando o serviço atualizado

export function useDashboard() {
    const [dados, setDados] = useState<DashboardResumo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
    const [ano, setAno] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        let isMounted = true;

        const carregarDados = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Chamada usando o serviço com axios
                const data = await dashboardService.getResumo(mes, ano);
                
                if (isMounted) {
                    setDados(data);
                }
            } catch (err: unknown) { 
                console.error("Falha no Dashboard:", err);
                if (isMounted) {
                    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar os dados.';
                    setError(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        carregarDados();

        return () => {
            isMounted = false;
        };
    }, [mes, ano]);

    return { dados, loading, error, mes, setMes, ano, setAno };
}