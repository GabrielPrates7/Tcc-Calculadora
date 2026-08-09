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
                if (montado) setOrdens(data);
            } catch (error) {
                console.error("Erro ao carregar O.S.", error);
            } finally {
                if (montado) setLoading(false);
            }
        }
        buscaInicial();
        return () => { montado = false; };
    }, []);

    const moverOrdem = async (osId: number, novaColuna: string) => {
        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_producao: novaColuna as OrdemServico['status_producao'] } : os
        ));
        try {
            const osAtualizada = await OrdemServicoService.atualizarStatus(osId, novaColuna);
            setOrdens(prev => prev.map(os => os.os_id === osId ? { ...os, ...osAtualizada } : os));
        } catch (error) {
            console.error("Falha ao mover a Ordem de Serviço:", error);
            alert('Erro de conexão ao mover o cartão. Recarregando quadro...');
            carregarOrdens(true);
        }
    };

    const atualizarOrdemCompleta = async (id: number, dados: Partial<OrdemServico>) => {
        setOrdens(prev => prev.map(os => os.os_id === id ? { ...os, ...dados } : os));
        try {
            const osAtualizada = await OrdemServicoService.atualizarDados(id, dados);
            setOrdens(prev => prev.map(os => os.os_id === id ? { ...os, ...osAtualizada, os_id: id } : os));
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

    const registrarPagamento = async (osId: number, dados: { valor: number, forma_pagamento: string, data_pagamento: string }) => {
        try {
            const osAtualizada = await OrdemServicoService.registrarPagamento(osId, dados);
            setOrdens(prev => prev.map(os => os.os_id === osId ? { ...os, ...osAtualizada } : os));
        } catch (error) {
            console.error("Falha ao registrar pagamento:", error);
            throw error;
        }
    };

    const excluirPagamento = async (osId: number, pagamentoId: number) => {
        try {
            const osAtualizada = await OrdemServicoService.excluirPagamento(pagamentoId);
            setOrdens(prev => prev.map(os => os.os_id === osId ? { ...os, ...osAtualizada } : os));
        } catch (error) {
            console.error("Falha ao estornar pagamento:", error);
            throw error; 
        }
    };

    return {
        ordens,
        loading,
        moverOrdem,
        atualizarOrdemCompleta,
        excluirOrdem,
        carregarOrdens,
        registrarPagamento,
        excluirPagamento
    };
}