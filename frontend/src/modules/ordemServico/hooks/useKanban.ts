import { useState, useEffect, useCallback } from 'react';
import { OrdemServicoService } from '../services/ordemServico.service';
import type { OrdemServico } from '../types';

export function useKanban() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);

    const carregarOrdens = useCallback(async (silencioso = false) => {
        if (!silencioso) setLoading(true);
        try {
            const data = await OrdemServicoService.listarTodas();
            setOrdens(data);
        } catch (error) {
            console.error("Erro ao carregar Ordens de Serviço:", error);
        } finally {
            if (!silencioso) setLoading(false);
        }
    }, []);

    useEffect(() => {
        let montado = true;

        async function buscaInicial() {
            try {
                const data = await OrdemServicoService.listarTodas();
                if (montado) {
                    setOrdens(data);
                }
            } catch (error) {
                console.error("Erro ao carregar O.S.", error);
            } finally {
                if (montado) {
                    setLoading(false);
                }
            }
        }

        buscaInicial();

        return () => {
            montado = false;
        };
    }, []);

    const moverOrdem = async (osId: number, novaColuna: string) => {
        // 1. Atualização Otimista na UI para resposta visual instantânea
        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_producao: novaColuna as OrdemServico['status_producao'] } : os
        ));

        try {
            // 2. Persistência no servidor e recebimento das variáveis calculadas (data_finalizacao, esta_atrasado)
            const osAtualizada = await OrdemServicoService.atualizarStatus(osId, novaColuna);
            
            // 3. Sincronização do estado local com a verdade do banco de dados
            setOrdens(prev => prev.map(os => 
                os.os_id === osId ? { ...os, ...osAtualizada } : os
            ));
        } catch (error) {
            console.error("Falha ao mover a Ordem de Serviço:", error);
            alert('Erro de conexão ao mover o cartão. Recarregando quadro...');
            carregarOrdens(true);
        }
    };

    const atualizarPagamento = async (osId: number, novoStatus: OrdemServico['status_financeiro']) => {
        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_financeiro: novoStatus } : os
        ));

        try {
            const osAtualizada = await OrdemServicoService.atualizarStatus(osId, undefined, novoStatus);
            setOrdens(prev => prev.map(os => 
                os.os_id === osId ? { ...os, ...osAtualizada } : os
            ));
        } catch (error) {
            console.error("Falha ao atualizar status financeiro:", error);
            alert('Erro de conexão ao atualizar pagamento. Recarregando...');
            carregarOrdens(true);
        }
    };

    const atualizarOrdemCompleta = async (id: number, dados: Partial<OrdemServico>) => {
        // Atualização otimista
        setOrdens(prev => prev.map(os => 
            os.os_id === id ? { ...os, ...dados } : os
        ));

        try {
            const osAtualizada = await OrdemServicoService.atualizarDados(id, dados);
            setOrdens(prev => prev.map(os => 
                os.os_id === id ? { ...os, ...osAtualizada, os_id: id } : os
            ));
        } catch (error) {
            console.error("Falha ao salvar edições da O.S.:", error);
            alert('Erro ao salvar alterações da O.S. no servidor.');
            carregarOrdens(true);
        }
    };

    const excluirOrdem = async (id: number) => {
        setOrdens(prev => prev.filter(os => os.os_id !== id));

        try {
            await OrdemServicoService.excluir(id);
        } catch (error) {
            console.error("Falha ao excluir Ordem de Serviço:", error);
            alert('Erro ao excluir a Ordem de Serviço no servidor.');
            carregarOrdens(true);
        }
    };

    return {
        ordens,
        loading,
        moverOrdem,
        atualizarPagamento,
        atualizarOrdemCompleta,
        excluirOrdem,
        carregarOrdens
    };
}