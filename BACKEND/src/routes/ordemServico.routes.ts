import { Router, Request, Response } from 'express';
import { OrdemServicoService } from '../services/ordemServico.service';

const router = Router();
const osService = new OrdemServicoService();

// GET: Buscar todas as O.S.
router.get('/', async (req: Request, res: Response) => {
    try {
        const ordens = await osService.listarTodas();
        res.status(200).json(ordens);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao listar Ordens de Serviço');
        console.error("Erro ao listar O.S.:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST: Gerar O.S. a partir de um Orçamento
router.post('/', async (req: Request, res: Response) => {
    try {
        const { orcamento_id, data_entrega } = req.body;
        
        const idNumerico = Number(orcamento_id);
        if (!orcamento_id || isNaN(idNumerico) || idNumerico <= 0) {
            return res.status(400).json({ error: 'ID do orçamento é obrigatório e deve ser numérico.' });
        }

        const novaOS = await osService.criarDeOrcamento(idNumerico, data_entrega);
        res.status(201).json(novaOS);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao criar Ordem de Serviço');
        console.error("Erro ao criar O.S.:", err.message);

        if (err.message.includes('Já existe') || err.message.includes('already exists')) {
            return res.status(409).json({ 
                error: 'Este orçamento já possui uma Ordem de Serviço em andamento.' 
            });
        }

        res.status(400).json({ error: err.message });
    }
});

// PATCH: Atualizar status do Kanban ou Financeiro
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID da Ordem de Serviço inválido.' });
        }

        const { status_producao, status_financeiro } = req.body;
        const osAtualizada = await osService.atualizarStatus(id, status_producao, status_financeiro);
        res.status(200).json(osAtualizada);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao atualizar status');
        console.error("Erro ao atualizar O.S.:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// PUT: Atualizar dados completos da O.S. (Edição Operacional e Técnica)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID da Ordem de Serviço inválido.' });
        }

        const osAtualizada = await osService.atualizarDados(id, req.body);
        res.status(200).json(osAtualizada);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao atualizar dados da O.S.');
        console.error("Erro no PUT /ordens-servico:", err.message);
        const statusCode = err.message.includes('não encontrada') ? 404 : 500;
        res.status(statusCode).json({ error: err.message });
    }
});

// DELETE: Excluir uma Ordem de Serviço
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID inválido para exclusão.' });
        }

        await osService.excluir(id);
        res.status(204).send();
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao excluir O.S.');
        console.error("Erro no DELETE /ordens-servico:", err.message);
        const statusCode = err.message.includes('não encontrada') ? 404 : 500;
        res.status(statusCode).json({ error: err.message });
    }
});

export default router;