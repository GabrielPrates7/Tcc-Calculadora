import { useState, useEffect, useCallback, useMemo } from 'react';
import { CustoObraService, type ObraHistorico } from '../services/custo-obra.service';

export function useCustoObra() {
    const [historicoTotal, setHistoricoTotal] = useState<ObraHistorico[]>([]);
    const [isLoadingHistorico, setIsLoadingHistorico] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 8;

    const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, obraId: number | null}>({ isOpen: false, obraId: null });
    
    // NOVO: Estado que guarda a obra que está a ser editada
    const [obraEmEdicao, setObraEmEdicao] = useState<ObraHistorico | null>(null);

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
                    console.error('Erro:', error);
                    setIsLoadingHistorico(false);
                }
            });
        return () => { isMounted = false; };
    }, []);

    const historicoFiltrado = useMemo(() => {
        if (!searchTerm) return historicoTotal;
        const lowerSearch = searchTerm.toLowerCase();
        return historicoTotal.filter(obra => 
            obra.titulo.toLowerCase().includes(lowerSearch) || 
            obra.cliente.toLowerCase().includes(lowerSearch)
        );
    }, [historicoTotal, searchTerm]);

    const totalItems = historicoFiltrado.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = historicoFiltrado.slice(indexOfFirstItem, indexOfLastItem);

    const getVisiblePages = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);
        if (currentPage <= 3) end = 5;
        else if (currentPage >= totalPages - 2) start = totalPages - 4;
        return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
    };

    // NOVO: Funções de manipulação da edição
    const iniciarEdicao = (obra: ObraHistorico) => {
        setObraEmEdicao(obra);
        // UX: Rola o ecrã suavemente até ao topo onde está o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const cancelarEdicao = () => {
        setObraEmEdicao(null);
    };

    return {
        historico: currentItems, 
        isLoadingHistorico,
        carregarHistorico,
        obraEmEdicao,       // Exportado para a UI
        iniciarEdicao,      // Exportado para a UI
        cancelarEdicao,     // Exportado para a UI
        pagination: {
            currentPage, setCurrentPage, totalPages, totalItems,
            getVisiblePages, indexOfFirstItem, indexOfLastItem,
            searchTerm, setSearchTerm: handleSearchChange 
        },
        deleteModal: {
            isOpen: deleteModalState.isOpen,
            open: (id: number) => setDeleteModalState({ isOpen: true, obraId: id }),
            close: () => setDeleteModalState({ isOpen: false, obraId: null }),
            confirm: async () => {
                const id = deleteModalState.obraId;
                if (id === null) return;
                try {
                    await CustoObraService.excluirObra(id);
                    setHistoricoTotal(prev => {
                        const novaLista = prev.filter(obra => obra.id !== id);
                        const totalPagesAfterDelete = Math.ceil(novaLista.length / itemsPerPage);
                        setCurrentPage(prevPage => (prevPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) ? totalPagesAfterDelete : prevPage);
                        return novaLista;
                    });
                    setDeleteModalState({ isOpen: false, obraId: null });
                } catch (error) {
                    console.error('Erro ao excluir:', error);
                }
            }
        }
    };
}