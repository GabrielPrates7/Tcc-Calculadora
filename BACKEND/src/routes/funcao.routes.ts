import { Router } from 'express';
import { FuncaoService } from '../services/funcao.service';
import { verificarToken } from '../middlewares/auth.middleware';

export const funcaoRoutes = Router();
const service = new FuncaoService();

// Protege todas as rotas de funções
funcaoRoutes.use(verificarToken);

funcaoRoutes.get('/', async (req, res) => {
    try {
        const empresaId = req.usuario!.empresa_id;
        const funcoes = await service.listar(empresaId);
        res.json(funcoes);
    } catch (erro) {
        res.status(500).json({ error: 'Erro ao buscar funções' });
    }
});

funcaoRoutes.post('/', async (req, res) => {
    try {
        const { nome, baseHorasMensais } = req.body;
        const empresaId = req.usuario!.empresa_id;

        if (!nome) return res.status(400).json({ error: 'Nome da função é obrigatório' });
        
        const novaFuncao = await service.criar(nome, baseHorasMensais, empresaId);
        res.status(201).json(novaFuncao);
    } catch (erro: any) {
        if (erro.message && erro.message.includes('já existe')) {
            return res.status(409).json({ error: erro.message });
        }
        res.status(500).json({ error: 'Erro ao criar função' });
    }
});

funcaoRoutes.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const empresaId = req.usuario!.empresa_id;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        await service.excluir(id, empresaId);
        res.status(204).send();
    } catch (erro: any) {
        if (erro.message && erro.message.includes('Não é possível excluir')) {
            return res.status(422).json({ error: erro.message });
        }
        // Rede de segurança: qualquer vínculo que a pré-checagem não tenha coberto
        // ainda é barrado pela foreign key do banco (violação = código 23503)
        if (erro.code === '23503') {
            return res.status(422).json({ error: 'Não é possível excluir. Esta função está vinculada a outros registros do sistema.' });
        }
        res.status(500).json({ error: 'Erro ao excluir função' });
    }
});