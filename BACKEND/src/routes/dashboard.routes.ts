import { Router } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();
const dashboardService = new DashboardService();

// Protege todas as rotas de dashboard exigindo o JWT
router.use(verificarToken);

router.get('/resumo', async (req, res) => {
    try {
        const mes = req.query.mes ? Number(req.query.mes) : new Date().getMonth() + 1;
        const ano = req.query.ano ? Number(req.query.ano) : new Date().getFullYear();
        
        // O ID da empresa é extraído do token pelo middleware e passado ao serviço
        const empresaId = req.usuario!.empresa_id;
        
        const dados = await dashboardService.getResumo(mes, ano, empresaId);
        res.json(dados);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        res.status(500).json({ error: 'Erro interno ao processar dados do dashboard' });
    }
});

export default router;