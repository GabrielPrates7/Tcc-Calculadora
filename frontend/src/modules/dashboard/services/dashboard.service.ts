import type { DashboardResumo } from '../types/index';

const API_URL = 'http://localhost:3000/dashboard';

export const dashboardService = {
    async getResumo(): Promise<DashboardResumo> {
        const response = await fetch(`${API_URL}/resumo`);
        if (!response.ok) throw new Error('Erro ao buscar dados do dashboard');
        return response.json();
    }
};