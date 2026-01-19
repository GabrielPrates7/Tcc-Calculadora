// ARQUIVO: src/modules/funcionarios/services/funcionarios.service.ts

import type { Funcionario } from '../types';

const API_URL = 'http://localhost:3000/funcionarios';

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
        
        // LOG DE DEBUG: Ajuda a ver no navegador o que está sendo chamado
        console.log("🌐 [Frontend Service] Buscando URL:", url); 

        const res = await fetch(url);
        
        // SEGURANÇA: Se o backend der erro (ex: 400 ou 500), lançamos o erro aqui
        if (!res.ok) {
            const erroMsg = await res.text();
            console.error("❌ Erro na API:", erroMsg);
            throw new Error(`Falha ao filtrar: ${res.statusText}`);
        }

        return res.json();
    },

    async criar(dados: Partial<Funcionario>): Promise<Funcionario> {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
        if (!res.ok) throw new Error('Erro ao criar funcionário');
        return res.json();
    },

    async atualizar(id: number, dados: Partial<Funcionario>): Promise<void> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
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