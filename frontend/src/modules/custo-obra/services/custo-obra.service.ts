import type { CustoConfig, CustoObraResponse } from '../types';

const API_URL = 'http://localhost:3000/calculo-obra';

export const CustoObraService = {
    async buscar(): Promise<CustoObraResponse> {
        const res = await fetch(API_URL);
        return res.json();
    },

    async atualizar(dados: CustoConfig): Promise<void> {
        await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
    }
};