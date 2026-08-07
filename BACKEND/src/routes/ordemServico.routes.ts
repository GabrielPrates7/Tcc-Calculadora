import { Router, Request, Response } from 'express';
import { OrdemServicoService, IOrdemServicoEdicao } from '../services/ordemServico.service';

const router = Router();
const osService = new OrdemServicoService();

const STATUS_PRODUCAO_VALIDOS = ['fila', 'producao', 'pausado', 'pronto', 'entregue'];
const STATUS_FINANCEIRO_VALIDOS = ['pendente', 'sinal_pago', 'pago'];

// GET: Buscar todas as O.S. (com cálculo de atraso processado no SQL)
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

// PATCH: Atualizar status do Kanban ou Financeiro (com validação de Whitelist)
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID da Ordem de Serviço inválido.' });
        }

        const { status_producao, status_financeiro } = req.body;

        if (status_producao && !STATUS_PRODUCAO_VALIDOS.includes(status_producao)) {
            return res.status(400).json({ error: `Status de produção inválido. Permitidos: ${STATUS_PRODUCAO_VALIDOS.join(', ')}` });
        }

        if (status_financeiro && !STATUS_FINANCEIRO_VALIDOS.includes(status_financeiro)) {
            return res.status(400).json({ error: `Status financeiro inválido. Permitidos: ${STATUS_FINANCEIRO_VALIDOS.join(', ')}` });
        }

        const osAtualizada = await osService.atualizarStatus(id, status_producao, status_financeiro);
        res.status(200).json(osAtualizada);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao atualizar status');
        console.error("Erro ao atualizar O.S.:", err.message);
        const statusCode = err.message.includes('não encontrada') ? 404 : 400;
        res.status(statusCode).json({ error: err.message });
    }
});

// PUT: Atualizar dados completos da O.S. (com sanitização explícita do payload)
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID da Ordem de Serviço inválido.' });
        }

        const dadosSanitizados: IOrdemServicoEdicao = {
            data_entrega: req.body.data_entrega,
            responsaveis_execucao: req.body.responsaveis_execucao,
            observacoes: req.body.observacoes,
            laudo_tecnico: req.body.laudo_tecnico,
            custo_extra_materiais: req.body.custo_extra_materiais,
            descricao_materiais_extras: req.body.descricao_materiais_extras,
            data_finalizacao: req.body.data_finalizacao
        };

        const osAtualizada = await osService.atualizarDados(id, dadosSanitizados);
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