import { Router, Request, Response } from 'express';
import { pool as db } from '../services/db';
import { verificarToken } from '../middlewares/auth.middleware'; // Utilizando seu middleware padrão

const configuracoesRoutes = Router();

// Protege todas as requisições e injeta o req.usuario automaticamente
configuracoesRoutes.use(verificarToken);

// Rota 1: Buscar configurações atuais da empresa
configuracoesRoutes.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const empresa_id = req.usuario!.empresa_id;

        let result = await db.query('SELECT * FROM configuracao_producao WHERE empresa_id = $1', [empresa_id]);
        
        // Se a empresa for nova e não tiver registro, cria com os defaults
        if (result.rowCount === 0) {
            await db.query(`
                INSERT INTO configuracao_producao (empresa_id, dias_trabalhados_mes, horas_trabalhadas_dia, margem_lucro_padrao, imposto_padrao)
                VALUES ($1, 22, 176, 30.00, 5.00)
            `, [empresa_id]);
            result = await db.query('SELECT * FROM configuracao_producao WHERE empresa_id = $1', [empresa_id]);
        }

        const config = result.rows[0];
        
        // Devolve o JSON mapeando as colunas do banco para as variáveis do React
        res.json({
            baseDiasProdutivos: config.dias_trabalhados_mes,
            baseHorasProdutivas: config.horas_trabalhadas_dia, 
            margemLucroPadrao: Number(config.margem_lucro_padrao),
            impostoPadrao: Number(config.imposto_padrao)
        });
    } catch (error) {
        console.error('Erro no GET /configuracoes:', error);
        res.status(500).json({ error: 'Erro ao buscar configurações globais.' });
    }
});

// Rota 2: Atualizar configurações
configuracoesRoutes.put('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const empresa_id = req.usuario!.empresa_id;
        const { baseDiasProdutivos, baseHorasProdutivas, margemLucroPadrao, impostoPadrao } = req.body;

        await db.query(`
            UPDATE configuracao_producao 
            SET dias_trabalhados_mes = $1, 
                horas_trabalhadas_dia = $2, 
                margem_lucro_padrao = $3, 
                imposto_padrao = $4
            WHERE empresa_id = $5
        `, [baseDiasProdutivos, baseHorasProdutivas, margemLucroPadrao, impostoPadrao, empresa_id]);

        res.json({ message: 'Parâmetros atualizados com sucesso.' });
    } catch (error) {
        console.error('Erro no PUT /configuracoes:', error);
        res.status(500).json({ error: 'Erro ao salvar as configurações.' });
    }
});

export default configuracoesRoutes;