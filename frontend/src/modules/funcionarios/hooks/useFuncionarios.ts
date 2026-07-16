import { useState, useEffect } from 'react';
import type { Funcionario, FuncionarioInput } from '../types';
import { FuncionariosService } from '../services/funcionarios.service';

export function useFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [versao, setVersao] = useState(0);

    // useEffect 100% isolado. A função assíncrona nasce e morre aqui dentro,
    // eliminando o useCallback e satisfazendo as regras estritas do linter.
    useEffect(() => {
        const carregarTodos = async () => {
            try {
                setLoading(true);
                const data = await FuncionariosService.listar();
                if (Array.isArray(data)) setFuncionarios(data);
            } catch (error) {
                console.error("Erro ao carregar:", error);
            } finally {
                setLoading(false);
            }
        };

        void carregarTodos();
    }, [versao]); // O recarregamento agora depende exclusivamente do gatilho 'versao'

    const buscarRelatorio = async (inicio: string, fim: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/funcionarios/relatorio?inicio=${inicio}&fim=${fim}`);
            
            if (res.ok) {
                const dados = await res.json();
                return Array.isArray(dados) ? dados : [];
            }

            console.warn("Rota específica de relatório não encontrada. Usando filtro local.");
            const resFallback = await fetch('http://localhost:3000/api/funcionarios');
            const todos: Funcionario[] = await resFallback.json();
            
            if (!Array.isArray(todos)) return [];

            return todos.filter(f => {
                if (!f.data_admissao) return false;
                
                const dataAdm = f.data_admissao.split('T')[0];
                const dataInat = f.data_inativacao ? f.data_inativacao.split('T')[0] : null;

                const admitidoNoTempo = dataAdm <= fim;
                const naoDemitidoAntes = !dataInat || dataInat >= inicio;

                return admitidoNoTempo && naoDemitidoAntes;
            });

        } catch (error) {
            console.error("Erro no relatório:", error);
            throw error; 
        }
    };

    const salvar = async (func: Funcionario | FuncionarioInput) => {
        try {
            if (func.id) await FuncionariosService.atualizar(func.id, func);
            else await FuncionariosService.criar(func);
            setVersao(v => v + 1);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    const excluir = async (id: number) => {
        try {
            await fetch(`http://localhost:3000/api/funcionarios/${id}`, { method: 'DELETE' });
            recarregarLista();
        } catch (error) {
            console.error(error);
        }
    };

    const recarregarLista = () => setVersao(v => v + 1);

    return {
        funcionarios,
        loading,
        salvar,
        excluir,
        buscarRelatorio, 
        recarregarLista
    };
}