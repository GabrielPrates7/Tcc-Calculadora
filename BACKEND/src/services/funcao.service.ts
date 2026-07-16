import { pool } from './db';

export class FuncaoService {
    // Retorna todas as funções ordenadas alfabeticamente
    async listar() {
        const query = `SELECT id, nome FROM funcoes ORDER BY nome ASC`;
        const resultado = await pool.query(query);
        return resultado.rows;
    }

    // Cria nova função com tratamento de duplicidade
    async criar(nome: string) {
        const query = `INSERT INTO funcoes (nome) VALUES ($1) RETURNING *`;
        try {
            const resultado = await pool.query(query, [nome]);
            return resultado.rows[0];
        } catch (erro: any) {
            // 23505 é o código PostgreSQL para violação de UNIQUE constraint
            if (erro.code === '23505') {
                throw new Error('Esta função já existe no sistema.');
            }
            throw erro;
        }
    }

    // Exclusão com Hard Block lógico (Impede funções órfãs)
    async excluir(id: number) {
        // 1. Verificação de uso
        const checkQuery = `SELECT COUNT(*) FROM funcionarios WHERE funcao_id = $1`;
        const checkResult = await pool.query(checkQuery, [id]);
        const qtdVinculos = parseInt(checkResult.rows[0].count, 10);

        // 2. Bloqueio restritivo
        if (qtdVinculos > 0) {
            throw new Error(`Não é possível excluir. Existem ${qtdVinculos} colaboradores vinculados a esta função.`);
        }

        // 3. Exclusão segura
        const deleteQuery = `DELETE FROM funcoes WHERE id = $1 RETURNING *`;
        const resultado = await pool.query(deleteQuery, [id]);
        return resultado.rows[0];
    }
}