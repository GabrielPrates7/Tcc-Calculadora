import type { Funcionario } from '../types';
import { api } from '../../../services/api'; // <-- Injeção do Interceptador Axios

type FuncionarioPayload = Partial<Funcionario> & {
    funcao_id?: number | string;
    salario_base?: number | string;
    salarioBase?: number | string;
};

export const FuncionariosService = {
    
    async listar(): Promise<Funcionario[]> {
        const res = await api.get('/funcionarios');
        return res.data;
    },

    async buscarRelatorio(inicio: string, fim: string): Promise<Funcionario[]> {
        try {
            const res = await api.get('/funcionarios/relatorio', { params: { inicio, fim } });
            return res.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: string, statusText?: string } };
            console.error("❌ Erro na API:", err.response?.data);
            throw new Error(`Falha ao filtrar: ${err.response?.statusText}`);
        }
    },

    async criar(dados: FuncionarioPayload): Promise<Funcionario> {
        const payload = {
            ...dados,
            funcao_id: Number(dados.funcao_id),
            salarioBase: Number(dados.salario_base || dados.salarioBase),
            valorEpi: Number(dados.valor_epi || 0),
            valorBeneficio: Number(dados.valor_beneficio || 0)
        };

        try {
            const res = await api.post('/funcionarios', payload);
            return res.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error("Erro na API ao criar:", err.response?.data);
            throw new Error(err.response?.data?.error || 'Erro ao criar funcionário');
        }
    },

    async atualizar(id: number, dados: FuncionarioPayload): Promise<void> {
        const payload = {
             ...dados,
             funcao_id: dados.funcao_id ? Number(dados.funcao_id) : undefined,
             salarioBase: (dados.salario_base || dados.salarioBase) ? Number(dados.salario_base || dados.salarioBase) : undefined,
             valorEpi: dados.valor_epi !== undefined ? Number(dados.valor_epi) : undefined,
             valorBeneficio: dados.valor_beneficio !== undefined ? Number(dados.valor_beneficio) : undefined
        };

        try {
            await api.put(`/funcionarios/${id}`, payload);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Erro ao atualizar funcionário');
        }
    },

    async excluir(id: number): Promise<void> {
        try {
            await api.delete(`/funcionarios/${id}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            throw new Error(err.response?.data?.error || 'Erro ao excluir funcionário');
        }
    }
};