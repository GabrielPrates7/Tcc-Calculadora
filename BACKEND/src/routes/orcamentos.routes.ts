import { Router, Request, Response } from 'express';
import { OrcamentoService } from '../services/orcamento.service';

const router = Router();
const orcamentoService = new OrcamentoService();

// --- 0. NOVA ROTA: BUSCAR HISTÓRICO PARA O DROPDOWN ---
// (Deve vir antes das outras para não dar conflito)
router.get('/historico-obra', async (req: Request, res: Response) => {
    try {
        const cenarios = await orcamentoService.listarCenariosMaoObra();
        res.json(cenarios);
    } catch (err) {
        console.error("Erro ao buscar cenários de mão de obra:", err);
        res.status(500).json({ error: 'Erro ao buscar cenários' });
    }
});

// --- 1. LISTAR TODOS (GET) ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const orcamentos = await orcamentoService.listarOrcamentos();
        res.json(orcamentos);
    } catch (err) {
        console.error("Erro ao buscar orçamentos:", err);
        res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
});

// --- 2. SALVAR NOVO (POST) ---
router.post('/', async (req: Request, res: Response) => {
    try {
        // Mapeando os dados da requisição para o formato que o Service espera
        const dados = {
            cliente: req.body.cliente,
            nomeProduto: req.body.nome_produto,
            custoMercadoria: Number(req.body.custo_materiais),
            tempoGasto: Number(req.body.horas_trabalhadas),
            lucroPct: Number(req.body.lucro_desejado),
            impostoPct: Number(req.body.imposto),
            valorHoraSelecionado: Number(req.body.valorHoraSelecionado) || 0 // Pega o valor do Dropdown!
        };

        const novoOrcamento = await orcamentoService.criarOrcamento(dados);
        res.json(novoOrcamento);
    } catch (err: any) {
        console.error("Erro ao salvar:", err);
        res.status(400).json({ error: err.message || 'Erro ao salvar' });
    }
});

// --- 3. ATUALIZAR EXISTENTE (PUT) ---
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const dados = {
            cliente: req.body.cliente,
            nomeProduto: req.body.nome_produto,
            custoMercadoria: Number(req.body.custo_materiais),
            tempoGasto: Number(req.body.horas_trabalhadas),
            lucroPct: Number(req.body.lucro_desejado),
            impostoPct: Number(req.body.imposto),
            valorHoraSelecionado: Number(req.body.valorHoraSelecionado) || 0 // Pega o valor do Dropdown!
        };

        const atualizado = await orcamentoService.atualizarOrcamento(Number(req.params.id), dados);
        res.json({ message: 'Orçamento atualizado com sucesso!', data: atualizado });
    } catch (err: any) {
        console.error("Erro ao atualizar:", err);
        res.status(500).json({ error: err.message || 'Erro ao atualizar' });
    }
});

// --- 4. EXCLUIR (DELETE) ---
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await orcamentoService.deletarOrcamento(Number(req.params.id));
        res.json({ message: 'Orçamento excluído' });
    } catch (err) {
        console.error("Erro ao excluir:", err);
        res.status(500).json({ error: 'Erro ao excluir' });
    }
});

export default router;