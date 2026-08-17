import { useState, useCallback } from 'react';
import type { Funcionario, FuncionarioInput } from '../types';
import { api } from '../../../services/api'; // <-- Injeção do Interceptador Axios

export interface FiltrosPesquisa {
    pagina: number;
    limite: number;
    busca?: string;
    setor?: string;
    status?: string;
    funcao?: string;
    ordenarPor?: string;
    direcaoOrdem?: 'asc' | 'desc';
}

export function useFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    
    const [resumo, setResumo] = useState({ totalAtivos: 0, custoFolha: 0, custoProducao: 0 });
    const [loading, setLoading] = useState(false);

    const carregarResumo = useCallback(async () => {
        try {
            const res = await api.get('/funcionarios/resumo');
            setResumo(res.data);
        } catch (error) {
            console.error("Erro ao carregar resumo financeiro:", error);
        }
    }, []);

    const carregarLista = useCallback(async (filtros: FiltrosPesquisa) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: filtros.pagina || 1,
                limit: filtros.limite || 8
            };
            
            if (filtros.busca) params.busca = filtros.busca;
            if (filtros.setor && filtros.setor !== 'todos') params.setor = filtros.setor;
            if (filtros.status && filtros.status !== 'todos') params.status = filtros.status;
            if (filtros.funcao && filtros.funcao !== 'todas') params.funcao = filtros.funcao;
            if (filtros.ordenarPor) params.ordenarPor = filtros.ordenarPor;
            if (filtros.direcaoOrdem) params.direcaoOrdem = filtros.direcaoOrdem;

            const res = await api.get('/funcionarios', { params });
            const data = res.data;
            
            setFuncionarios(data.dados || []);
            setTotalRegistros(data.total || 0);
            setTotalPaginas(data.paginas || 0);
        } catch (error) {
            console.error("Erro ao carregar lista paginada:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const salvar = async (func: Funcionario | FuncionarioInput) => {
        try {
            const isEdicao = !!func.id;
            const url = isEdicao ? `/funcionarios/${func.id}` : `/funcionarios`;

            if (isEdicao) {
                await api.put(url, func);
            } else {
                await api.post(url, func);
            }
        } catch (error: unknown) {
            console.error("Erro no serviço de salvamento:", error);
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Erro ao processar salvamento no servidor.');
        }
    };

    const excluir = async (id: number) => {
        try {
            await api.delete(`/funcionarios/${id}`);
        } catch (error: unknown) {
            console.error("Erro no serviço de exclusão:", error);
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Erro ao excluir.');
        }
    };

    const buscarRelatorio = async (inicio: string, fim: string) => {
        try {
            const res = await api.get('/funcionarios', { params: { limit: 10000 } });
            const data = res.data;
            
            const todos: Funcionario[] = Array.isArray(data.dados) ? data.dados : [];

            return todos.filter((f) => {
                if (!f.data_admissao) return false;
                
                const dataAdm = String(f.data_admissao).split('T')[0];
                const dataInat = f.data_inativacao ? String(f.data_inativacao).split('T')[0] : null;

                const admitidoNoTempo = dataAdm <= fim;
                const naoDemitidoAntes = !dataInat || dataInat >= inicio;

                return admitidoNoTempo && naoDemitidoAntes;
            });
        } catch (error) {
            console.error("Erro ao buscar relatório PDF:", error);
            throw error; 
        }
    };

    return {
        funcionarios,
        totalRegistros,
        totalPaginas,
        resumo,
        loading,
        carregarLista,
        carregarResumo,
        salvar,
        excluir,
        buscarRelatorio
    };
}