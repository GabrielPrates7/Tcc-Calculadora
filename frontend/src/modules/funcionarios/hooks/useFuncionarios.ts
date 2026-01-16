import { useState, useEffect } from 'react';
// Importamos o novo tipo aqui
import type { Funcionario, FuncionarioInput } from '../types';

const API_URL = 'http://localhost:3000/funcionarios';

export function useFuncionarios() {
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                const res = await fetch(API_URL);
                const data = await res.json();
                setFuncionarios(data);
            } catch (error) {
                console.error("Erro ao carregar funcionários:", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [versao]);

    // CORREÇÃO: A função aceita o Union Type (Funcionario OU Input)
    // Isso satisfaz o TypeScript e remove o erro de 'any'
    const salvar = async (func: Funcionario | FuncionarioInput) => {
        try {
            const url = func.id ? `${API_URL}/${func.id}` : API_URL;
            const method = func.id ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(func)
            });

            setVersao(v => v + 1);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar funcionário.");
        }
    };

    const excluir = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            setVersao(v => v + 1);
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    const buscarRelatorio = async (dataInicio: string, dataFim: string) => {
        console.log("Buscar relatório", dataInicio, dataFim);
    };

    return {
        funcionarios,
        loading,
        salvar,
        excluir,
        buscarRelatorio
    };
}