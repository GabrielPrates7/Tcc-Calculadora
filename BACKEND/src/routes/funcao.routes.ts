import { Router } from 'express';
import { FuncaoService } from '../services/funcao.service';

export const funcaoRoutes = Router();
const service = new FuncaoService();

funcaoRoutes.get('/', async (req, res) => {
    try {
        const funcoes = await service.listar();
        res.json(funcoes);
    } catch (erro) {
        res.status(500).json({ error: 'Erro ao buscar funções' });
    }
});

funcaoRoutes.post('/', async (req, res) => {
    try {
        const { nome } = req.body;
        if (!nome) return res.status(400).json({ error: 'Nome da função é obrigatório' });
        
        const novaFuncao = await service.criar(nome);
        res.status(201).json(novaFuncao);
    } catch (erro: any) {
        if (erro.message.includes('já existe')) {
            return res.status(409).json({ error: erro.message });
        }
        res.status(500).json({ error: 'Erro ao criar função' });
    }
});

funcaoRoutes.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await service.excluir(id);
        res.status(204).send();
    } catch (erro: any) {
        // Retorna 422 (Unprocessable Entity) se houver bloqueio por vínculo com funcionários
        if (erro.message.includes('Não é possível excluir')) {
            return res.status(422).json({ error: erro.message });
        }
        res.status(500).json({ error: 'Erro ao excluir função' });
    }
});