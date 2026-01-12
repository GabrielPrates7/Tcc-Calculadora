// ARQUIVO: src/modules/funcionarios/services/funcionarios.service.ts

import type{ Funcionario } from '../types';

const API_URL = 'http://localhost:3000/funcionarios';

export const FuncionariosService = {
    
    async listar(): Promise<Funcionario[]> {
        const res = await fetch(API_URL);
        return res.json();
    },

    async buscarRelatorio(inicio: string, fim: string): Promise<Funcionario[]> {
        const query = new URLSearchParams({ inicio, fim }).toString();
        const res = await fetch(`${API_URL}/relatorio?${query}`);
        return res.json();
    },

    async criar(dados: Partial<Funcionario>): Promise<Funcionario> {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
        return res.json();
    },

    async atualizar(id: number, dados: Partial<Funcionario>): Promise<void> {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });
    },

    async excluir(id: number): Promise<void> {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
    }
};