import { Router, Request, Response } from 'express';
import { OrdemServicoService, IOrdemServicoEdicao } from '../services/ordemServico.service';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();
const osService = new OrdemServicoService();

const STATUS_PRODUCAO_VALIDOS = ['fila', 'producao', 'pausado', 'pronto', 'entregue'];

// Protege todas as rotas de ordem de serviço
router.use(verificarToken);

// GET: Buscar todas as O.S.
router.get('/', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const ordens = await osService.listarTodas(empresaId);
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
        const empresaId = req.usuario!.empresa_id;
        
        const idNumerico = Number(orcamento_id);
        if (!orcamento_id || isNaN(idNumerico) || idNumerico <= 0) {
            return res.status(400).json({ error: 'ID do orçamento é obrigatório e deve ser numérico.' });
        }

        const novaOS = await osService.criarDeOrcamento(idNumerico, data_entrega, empresaId);
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

// PATCH: Atualizar status do Kanban
router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const empresaId = req.usuario!.empresa_id;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID da Ordem de Serviço inválido.' });
        }

        const { status_producao } = req.body;

        if (status_producao && !STATUS_PRODUCAO_VALIDOS.includes(status_producao)) {
            return res.status(400).json({ error: `Status de produção inválido. Permitidos: ${STATUS_PRODUCAO_VALIDOS.join(', ')}` });
        }

        const osAtualizada = await osService.atualizarStatus(id, status_producao, empresaId);
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
        const empresaId = req.usuario!.empresa_id;

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
            data_finalizacao: req.body.data_finalizacao,
            data_entregue: req.body.data_entregue,
            observacoes_cliente: req.body.observacoes_cliente
        };

        const osAtualizada = await osService.atualizarDados(id, dadosSanitizados, empresaId);
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
        const empresaId = req.usuario!.empresa_id;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID inválido para exclusão.' });
        }

        await osService.excluir(id, empresaId);
        res.status(204).send();
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao excluir O.S.');
        console.error("Erro no DELETE /ordens-servico:", err.message);
        const statusCode = err.message.includes('não encontrada') ? 404 : 500;
        res.status(statusCode).json({ error: err.message });
    }
});

// POST: Registrar novo pagamento na O.S.
router.post('/:id/pagamentos', async (req: Request, res: Response) => {
    try {
        const os_id = Number(req.params.id);
        const empresaId = req.usuario!.empresa_id;
        const { valor, forma_pagamento, data_pagamento } = req.body;

        if (isNaN(os_id) || os_id <= 0) return res.status(400).json({ error: 'ID da O.S. inválido.' });
        if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) return res.status(400).json({ error: 'Valor inválido.' });
        if (!forma_pagamento) return res.status(400).json({ error: 'Forma de pagamento obrigatória.' });

        const osAtualizada = await osService.registrarPagamento(os_id, Number(valor), forma_pagamento, data_pagamento, empresaId);
        res.status(201).json(osAtualizada);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao registrar pagamento');
        console.error("Erro no POST pagamentos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Excluir um pagamento específico
router.delete('/pagamentos/:pagamentoId', async (req: Request, res: Response) => {
    try {
        const pagamentoId = Number(req.params.pagamentoId);
        const empresaId = req.usuario!.empresa_id;

        if (isNaN(pagamentoId) || pagamentoId <= 0) return res.status(400).json({ error: 'ID de pagamento inválido.' });

        const osAtualizada = await osService.excluirPagamento(pagamentoId, empresaId);
        res.status(200).json(osAtualizada);
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Erro ao excluir pagamento');
        console.error("Erro no DELETE pagamentos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;