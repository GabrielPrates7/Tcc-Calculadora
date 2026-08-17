import { Router, Request, Response } from 'express';
import { OrcamentoService, IOrcamentoPayload } from '../services/orcamento.service';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();
const orcamentoService = new OrcamentoService();

// Protege todas as rotas de orçamentos
router.use(verificarToken);

// --- 0. BUSCAR HISTÓRICO PARA O DROPDOWN ---
router.get('/historico-obra', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const cenarios = await orcamentoService.listarCenariosMaoObra(empresaId);
        res.json(cenarios);
    } catch (err: unknown) {
        console.error("Erro ao buscar cenários de mão de obra:", err);
        res.status(500).json({ error: 'Erro ao buscar cenários' });
    }
});

// --- 0.5 NOVA ROTA: BUSCAR TAXA DE CUSTO FIXO ---
router.get('/taxa-fixa', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const taxa = await orcamentoService.obterTaxaFixoAtual(empresaId);
        res.json({ taxaCustoFixo: taxa });
    } catch (err: unknown) {
        console.error("Erro ao buscar taxa fixa:", err);
        res.status(500).json({ error: 'Erro interno ao buscar taxa' });
    }
});

// --- 1. LISTAR TODOS ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const orcamentos = await orcamentoService.listarOrcamentos(empresaId);
        res.json(orcamentos);
    } catch (err: unknown) {
        console.error("Erro ao buscar orçamentos:", err);
        res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
});

// --- 2. SALVAR NOVO ---
router.post('/', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const dados: IOrcamentoPayload = {
            cliente: req.body.cliente,
            nomeProduto: req.body.nome_produto,
            custoMercadoria: Number(req.body.custo_materiais),
            tempoGasto: Number(req.body.horas_trabalhadas),
            lucroPct: Number(req.body.lucro_desejado),
            impostoPct: Number(req.body.imposto),
            valorHoraSelecionado: Number(req.body.valorHoraSelecionado) || 0,
            idCenarioMo: req.body.id_cenario_mo ? Number(req.body.id_cenario_mo) : null
        };

        const novoOrcamento = await orcamentoService.criarOrcamento(dados, empresaId);
        res.status(201).json(novoOrcamento);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao salvar';
        console.error("Erro ao salvar:", errorMessage);
        res.status(400).json({ error: errorMessage });
    }
});

// --- 3. ATUALIZAR EXISTENTE ---
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const dados: IOrcamentoPayload = {
            cliente: req.body.cliente,
            nomeProduto: req.body.nome_produto,
            custoMercadoria: Number(req.body.custo_materiais),
            tempoGasto: Number(req.body.horas_trabalhadas),
            lucroPct: Number(req.body.lucro_desejado),
            impostoPct: Number(req.body.imposto),
            valorHoraSelecionado: Number(req.body.valorHoraSelecionado) || 0,
            idCenarioMo: req.body.id_cenario_mo ? Number(req.body.id_cenario_mo) : null
        };

        const atualizado = await orcamentoService.atualizarOrcamento(Number(req.params.id), dados, empresaId);
        res.json({ message: 'Orçamento atualizado com sucesso!', data: atualizado });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar';
        console.error("Erro ao atualizar:", errorMessage);
        res.status(400).json({ error: errorMessage });
    }
});

// --- 4. EXCLUIR ---
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        await orcamentoService.deletarOrcamento(Number(req.params.id), empresaId);
        res.json({ message: 'Orçamento excluído' });
    } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        console.error("Erro ao excluir:", error);

        if (error.code === '23503' || (error.message && error.message.includes('fk_os_orcamento'))) {
            return res.status(409).json({ 
                error: 'Exclusão bloqueada: Este orçamento possui uma Ordem de Serviço vinculada a ele.' 
            });
        }

        res.status(500).json({ error: 'Erro ao excluir orçamento.' });
    }
});

export default router;