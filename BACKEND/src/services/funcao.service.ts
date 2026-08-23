import { pool } from './db';

export class FuncaoService {
    async listar(empresa_id: number) {
        const query = `
            SELECT id, nome, base_horas_mensais 
            FROM funcoes 
            WHERE empresa_id = $1 
            ORDER BY nome ASC
        `;
        const resultado = await pool.query(query, [empresa_id]);
        return resultado.rows;
    }

    // Alterado: Removemos o valor fixo (176) do parâmetro
    async criar(nome: string, baseHorasMensais: number | undefined, empresa_id: number) {
        let horasMensais = baseHorasMensais;

        // Se a rota não receber as horas, busca o padrão global atualizado da empresa
        if (!horasMensais) {
            const configQuery = `SELECT horas_trabalhadas_dia FROM configuracao_producao WHERE empresa_id = $1`;
            const configResult = await pool.query(configQuery, [empresa_id]);
            
            if (configResult.rowCount && configResult.rowCount > 0) {
                // A coluna no seu DB chama 'horas_trabalhadas_dia' mas armazena a base mensal (ex: 176)
                horasMensais = Number(configResult.rows[0].horas_trabalhadas_dia);
            } else {
                horasMensais = 176.00; // Fallback de segurança caso a tabela de configuração esteja vazia
            }
        }

        const query = `
            INSERT INTO funcoes (nome, base_horas_mensais, empresa_id) 
            VALUES ($1, $2, $3) RETURNING *
        `;
        try {
            const resultado = await pool.query(query, [nome, horasMensais, empresa_id]);
            return resultado.rows[0];
        } catch (erro: any) {
            if (erro.code === '23505') {
                throw new Error('Esta função já existe no sistema desta empresa.');
            }
            throw erro;
        }
    }

    async excluir(id: number, empresa_id: number) {
        // Bloqueia a exclusão se houver funcionários utilizando essa função E garante que seja da mesma empresa
        const checkFuncionariosQuery = `SELECT COUNT(*) FROM funcionarios WHERE funcao_id = $1 AND empresa_id = $2`;
        const checkFuncionariosResult = await pool.query(checkFuncionariosQuery, [id, empresa_id]);
        const qtdFuncionarios = parseInt(checkFuncionariosResult.rows[0].count, 10);

        if (qtdFuncionarios > 0) {
            throw new Error(`Não é possível excluir. Existem ${qtdFuncionarios} colaboradores vinculados a esta função.`);
        }

        // Bloqueia também se a função estiver em uso em algum orçamento/obra
        const checkObrasQuery = `SELECT COUNT(*) FROM obra_recursos_humanos WHERE funcao_id = $1 AND empresa_id = $2`;
        const checkObrasResult = await pool.query(checkObrasQuery, [id, empresa_id]);
        const qtdObras = parseInt(checkObrasResult.rows[0].count, 10);

        if (qtdObras > 0) {
            throw new Error(`Não é possível excluir. Esta função está em uso em ${qtdObras} orçamento(s) de obra.`);
        }

        const deleteQuery = `DELETE FROM funcoes WHERE id = $1 AND empresa_id = $2 RETURNING *`;
        const resultado = await pool.query(deleteQuery, [id, empresa_id]);
        return resultado.rows[0];
    }
}