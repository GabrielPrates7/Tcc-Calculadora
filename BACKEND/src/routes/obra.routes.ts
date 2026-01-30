import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

// --- ROTA: LISTAR HISTÓRICO ---
router.get('/historico', async (req: Request, res: Response) => {
    try {
        // ADICIONADO: 'custo_total_folha' no select para o PDF funcionar com dados antigos
        const result = await pool.query(`
            SELECT id, titulo, data_alteracao, valor_unitario_final, configuracao_usada, custo_total_folha 
            FROM historico_custo_obra 
            ORDER BY data_alteracao DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        res.status(500).send('Erro ao buscar histórico');
    }
});

// --- ROTA DE LEITURA (GET - DADOS ATUAIS) ---
router.get('/', async (req: Request, res: Response) => {
    try {
        let configRes = await pool.query('SELECT * FROM configuracao_producao LIMIT 1');
        
        if (configRes.rows.length === 0) {
            configRes = await pool.query(`
                INSERT INTO configuracao_producao 
                (dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo)
                VALUES (22, 176, 1, 'horas', 'individual', 1) 
                RETURNING *
            `);
        }
        const config = configRes.rows[0];

        const funcRes = await pool.query(`
            SELECT SUM(custo_total_mensal) as total 
            FROM funcionarios 
            WHERE ativo = true AND setor = 'producao'
        `);
        
        const custoEquipeProducao = Number(funcRes.rows[0].total) || 0;

        const tipoTempo = config.tipo_tempo; 
        const qtdUnidades = Number(config.qtd_unidades) > 0 ? Number(config.qtd_unidades) : 1;

        let tempoTotal = 0;
        if (tipoTempo === 'dias') {
            tempoTotal = Number(config.dias_trabalhados_mes);
        } else {
            tempoTotal = Number(config.horas_trabalhadas_dia);
        }

        const divisor = tempoTotal * qtdUnidades;
        const valorUnitario = (divisor > 0 && custoEquipeProducao > 0) ? (custoEquipeProducao / divisor) : 0;

        res.json({
            config: config,
            calculo: {
                custoEquipeMensal: custoEquipeProducao,
                valorUnitario: valorUnitario,
                tempoConsiderado: tempoTotal
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao calcular custo obra');
    }
});

// --- ROTA DE ATUALIZAÇÃO (PUT - CÁLCULO E SALVAMENTO) ---
router.put('/', async (req: Request, res: Response) => {
    const { 
        tempoInput, qtdUnidades, 
        tipoTempo, tipoOrganizacao, tamanhoGrupo,
        tituloCenario,
        idHistoricoParaEditar,
        salvarHistorico = true 
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const diasSalvar = tipoTempo === 'dias' ? tempoInput : 0;
        const horasSalvar = tipoTempo === 'horas' ? tempoInput : 0;
        const qtdSalvar = Number(qtdUnidades) > 0 ? Number(qtdUnidades) : 1;

        // 1. Atualiza a Configuração Global
        const check = await client.query('SELECT * FROM configuracao_producao LIMIT 1');
        
        if (check.rows.length === 0) {
            await client.query(
                `INSERT INTO configuracao_producao 
                (dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [diasSalvar, horasSalvar, qtdSalvar, tipoTempo, tipoOrganizacao, tamanhoGrupo]
            );
        } else {
            const id = check.rows[0].id;
            await client.query(
                `UPDATE configuracao_producao SET 
                dias_trabalhados_mes=$1, horas_trabalhadas_dia=$2, qtd_unidades=$3, 
                tipo_tempo=$4, tipo_organizacao=$5, tamanho_grupo=$6 
                WHERE id=$7`,
                [diasSalvar, horasSalvar, qtdSalvar, tipoTempo, tipoOrganizacao, tamanhoGrupo, id]
            );
        }

        // 2. Calcula o valor
        const funcRes = await client.query(`
            SELECT SUM(custo_total_mensal) as total 
            FROM funcionarios 
            WHERE ativo = true AND setor = 'producao'
        `);
        const custoEquipeProducao = Number(funcRes.rows[0].total) || 0;
        
        const tempoTotal = tipoTempo === 'dias' ? diasSalvar : horasSalvar;
        const divisor = tempoTotal * qtdSalvar;
        const valorUnitario = (divisor > 0) ? (custoEquipeProducao / divisor) : 0;

        // 3. Lógica de Histórico
        if (salvarHistorico) {
            const tituloFinal = tituloCenario || `Cálculo Automático - ${new Date().toLocaleDateString('pt-BR')}`;
            const configJson = JSON.stringify({ 
                tipo: tipoTempo, 
                tempo: tempoTotal, 
                equipes: qtdSalvar, 
                organizacao: tipoOrganizacao,
                tamanhoGrupo: tamanhoGrupo 
            });

            if (idHistoricoParaEditar) {
                // UPDATE
                await client.query(
                    `UPDATE historico_custo_obra 
                     SET custo_total_folha=$1, configuracao_usada=$2, valor_unitario_final=$3, titulo=$4, data_alteracao=CURRENT_TIMESTAMP
                     WHERE id=$5`,
                    [custoEquipeProducao, configJson, valorUnitario, tituloFinal, idHistoricoParaEditar]
                );
            } else {
                // INSERT
                await client.query(
                    `INSERT INTO historico_custo_obra 
                    (custo_total_folha, configuracao_usada, valor_unitario_final, titulo) 
                    VALUES ($1, $2, $3, $4)`,
                    [custoEquipeProducao, configJson, valorUnitario, tituloFinal]
                );
            }
        }

        await client.query('COMMIT');
        
        res.json({ 
            message: salvarHistorico ? 'Histórico atualizado!' : 'Cálculo realizado (sem salvar)', 
            valorCalculado: valorUnitario 
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro na transação:", err);
        res.status(500).send('Erro ao processar');
    } finally {
        client.release();
    }
});

// --- ROTA: RENOMEAR ITEM DO HISTÓRICO ---
router.put('/historico/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { novoTitulo } = req.body;
    try {
        await pool.query('UPDATE historico_custo_obra SET titulo = $1 WHERE id = $2', [novoTitulo, id]);
        res.json({ message: 'Título atualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao renomear');
    }
});

// --- ROTA: EXCLUIR ITEM DO HISTÓRICO ---
router.delete('/historico/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM historico_custo_obra WHERE id = $1', [id]);
        res.json({ message: 'Item excluído' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir');
    }
});

export default router;