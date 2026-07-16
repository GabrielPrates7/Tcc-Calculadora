import { useState, useEffect } from 'react';
import { OrdemServicoService } from '../services/ordemServico.service';
import type { OrdemServico } from '../types';

export function useKanban() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarOrdens();
    }, []);

    const carregarOrdens = async () => {
        setLoading(true);
        try {
            const data = await OrdemServicoService.listarTodas();
            setOrdens(data);
        } catch (error) {
            console.error("Erro ao carregar O.S.", error);
        } finally {
            setLoading(false);
        }
    };

    // Função que move o cartão e salva no banco
    const moverOrdem = async (osId: number, novaColuna: string) => {
        // 1. Atualiza a tela instantaneamente (dá a sensação de sistema super rápido)
        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_producao: novaColuna as OrdemServico['status_producao'] } : os
        ));

        // 2. Salva no banco de dados em segundo plano
        try {
            await OrdemServicoService.atualizarStatus(osId, novaColuna);
        } catch (error) {
            console.error("Falha ao mover a O.S:", error);
            alert('Erro de conexão ao mover o cartão. Recarregando quadro...');
            carregarOrdens(); // Desfaz a ação caso a internet caia
        }
    };

    // Função que atualiza o dinheiro e salva no banco
    const atualizarPagamento = async (osId: number, novoStatus: OrdemServico['status_financeiro']) => {
        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_financeiro: novoStatus } : os
        ));

        try {
            await OrdemServicoService.atualizarStatus(osId, undefined, novoStatus);
        } catch (error) {
            console.error("Falha ao atualizar financeiro:", error);
            alert('Erro de conexão ao atualizar pagamento. Recarregando...');
            carregarOrdens();
        }
    };

    return {
        ordens,
        loading,
        moverOrdem,
        atualizarPagamento
    };
}