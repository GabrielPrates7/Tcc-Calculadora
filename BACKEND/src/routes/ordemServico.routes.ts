import { Router, Request, Response } from 'express';
import { OrdemServicoService } from '../services/ordemServico.service';

const router = Router();
const osService = new OrdemServicoService();

// GET: Buscar todas as O.S.
router.get('/', async (req: Request, res: Response) => {
    try {
        const ordens = await osService.listarTodas();
        res.json(ordens);
    } catch (error) {
        console.error("Erro ao listar O.S.:", error);
        res.status(500).json({ error: 'Erro ao listar Ordens de Serviço' });
    }
});

// POST: Gerar O.S. a partir de um Orçamento
router.post('/', async (req: Request, res: Response) => {
    try {
        const { orcamento_id, data_entrega } = req.body;
        if (!orcamento_id) {
            return res.status(400).json({ error: 'ID do orçamento é obrigatório' });
        }
        const novaOS = await osService.criarDeOrcamento(Number(orcamento_id), data_entrega);
        res.status(201).json(novaOS);
    } catch (error: any) {
        console.error("Erro ao criar O.S.:", error);
        res.status(400).json({ error: error.message || 'Erro ao criar Ordem de Serviço' });
    }
});

// PATCH: Atualizar status do Kanban ou Financeiro
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status_producao, status_financeiro } = req.body;
        
        const osAtualizada = await osService.atualizarStatus(Number(id), status_producao, status_financeiro);
        res.json(osAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar O.S.:", error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});

export default router;