import { Router, Request, Response } from 'express';
import { OrcamentoService } from '../services/orcamento.service';

const router = Router();
const orcamentoService = new OrcamentoService();

// GET: Listar
router.get('/', async (req: Request, res: Response) => {
    try {
        const orcamentos = await orcamentoService.listarOrcamentos();
        res.json(orcamentos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar orçamentos.' });
    }
});

// POST: Criar
router.post('/', async (req: Request, res: Response) => {
    try {
        // Mapeia o body do request para o DTO esperado
        const dados = {
            cliente: req.body.cliente,
            nomeProduto: req.body.nome_produto,
            custoMercadoria: Number(req.body.custo_materiais),
            tempoGasto: Number(req.body.horas_trabalhadas),
            lucroPct: Number(req.body.lucro_desejado),
            impostoPct: Number(req.body.imposto)
        };

        const novoOrcamento = await orcamentoService.criarOrcamento(dados);
        res.json(novoOrcamento);
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Erro ao criar orçamento.' });
    }
});

// PUT: Atualizar
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const dados = {
            cliente: req.body.cliente,
            nomeProduto: req.body.nome_produto,
            custoMercadoria: Number(req.body.custo_materiais),
            tempoGasto: Number(req.body.horas_trabalhadas),
            lucroPct: Number(req.body.lucro_desejado),
            impostoPct: Number(req.body.imposto)
        };

        const atualizado = await orcamentoService.atualizarOrcamento(Number(req.params.id), dados);
        res.json(atualizado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar orçamento.' });
    }
});

// DELETE: Excluir
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await orcamentoService.deletarOrcamento(Number(req.params.id));
        res.json({ message: 'Excluído com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao excluir.' });
    }
});

export default router;