import { pool } from './db';

export class OrdemServicoService {
    
    // 1. LISTAR TODAS AS O.S. (Para montar o Kanban)
    async listarTodas() {
        const query = `
            SELECT 
                os.id as os_id,
                os.status_producao,
                os.status_financeiro,
                os.data_entrega,
                os.criado_em,
                orc.id as orcamento_id,
                orc.cliente,
                orc.nome_produto,
                orc.preco_venda
            FROM ordens_servico os
            INNER JOIN orcamentos orc ON os.orcamento_id = orc.id
            ORDER BY os.data_entrega ASC NULLS LAST, os.criado_em DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // 2. CRIAR NOVA ORDEM (Quando o cliente aprovar o Orçamento)
    async criarDeOrcamento(orcamentoId: number, dataEntrega?: string) {
        // Verifica se já existe uma OS para este orçamento para não duplicar
        const check = await pool.query('SELECT id FROM ordens_servico WHERE orcamento_id = $1', [orcamentoId]);
        if (check.rows.length > 0) {
            throw new Error('Já existe uma Ordem de Serviço para este Orçamento.');
        }

        const query = `
            INSERT INTO ordens_servico (orcamento_id, data_entrega, status_producao, status_financeiro)
            VALUES ($1, $2, 'fila', 'pendente')
            RETURNING *
        `;
        const result = await pool.query(query, [orcamentoId, dataEntrega || null]);
        return result.rows[0];
    }

    // 3. ATUALIZAR STATUS (Quando você arrastar o cartão no Kanban ou registrar pagamento)
    async atualizarStatus(id: number, statusProducao?: string, statusFinanceiro?: string) {
        const query = `
            UPDATE ordens_servico 
            SET 
                status_producao = COALESCE($1, status_producao),
                status_financeiro = COALESCE($2, status_financeiro),
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [statusProducao, statusFinanceiro, id]);
        return result.rows[0];
    }
}