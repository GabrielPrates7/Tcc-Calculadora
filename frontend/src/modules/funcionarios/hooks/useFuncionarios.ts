import { useState, useCallback } from 'react';
import type { Funcionario, FuncionarioInput } from '../types';

// O fallback para localhost garante que funcione local, mas permite injeção de variável em produção
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    
    // Estado isolado para o Resumo Financeiro (Agregado pelo SGBD)
    const [resumo, setResumo] = useState({ totalAtivos: 0, custoFolha: 0, custoProducao: 0 });
    const [loading, setLoading] = useState(false);

    const carregarResumo = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/funcionarios/resumo`);
            if (res.ok) {
                const data = await res.json();
                setResumo(data);
            }
        } catch (error) {
            console.error("Erro ao carregar resumo financeiro:", error);
        }
    }, []);

    const carregarLista = useCallback(async (filtros: FiltrosPesquisa) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(filtros.pagina || 1));
            params.append('limit', String(filtros.limite || 8));
            
            if (filtros.busca) params.append('busca', filtros.busca);
            if (filtros.setor && filtros.setor !== 'todos') params.append('setor', filtros.setor);
            if (filtros.status && filtros.status !== 'todos') params.append('status', filtros.status);
            if (filtros.funcao && filtros.funcao !== 'todas') params.append('funcao', filtros.funcao);
            if (filtros.ordenarPor) params.append('ordenarPor', filtros.ordenarPor);
            if (filtros.direcaoOrdem) params.append('direcaoOrdem', filtros.direcaoOrdem);

            const res = await fetch(`${API_URL}/funcionarios?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Assume a estrutura retornada pelo listarPaginado() do Backend
                setFuncionarios(data.dados || []);
                setTotalRegistros(data.total || 0);
                setTotalPaginas(data.paginas || 0);
            }
        } catch (error) {
            console.error("Erro ao carregar lista paginada:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const salvar = async (func: Funcionario | FuncionarioInput) => {
        try {
            const isEdicao = !!func.id;
            const url = isEdicao ? `${API_URL}/funcionarios/${func.id}` : `${API_URL}/funcionarios`;
            const method = isEdicao ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(func)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao processar salvamento no servidor.');
            }
            
            // O componente que chamou (Funcionarios.tsx) será responsável por invocar a recarga da tabela
        } catch (error) {
            console.error("Erro no serviço de salvamento:", error);
            throw error; 
        }
    };

    const excluir = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/funcionarios/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Erro ao excluir.');
            }
        } catch (error) {
            console.error("Erro no serviço de exclusão:", error);
            throw error;
        }
    };

    const buscarRelatorio = async (inicio: string, fim: string) => {
        try {
            // Requisição com limite estourado para garantir que todos os dados do PDF sejam baixados. 
            // Uma rota dedicada no SQL seria ideal futuramente.
            const res = await fetch(`${API_URL}/funcionarios?limit=10000`);
            const data = await res.json();
            
            // Força a tipagem estrita aqui para o TypeScript inferir no callback do filter
            const todos: Funcionario[] = Array.isArray(data.dados) ? data.dados : [];

            return todos.filter((f) => {
                if (!f.data_admissao) return false;
                
                // Converte para string antes de usar o split para garantir segurança de tipo
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