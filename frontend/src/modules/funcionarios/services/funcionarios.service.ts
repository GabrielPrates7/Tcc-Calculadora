import type { Funcionario } from '../types';

const API_URL = 'http://localhost:3000/api/funcionarios';

// Interseção de tipos: Herda Funcionario e adiciona as chaves flexíveis necessárias para o POST/PUT
type FuncionarioPayload = Partial<Funcionario> & {
    funcao_id?: number | string;
    salario_base?: number | string;
    salarioBase?: number | string;
};

export const FuncionariosService = {
    
    async listar(): Promise<Funcionario[]> {
        const res = await fetch(API_URL);
        if (!res.ok) {
            throw new Error('Erro ao buscar lista de funcionários');
        }
        return res.json();
    },

    async buscarRelatorio(inicio: string, fim: string): Promise<Funcionario[]> {
        const query = new URLSearchParams({ inicio, fim }).toString();
        const url = `${API_URL}/relatorio?${query}`;
        
        const res = await fetch(url);
        
        if (!res.ok) {
            const erroMsg = await res.text();
            console.error("❌ Erro na API:", erroMsg);
            throw new Error(`Falha ao filtrar: ${res.statusText}`);
        }

        return res.json();
    },

    async criar(dados: FuncionarioPayload): Promise<Funcionario> {
        const payload = {
            ...dados,
            funcao_id: Number(dados.funcao_id),
            salarioBase: Number(dados.salario_base || dados.salarioBase),
            epi: Number(dados.epi || 0)
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
            const erroMsg = await res.text();
            console.error("Erro na API ao criar:", erroMsg);
            throw new Error('Erro ao criar funcionário');
        }
        return res.json();
    },

    async atualizar(id: number, dados: FuncionarioPayload): Promise<void> {
        const payload = {
             ...dados,
             funcao_id: dados.funcao_id ? Number(dados.funcao_id) : undefined,
             salarioBase: (dados.salario_base || dados.salarioBase) ? Number(dados.salario_base || dados.salarioBase) : undefined,
             epi: dados.epi !== undefined ? Number(dados.epi) : undefined
        };

        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Erro ao atualizar funcionário');
    },

    async excluir(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Erro ao excluir funcionário');
    }
};