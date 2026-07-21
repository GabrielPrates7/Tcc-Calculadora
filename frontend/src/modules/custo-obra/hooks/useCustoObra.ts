import { useState, useEffect, useCallback, useMemo } from 'react';
import { CustoObraService, type ObraHistorico } from '../services/custo-obra.service';

export function useCustoObra() {
    const [historicoTotal, setHistoricoTotal] = useState<ObraHistorico[]>([]);
    const [isLoadingHistorico, setIsLoadingHistorico] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 8;

    // CORREÇÃO ARQUITETURAL: Interceptador de Estado (State Batching).
    // Atualiza os dois estados na mesma fila de execução, eliminando o Render em Cascata.
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); 
    };

    const carregarHistorico = useCallback(async () => {
        await Promise.resolve();
        try {
            setIsLoadingHistorico(true);
            const dados = await CustoObraService.listarHistorico();
            setHistoricoTotal(dados);
            setCurrentPage(1); 
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setIsLoadingHistorico(false);
        }
    }, []);

    const excluirObra = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta base de cálculo?')) return;
        try {
            await CustoObraService.excluirObra(id);
            setHistoricoTotal(prev => prev.filter(obra => obra.id !== id));
        } catch (error) {
            console.error('Erro ao excluir obra:', error);
            alert('Falha ao excluir a obra do banco de dados.');
        }
    };

    useEffect(() => {
        let isMounted = true;
        CustoObraService.listarHistorico()
            .then(dados => {
                if (isMounted) {
                    setHistoricoTotal(dados);
                    setIsLoadingHistorico(false);
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error('Erro ao carregar histórico inicial:', error);
                    setIsLoadingHistorico(false);
                }
            });
        return () => { isMounted = false; };
    }, []);

    // ============================================================================
    // MOTOR DE FILTRO (useMemo para alta performance)
    // ============================================================================
    const historicoFiltrado = useMemo(() => {
        if (!searchTerm) return historicoTotal;

        const lowerSearch = searchTerm.toLowerCase();
        return historicoTotal.filter(obra => 
            obra.titulo.toLowerCase().includes(lowerSearch) || 
            obra.cliente.toLowerCase().includes(lowerSearch)
        );
    }, [historicoTotal, searchTerm]);

    // ============================================================================
    // MATEMÁTICA DE PAGINAÇÃO
    // ============================================================================
    const totalItems = historicoFiltrado.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    const currentItems = historicoFiltrado.slice(indexOfFirstItem, indexOfLastItem);

    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);

        if (currentPage <= 3) {
            end = 5;
        } else if (currentPage >= totalPages - 2) {
            start = totalPages - 4;
        }

        return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
    };

    return {
        historico: currentItems, 
        isLoadingHistorico,
        carregarHistorico,
        excluirObra,
        pagination: {
            currentPage,
            setCurrentPage,
            totalPages,
            totalItems,
            getVisiblePages,
            indexOfFirstItem,
            indexOfLastItem,
            searchTerm,      
            setSearchTerm: handleSearchChange // A UI continua consumindo a mesma propriedade de forma opaca
        }
    };
}