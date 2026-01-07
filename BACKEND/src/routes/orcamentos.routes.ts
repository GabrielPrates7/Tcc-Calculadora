import { Router, Request, Response } from 'express';
import { OrcamentoService } from '../services/orcamento.service';

const router = Router();
const orcamentoService = new OrcamentoService();

// CRIAR
router.post('/', async (req: Request, res: Response) => {
    try {
        const novoOrcamento = await orcamentoService.criarOrcamento(req.body);
        res.json(novoOrcamento);
    } catch (err) {
        const mensagemErro = (err as Error).message;
        res.status(400).json({ error: mensagemErro });
    }
});

// LISTAR
router.get('/', async (req: Request, res: Response) => {
    try {
        const lista = await orcamentoService.listarOrcamentos();
        res.json(lista);
    } catch (err) {
        res.status(500).send('Erro ao listar orçamentos');
    }
});

// DELETAR (NOVO)
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await orcamentoService.deletarOrcamento(Number(id));
        res.json({ message: 'Orçamento excluído' });
    } catch (err) {
        res.status(500).send('Erro ao excluir');
    }
});

// ATUALIZAR (NOVO)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const atualizado = await orcamentoService.atualizarOrcamento(Number(id), req.body);
        res.json(atualizado);
    } catch (err) {
        const mensagemErro = (err as Error).message;
        res.status(400).json({ error: mensagemErro });
    }
});

export default router;