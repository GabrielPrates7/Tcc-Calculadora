import { useState, useEffect } from 'react';
import type { DashboardResumo } from '../types';

const API_URL = 'http://localhost:3000/api/dashboard';

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
                const response = await fetch(`${API_URL}/resumo?mes=${mes}&ano=${ano}`);
                
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `Erro interno no servidor (Status: ${response.status})`);
                }
                
                const data = await response.json();
                
                if (isMounted) {
                    setDados(data);
                }
            } catch (err) { // Tipagem 'any' removida
                console.error("Falha no Dashboard:", err);
                if (isMounted) {
                    // Validação estrita de tipo para extrair a mensagem
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