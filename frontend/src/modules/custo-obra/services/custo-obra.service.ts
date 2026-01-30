import type { CustoConfig, CustoObraResponse, HistoricoItem } from '../types';

const API_URL = 'http://localhost:3000/calculo-obra';

export const CustoObraService = {
    // Busca os dados iniciais da tela (Configuração atual + Cálculo atual)
    async buscar(): Promise<CustoObraResponse> {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Falha ao buscar dados iniciais');
        return res.json();
    },

    // Busca a lista do histórico (Tabela de baixo)
    async listarHistorico(): Promise<HistoricoItem[]> {
        const res = await fetch(`${API_URL}/historico`);
        if (!res.ok) throw new Error('Falha ao carregar histórico');
        return res.json();
    },

    // Salva ou Recalcula (Botões laranja)
    async atualizar(dados: CustoConfig): Promise<void> {
        const res = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        // Importante: Verifica se o salvamento funcionou
        if (!res.ok) {
            throw new Error('Falha ao salvar/atualizar cálculo');
        }
    },

    // Exclui um item do histórico (Lixeira)
    async excluirHistorico(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/historico/${id}`, {
            method: 'DELETE'
        });

        // CORREÇÃO CRÍTICA: Se o servidor não responder 200 OK, lança erro
        // Isso impede que o item suma da tela se não sumiu do banco
        if (!res.ok) {
            throw new Error('Falha ao excluir no servidor');
        }
    },

    // Renomeia um item (Lápis)
    async renomearHistorico(id: number, novoTitulo: string): Promise<void> {
        const res = await fetch(`${API_URL}/historico/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoTitulo })
        });

        if (!res.ok) {
            throw new Error('Falha ao renomear');
        }
    }
};