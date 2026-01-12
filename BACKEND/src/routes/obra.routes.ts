import { Router, Request, Response } from 'express';
import { pool } from '../services/db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        // 1. Configuração (Dias/Horas)
        let configRes = await pool.query('SELECT * FROM configuracao_producao LIMIT 1');
        if (configRes.rows.length === 0) {
            // Cria padrão se não existir
            configRes = await pool.query(`
                INSERT INTO configuracao_producao 
                (dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo)
                VALUES (22, 176, 1, 'horas', 'individual', 1) 
                RETURNING *
            `);
        }
        const config = configRes.rows[0];

        // 2. BUSCA CUSTO EQUIPE FILTRADO (A Mágica acontece aqui)
        // Somamos APENAS quem está ATIVO e é da PRODUÇÃO
        const funcRes = await pool.query(`
            SELECT SUM(custo_total_mensal) as total 
            FROM funcionarios 
            WHERE ativo = true AND setor = 'producao'
        `);
        
        const custoEquipeProducao = Number(funcRes.rows[0].total) || 0;

        // LÓGICA DO CÁLCULO
        const tipoTempo = config.tipo_tempo; 
        const qtdUnidades = Number(config.qtd_unidades) > 0 ? Number(config.qtd_unidades) : 1;

        let tempoTotal = 0;
        // Se escolheu 'dias', pega o valor salvo na coluna dias, senão horas.
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
                custoEquipeMensal: custoEquipeProducao, // Manda só o custo da produção
                valorUnitario: valorUnitario,
                tempoConsiderado: tempoTotal
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao calcular custo obra');
    }
});

// ROTA DE ATUALIZAÇÃO (Mantida igual, só para garantir integridade)
router.put('/', async (req: Request, res: Response) => {
    const { 
        tempoInput, qtdUnidades, 
        tipoTempo, tipoOrganizacao, tamanhoGrupo 
    } = req.body;

    try {
        const diasSalvar = tipoTempo === 'dias' ? tempoInput : 0;
        const horasSalvar = tipoTempo === 'horas' ? tempoInput : 0;
        const qtdSalvar = Number(qtdUnidades) > 0 ? Number(qtdUnidades) : 1;

        const check = await pool.query('SELECT * FROM configuracao_producao LIMIT 1');
        
        if (check.rows.length === 0) {
            await pool.query(
                `INSERT INTO configuracao_producao 
                (dias_trabalhados_mes, horas_trabalhadas_dia, qtd_unidades, tipo_tempo, tipo_organizacao, tamanho_grupo) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [diasSalvar, horasSalvar, qtdSalvar, tipoTempo, tipoOrganizacao, tamanhoGrupo]
            );
        } else {
            const id = check.rows[0].id;
            await pool.query(
                `UPDATE configuracao_producao SET 
                dias_trabalhados_mes=$1, horas_trabalhadas_dia=$2, qtd_unidades=$3, 
                tipo_tempo=$4, tipo_organizacao=$5, tamanho_grupo=$6 
                WHERE id=$7`,
                [diasSalvar, horasSalvar, qtdSalvar, tipoTempo, tipoOrganizacao, tamanhoGrupo, id]
            );
        }
        res.json({ message: 'Configuração atualizada' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar configuração');
    }
});

export default router;