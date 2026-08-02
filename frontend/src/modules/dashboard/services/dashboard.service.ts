import type { DashboardResumo } from '../types/index';

// Raciocínio: O prefixo '/api' deve ser padrão na comunicação Frontend <-> Backend.
// Em ambiente real, substitua o fallback pela variável do seu bundler (ex: import.meta.env.VITE_API_URL).
const BASE_URL = 'http://localhost:3000/api';
const ENDPOINT = `${BASE_URL}/dashboard/resumo`;

export const dashboardService = {
  async getResumo(): Promise<DashboardResumo> {
    const response = await fetch(ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Explicação: Lançar o status junto à mensagem facilita o debug de erros HTTP (400, 401, 404, 500)
      // sem precisar abrir a aba Network do navegador habitualmente.
      throw new Error(`Falha ao buscar resumo do dashboard [HTTP ${response.status}]`);
    }

    const data: DashboardResumo = await response.json();
    return data;
  },
};