import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { pool as db } from '../services/db';
import { verificarSuperAdmin } from '../middlewares/auth.middleware';
import { FuncionarioService } from '../services/funcionario.service';

const funcionarioService = new FuncionarioService();

const adminRoutes = Router();

// Todas as rotas administrativas exigem o administrador global do sistema
adminRoutes.use(verificarSuperAdmin);

/**
 * Gera uma senha temporária aleatória (10 caracteres), garantindo pelo menos
 * uma letra e um número — um charset puramente aleatório teria ~17% de chance
 * de sair só com letras. Usa crypto.randomInt (não Math.random) por ser
 * criptograficamente seguro, já que esta senha concede acesso à conta.
 */
function gerarSenhaTemporaria(): string {
    const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const NUMEROS = '0123456789';
    const TODOS = LETRAS + NUMEROS;
    const TAMANHO = 10;

    const caracteres = [
        LETRAS[crypto.randomInt(LETRAS.length)],
        NUMEROS[crypto.randomInt(NUMEROS.length)]
    ];
    while (caracteres.length < TAMANHO) {
        caracteres.push(TODOS[crypto.randomInt(TODOS.length)]);
    }

    // Embaralha (Fisher-Yates) para a letra/número obrigatórios não caírem sempre no início
    for (let i = caracteres.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
    }

    return caracteres.join('');
}

// Rota 1: Listar todos os usuários pendentes (ativo = false)
adminRoutes.get('/pendentes', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT u.id as usuario_id, u.nome as nome_usuario, u.email, u.criado_em, u.ativo,
                   e.id as empresa_id, e.nome_fantasia as nome_empresa, e.cnpj
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.ativo = false
            ORDER BY u.criado_em DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pendentes:', error);
        res.status(500).json({ error: 'Erro ao buscar cadastros pendentes.' });
    }
});

// Rota 2: Ativar um usuário
adminRoutes.patch('/ativar/:id', async (req: Request, res: Response): Promise<void> => {
    const usuarioId = req.params.id;
    try {
        const query = `UPDATE usuarios SET ativo = true WHERE id = $1 RETURNING id, nome`;
        const result = await db.query(query, [usuarioId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.json({ message: 'Usuário ativado com sucesso!', usuario: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao ativar o usuário.' });
    }
});

// Rota 2.5: Recusar (excluir) um cadastro pendente de empresa/usuário.
// Reconsulta e trava a linha dentro da transação — nunca confia que o
// frontend já escondeu o botão para um cadastro que, nesse meio-tempo,
// tenha sido aprovado por outra aba/sessão.
adminRoutes.delete('/cadastros/:id', async (req: Request, res: Response): Promise<void> => {
    const usuarioId = Number(req.params.id);
    if (isNaN(usuarioId)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const busca = await client.query(
            `SELECT u.id, u.ativo, u.email, u.empresa_id, e.nome_fantasia, e.cnpj
             FROM usuarios u
             JOIN empresas e ON u.empresa_id = e.id
             WHERE u.id = $1
             FOR UPDATE OF u`,
            [usuarioId]
        );

        if (busca.rowCount === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Cadastro não encontrado.' });
            return;
        }

        const cadastro = busca.rows[0];

        if (cadastro.ativo === true) {
            await client.query('ROLLBACK');
            res.status(409).json({ error: 'Não é possível recusar: cadastro já aprovado.' });
            return;
        }

        // A exclusão de usuarios acontece automaticamente via ON DELETE CASCADE
        await client.query('DELETE FROM empresas WHERE id = $1', [cadastro.empresa_id]);

        await client.query('COMMIT');

        console.log(
            `[ADMIN] Cadastro recusado — admin_id=${req.usuario!.id} ` +
            `empresa="${cadastro.nome_fantasia}" cnpj=${cadastro.cnpj || 'N/A'} ` +
            `email=${cadastro.email} em=${new Date().toISOString()}`
        );

        res.status(204).send();
    } catch (error: any) {
        await client.query('ROLLBACK');

        // Rede de segurança: qualquer vínculo de negócio inesperado (funcionarios,
        // obras, etc.) ainda é barrado pela foreign key do banco (código 23503)
        if (error.code === '23503') {
            res.status(422).json({ error: 'Não é possível recusar: já existem dados de negócio vinculados a esta empresa.' });
            return;
        }

        console.error('Erro ao recusar cadastro:', error);
        res.status(500).json({ error: 'Erro interno ao recusar o cadastro.' });
    } finally {
        client.release();
    }
});

// Rota 3: Listar TODOS os usuários cadastrados
adminRoutes.get('/usuarios', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT u.id as usuario_id, u.nome as nome_usuario, u.email, u.criado_em, u.ativo,
                   e.id as empresa_id, e.nome_fantasia as nome_empresa, e.cnpj
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            ORDER BY u.criado_em DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar todos os usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar lista global de usuários.' });
    }
});

// Rota 4: Bloquear um usuário (revogar acesso)
adminRoutes.patch('/bloquear/:id', async (req: Request, res: Response): Promise<void> => {
    const usuarioId = req.params.id;

    // Impede o administrador de revogar o proprio acesso e ficar trancado para fora
    if (Number(usuarioId) === req.usuario!.id) {
        res.status(400).json({ error: 'Não é possível bloquear sua própria conta.' });
        return;
    }

    try {
        const query = `UPDATE usuarios SET ativo = false WHERE id = $1 RETURNING id, nome`;
        const result = await db.query(query, [usuarioId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        res.json({ message: 'Usuário bloqueado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao bloquear o usuário.' });
    }
});

// Rota 4.5: Redefinir a senha de um usuário (gera senha temporária)
adminRoutes.post('/redefinir-senha/:id', async (req: Request, res: Response): Promise<void> => {
    const usuarioId = Number(req.params.id);

    // Mesma guarda de /bloquear: evita o super admin se trancar fora da própria conta
    if (usuarioId === req.usuario!.id) {
        res.status(400).json({ error: 'Não é possível redefinir a senha da sua própria conta por aqui.' });
        return;
    }

    try {
        const senhaTemporaria = gerarSenhaTemporaria();
        const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

        const result = await db.query(
            'UPDATE usuarios SET senha_hash = $1 WHERE id = $2 RETURNING id, nome, email',
            [senhaHash, usuarioId]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        const alvo = result.rows[0];

        // Auditoria: fica só no log do servidor — nunca na resposta HTTP nem na tela.
        console.log(
            `[ADMIN] Senha redefinida — admin_id=${req.usuario!.id} alvo_id=${alvo.id} ` +
            `alvo_email=${alvo.email} em=${new Date().toISOString()}`
        );

        res.json({
            senhaTemporaria,
            usuario: { id: alvo.id, nome: alvo.nome, email: alvo.email }
        });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ error: 'Erro interno ao redefinir a senha.' });
    }
});

// ==========================================
// NOVAS ROTAS: FLUXO DE ALTERAÇÃO DE PERFIL
// ==========================================

// Rota 5: Listar solicitações pendentes de alteração
adminRoutes.get('/solicitacoes', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT s.*, e.nome_fantasia as nome_empresa
            FROM solicitacoes_alteracao s
            JOIN empresas e ON s.empresa_id = e.id
            WHERE s.status = 'PENDENTE'
            ORDER BY s.criado_em ASC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar solicitações de alteração.' });
    }
});

// Rota 6: Aprovar uma alteração
adminRoutes.post('/solicitacoes/:id/aprovar', async (req: Request, res: Response): Promise<void> => {
    const solicitacaoId = req.params.id;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Busca os dados da solicitação
        const result = await client.query('SELECT * FROM solicitacoes_alteracao WHERE id = $1 AND status = $2 FOR UPDATE', [solicitacaoId, 'PENDENTE']);
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Solicitação não encontrada ou já processada.' });
            return;
        }

        const { usuario_id, empresa_id, dados_novos } = result.rows[0];

        // 1. Atualiza Empresa
        await client.query(
            'UPDATE empresas SET nome_fantasia = $1, cnpj = $2 WHERE id = $3',
            [dados_novos.nome_empresa, dados_novos.cnpj || null, empresa_id]
        );

        // 2. Atualiza Usuário (Aplica a senha se houver, ignora caso contrário)
        if (dados_novos.senha_hash) {
            await client.query(
                'UPDATE usuarios SET nome = $1, email = $2, senha_hash = $3 WHERE id = $4',
                [dados_novos.nome_usuario, dados_novos.email, dados_novos.senha_hash, usuario_id]
            );
        } else {
            await client.query(
                'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3',
                [dados_novos.nome_usuario, dados_novos.email, usuario_id]
            );
        }

        // 3. Atualiza o status da solicitação
        await client.query(
            "UPDATE solicitacoes_alteracao SET status = 'APROVADA', analisado_em = CURRENT_TIMESTAMP WHERE id = $1", 
            [solicitacaoId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Alterações aplicadas com sucesso!' });
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error(error);
        
        if (error.code === '23505') { // Restrição UNIQUE violada durante o UPDATE
            res.status(409).json({ error: 'Conflito: Estes dados já foram registrados por outra empresa/usuário recentemente.' });
            return;
        }
        res.status(500).json({ error: 'Erro interno ao processar a aprovação.' });
    } finally {
        client.release();
    }
});

// ==========================================
// MANUTENÇÃO: DIAGNÓSTICO DE DADOS
// ==========================================

// Rota 8: Lista, em todas as empresas, funcionários com custo_total_mensal
// preenchido mas algum componente do detalhamento de encargos zerado —
// não corrige nada, apenas diagnostica.
adminRoutes.get('/funcionarios-encargos-zerados', async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
            SELECT f.id, f.nome, f.empresa_id, e.nome_fantasia as nome_empresa
            FROM funcionarios f
            JOIN empresas e ON f.empresa_id = e.id
            WHERE f.custo_total_mensal > 0
              AND (
                  f.decimo_terceiro = 0 OR
                  f.ferias = 0 OR
                  f.um_terco_ferias = 0 OR
                  f.inss = 0 OR
                  f.multa_fgts = 0
              )
            ORDER BY e.nome_fantasia, f.nome
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao diagnosticar encargos zerados:', error);
        res.status(500).json({ error: 'Erro ao buscar funcionários com encargos zerados.' });
    }
});

// Rota 8.5: Corrige em lote os funcionários com encargos zerados. Reaproveita
// FuncionarioService.atualizarFuncionario — o mesmo caminho do PUT normal —
// reenviando o salário/EPI/benefício já cadastrados de cada um só para forçar
// o recálculo do detalhamento (calcularEncargos). Nunca altera esses 3 valores.
adminRoutes.post('/funcionarios-encargos-zerados/corrigir', async (req: Request, res: Response): Promise<void> => {
    try {
        const busca = await db.query(`
            SELECT id, empresa_id, salario_base, valor_epi, valor_beneficio
            FROM funcionarios
            WHERE custo_total_mensal > 0
              AND (
                  decimo_terceiro = 0 OR
                  ferias = 0 OR
                  um_terco_ferias = 0 OR
                  inss = 0 OR
                  multa_fgts = 0
              )
        `);

        let corrigidos = 0;
        for (const row of busca.rows) {
            try {
                await funcionarioService.atualizarFuncionario(row.id, {
                    salarioBase: Number(row.salario_base),
                    valorEpi: Number(row.valor_epi),
                    valorBeneficio: Number(row.valor_beneficio)
                }, row.empresa_id);
                corrigidos++;
            } catch (err) {
                console.error(`Erro ao corrigir funcionario id=${row.id}:`, err);
            }
        }

        res.json({ corrigidos, total: busca.rows.length });
    } catch (error) {
        console.error('Erro ao corrigir encargos zerados em lote:', error);
        res.status(500).json({ error: 'Erro ao corrigir encargos zerados.' });
    }
});

// Rota 7: Rejeitar uma alteração
adminRoutes.post('/solicitacoes/:id/rejeitar', async (req: Request, res: Response): Promise<void> => {
    const solicitacaoId = req.params.id;
    try {
        const query = `UPDATE solicitacoes_alteracao SET status = 'REJEITADA', analisado_em = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'PENDENTE' RETURNING id`;
        const result = await db.query(query, [solicitacaoId]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Solicitação não encontrada ou já processada.' });
            return;
        }
        res.json({ message: 'Solicitação rejeitada e arquivada.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao rejeitar a solicitação.' });
    }
});

export default adminRoutes;