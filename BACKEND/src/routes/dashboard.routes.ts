import { Router } from 'express';
import { DashboardService } from '../services/dashboard.service';

const router = Router();
const dashboardService = new DashboardService();

router.get('/resumo', async (req, res) => {
    try {
        // Captura os parâmetros da URL ou usa a data atual como fallback
        const mes = req.query.mes ? Number(req.query.mes) : new Date().getMonth() + 1;
        const ano = req.query.ano ? Number(req.query.ano) : new Date().getFullYear();
        
        const dados = await dashboardService.getResumo(mes, ano);
        res.json(dados);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        res.status(500).json({ error: 'Erro interno ao processar dados do dashboard' });
    }
});

export default router;