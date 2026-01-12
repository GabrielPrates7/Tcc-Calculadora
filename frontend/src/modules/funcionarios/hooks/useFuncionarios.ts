// ARQUIVO: src/modules/funcionarios/hooks/useFuncionarios.ts
import { useState, useEffect } from 'react'; // REMOVIDO: useCallback
import type { Funcionario } from '../types/index'; // AJUSTE: Apontando para /index explicitamente
import { FuncionariosService } from '../services/funcionarios.service';

export function useFuncionarios() {
    // Estado dos Dados
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState(true);
    const [versaoDados, setVersaoDados] = useState(0); // Gatilho para recarregar

    // Carregar dados
    useEffect(() => {
        async function carregar() {
            setLoading(true);
            try {
                const dados = await FuncionariosService.listar();
                setFuncionarios(dados);
            } catch (error) {
                console.error("Erro ao carregar funcionários:", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [versaoDados]);

    // Função para forçar recarregamento
    const recarregar = () => setVersaoDados(v => v + 1);

    // Ações do CRUD
    const salvar = async (dados: Partial<Funcionario>) => {
        try {
            if (dados.id) {
                await FuncionariosService.atualizar(dados.id, dados);
            } else {
                await FuncionariosService.criar(dados);
            }
            recarregar();
            return true;
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar funcionário.");
            return false;
        }
    };

    const excluir = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            await FuncionariosService.excluir(id);
            recarregar();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir.");
        }
    };

    // Ações do Relatório
    const buscarRelatorio = async (inicio: string, fim: string) => {
        try {
            return await FuncionariosService.buscarRelatorio(inicio, fim);
        } catch (error) {
            console.error("Erro no relatório:", error);
            return [];
        }
    };

    return {
        funcionarios,
        loading,
        salvar,
        excluir,
        buscarRelatorio,
        recarregar
    };
}