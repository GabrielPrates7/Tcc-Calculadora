import { useState, useEffect, useCallback } from 'react';
import type { Funcionario, FuncionarioInput } from '../types';
import { FuncionariosService } from '../services/funcionarios.service';

export function useFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [versao, setVersao] = useState(0);

    // Carrega a lista principal (CRUD)
    const carregarTodos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await FuncionariosService.listar();
            if (Array.isArray(data)) setFuncionarios(data);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarTodos();
    }, [versao, carregarTodos]);

    // --- MUDANÇA AQUI: A função agora RETORNA os dados em vez de salvar no state ---
    const buscarRelatorio = async (inicio: string, fim: string) => {
        try {
            // Apenas busca e devolve. Não altera 'setFuncionarios'
            const dados = await FuncionariosService.buscarRelatorio(inicio, fim);
            return Array.isArray(dados) ? dados : [];
        } catch (error) {
            console.error("Erro no relatório:", error);
            throw error; // Deixa o Modal tratar o erro
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
        if (!confirm("Excluir funcionário?")) return;
        try { await FuncionariosService.excluir(id); setVersao(v => v + 1); }
        catch (error) { console.error(error); }
    };

    const recarregarLista = () => setVersao(v => v + 1);

    return {
        funcionarios,
        loading,
        salvar,
        excluir,
        buscarRelatorio, // Agora é uma função pura de busca
        recarregarLista
    };
}