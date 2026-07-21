import { Router } from 'express';
import { FuncionarioService } from '../services/funcionario.service';

export const funcionarioRoutes = Router();
const service = new FuncionarioService();

// NOVA ROTA: Resumo Financeiro (Deve estar antes do /:id para o Express não confundir as rotas)
funcionarioRoutes.get('/resumo', async (req, res) => {
    try {
        const resumo = await service.obterResumoFinanceiro();
        res.json(resumo);
    } catch (erro) {
        console.error("Erro ao buscar resumo financeiro:", erro);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ROTA REFATORADA: Listagem com Paginação e Filtros via SGBD
funcionarioRoutes.get('/', async (req, res) => {
    try {
        // Extração dos parâmetros da Query String enviados pelo React
        const filtros = {
            pagina: parseInt(req.query.page as string) || 1,
            limite: parseInt(req.query.limit as string) || 8,
            busca: req.query.busca as string,
            setor: req.query.setor as string,
            status: req.query.status as string,
            funcao: req.query.funcao as string,
            ordenarPor: req.query.ordenarPor as string,
            direcaoOrdem: req.query.direcaoOrdem as 'asc' | 'desc'
        };

        const resultado = await service.listarPaginado(filtros);
        res.json(resultado);
    } catch (erro) {
        console.error("Erro ao listar funcionários:", erro);
        res.status(500).json({ error: 'Erro ao processar a listagem' });
    }
});

funcionarioRoutes.post('/', async (req, res) => {
    try {
        const { nome, funcao_id, setor, salarioBase, epi } = req.body;
        
        if (!nome || !funcao_id || salarioBase === undefined) {
            return res.status(400).json({ error: 'Nome, função e salário base são obrigatórios.' });
        }

        const novoFuncionario = await service.criarFuncionario({ 
            nome, 
            funcao_id, 
            setor, 
            salarioBase, 
            epi: epi || 0 
        });
        
        res.status(201).json(novoFuncionario);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
    }
});

funcionarioRoutes.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        // O body inteiro é repassado. O service atualizado agora lida 
        // dinamicamente com os campos (como inativação, setor, salário, etc).
        await service.atualizarFuncionario(id, req.body);
        res.json({ message: 'Atualizado com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: 'Erro ao atualizar funcionário' });
    }
});

funcionarioRoutes.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        await service.excluirFuncionario(id);
        res.json({ message: 'Excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: 'Erro ao excluir funcionário' });
    }
});