import { pool } from './db';

export class FuncaoService {
    async listar() {
        // Agora retorna a base de horas para viabilizar o cálculo do Custo Hora Limpo no orçamento
        const query = `SELECT id, nome, base_horas_mensais FROM funcoes ORDER BY nome ASC`;
        const resultado = await pool.query(query);
        return resultado.rows;
    }

    async criar(nome: string, baseHorasMensais: number = 176.00) {
        const query = `INSERT INTO funcoes (nome, base_horas_mensais) VALUES ($1, $2) RETURNING *`;
        try {
            const resultado = await pool.query(query, [nome, baseHorasMensais]);
            return resultado.rows[0];
        } catch (erro: any) {
            if (erro.code === '23505') {
                throw new Error('Esta função já existe no sistema.');
            }
            throw erro;
        }
    }

    async excluir(id: number) {
        const checkQuery = `SELECT COUNT(*) FROM funcionarios WHERE funcao_id = $1`;
        const checkResult = await pool.query(checkQuery, [id]);
        const qtdVinculos = parseInt(checkResult.rows[0].count, 10);

        if (qtdVinculos > 0) {
            throw new Error(`Não é possível excluir. Existem ${qtdVinculos} colaboradores vinculados a esta função.`);
        }

        const deleteQuery = `DELETE FROM funcoes WHERE id = $1 RETURNING *`;
        const resultado = await pool.query(deleteQuery, [id]);
        return resultado.rows[0];
    }
}