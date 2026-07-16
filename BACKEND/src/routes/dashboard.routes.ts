import { Router } from 'express';
import { DashboardService } from '../services/dashboard.service';

const router = Router();
const dashboardService = new DashboardService();

router.get('/resumo', async (req, res) => {
    try {
        const dados = await dashboardService.getResumo();
        res.json(dados);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        res.status(500).json({ error: 'Erro interno ao processar dados do dashboard' });
    }
});

export default router;