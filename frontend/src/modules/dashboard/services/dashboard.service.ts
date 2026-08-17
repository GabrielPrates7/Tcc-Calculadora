import type { DashboardResumo } from '../types/index';
import { api } from '../../../services/api';

export const dashboardService = {
  async getResumo(mes?: number, ano?: number): Promise<DashboardResumo> {
    try {
      // O Axios envia automaticamente os headers e o token JWT (via interceptador)
      const response = await api.get('/dashboard/resumo', {
          params: { mes, ano }
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number, data?: { error?: string } } };
      throw new Error(err.response?.data?.error || `Falha ao buscar resumo do dashboard [HTTP ${err.response?.status}]`);
    }
  },
};