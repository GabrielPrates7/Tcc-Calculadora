import { useState, useEffect, useCallback } from 'react';
import { OrdemServicoService } from '../services/ordemServico.service';
import type { OrdemServico } from '../types';

export function useKanban() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    // O estado já inicia como true, evitando setState síncrono no primeiro render
    const [loading, setLoading] = useState(true);

    const carregarOrdens = useCallback(async () => {
        try {
            const data = await OrdemServicoService.listarTodas();
            setOrdens(data);
        } catch (error) {
            console.error("Erro ao carregar O.S.", error);
        } finally {
            setLoading(false);
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
        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_producao: novaColuna as OrdemServico['status_producao'] } : os
        ));

        try {
            await OrdemServicoService.atualizarStatus(osId, novaColuna);
        } catch (error) {
            console.error("Falha ao mover a O.S:", error);
            alert('Erro de conexão ao mover o cartão. Recarregando quadro...');
            carregarOrdens();
        }
    };

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

    const atualizarOrdemCompleta = async (id: number, dados: Partial<OrdemServico>) => {
        setOrdens(prev => prev.map(os => 
            os.os_id === id ? { ...os, ...dados } : os
        ));

        try {
            const osAtualizada = await OrdemServicoService.atualizarDados(id, dados);
            setOrdens(prev => prev.map(os => os.os_id === id ? osAtualizada : os));
        } catch (error) {
            console.error("Falha ao salvar edições:", error);
            alert('Erro ao salvar alterações da O.S. no servidor.');
            carregarOrdens();
        }
    };

    const excluirOrdem = async (id: number) => {
        setOrdens(prev => prev.filter(os => os.os_id !== id));

        try {
            await OrdemServicoService.excluir(id);
        } catch (error) {
            console.error("Falha ao excluir O.S:", error);
            alert('Erro ao excluir a Ordem de Serviço no servidor.');
            carregarOrdens();
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