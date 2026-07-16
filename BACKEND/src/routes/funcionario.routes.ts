import { Router } from 'express';
import { FuncionarioService } from '../services/funcionario.service';

export const funcionarioRoutes = Router();
const service = new FuncionarioService();

funcionarioRoutes.get('/', async (req, res) => {
    try {
        const funcionarios = await service.listarTodos();
        res.json(funcionarios);
    } catch (erro) {
        res.status(500).json({ error: 'Erro ao buscar funcionários' });
    }
});

funcionarioRoutes.post('/', async (req, res) => {
    try {
        // CORREÇÃO: Extraindo salarioBase ao invés de salario
        const { nome, funcao_id, setor, salarioBase, epi } = req.body;
        const novoFuncionario = await service.criarFuncionario({ 
            nome, 
            funcao_id, 
            setor, 
            salarioBase, 
            epi 
        });
        res.status(201).json(novoFuncionario);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: 'Erro ao cadastrar funcionário' });
    }
});

// NOVA ROTA: Atualizar funcionário existente
funcionarioRoutes.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, funcao_id, setor, salarioBase, epi, ativo } = req.body;
        
        await service.atualizarFuncionario(id, { 
            nome, 
            funcao_id, 
            setor, 
            salarioBase, 
            epi,
            ativo
        });
        res.json({ message: 'Atualizado com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: 'Erro ao atualizar funcionário' });
    }
});

// NOVA ROTA: Excluir funcionário
funcionarioRoutes.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await service.excluirFuncionario(id);
        res.json({ message: 'Excluído com sucesso' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ error: 'Erro ao excluir funcionário' });
    }
});