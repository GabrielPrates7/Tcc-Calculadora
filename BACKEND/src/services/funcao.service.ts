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

    async criar(nome: string, baseHorasMensais: number = 176.00, empresa_id: number) {
        const query = `
            INSERT INTO funcoes (nome, base_horas_mensais, empresa_id) 
            VALUES ($1, $2, $3) RETURNING *
        `;
        try {
            const resultado = await pool.query(query, [nome, baseHorasMensais, empresa_id]);
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
        const checkQuery = `SELECT COUNT(*) FROM funcionarios WHERE funcao_id = $1 AND empresa_id = $2`;
        const checkResult = await pool.query(checkQuery, [id, empresa_id]);
        const qtdVinculos = parseInt(checkResult.rows[0].count, 10);

        if (qtdVinculos > 0) {
            throw new Error(`Não é possível excluir. Existem ${qtdVinculos} colaboradores vinculados a esta função.`);
        }

        const deleteQuery = `DELETE FROM funcoes WHERE id = $1 AND empresa_id = $2 RETURNING *`;
        const resultado = await pool.query(deleteQuery, [id, empresa_id]);
        return resultado.rows[0];
    }
}