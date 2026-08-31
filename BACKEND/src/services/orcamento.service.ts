import { pool as db } from './db';
import { FinanceiroService } from './financeiro.service';

export interface IOrcamentoPayload {
    cliente?: string;
    nomeProduto: string;
    custoMercadoria: number;
    tempoGasto: number;
    lucroPct: number;
    impostoPct: number;
    valorHoraSelecionado: number;
    idCenarioMo?: number | null;
}

/**
 * Validação server-side dos dados de um orçamento, usada por POST e PUT
 * antes de calcular/gravar nada. Retorna a mensagem do primeiro problema
 * encontrado, ou null se os dados estiverem válidos.
 */
export function validarOrcamentoPayload(dados: IOrcamentoPayload): string | null {
    if (!dados.nomeProduto || !dados.nomeProduto.trim()) {
        return 'Nome do produto é obrigatório.';
    }
    if (!Number.isFinite(dados.custoMercadoria) || dados.custoMercadoria < 0) {
        return 'Custo de materiais deve ser um número maior ou igual a zero.';
    }
    if (!Number.isFinite(dados.tempoGasto) || dados.tempoGasto < 0) {
        return 'Horas trabalhadas deve ser um número maior ou igual a zero.';
    }
    if (!Number.isFinite(dados.lucroPct) || dados.lucroPct < 0) {
        return 'Lucro desejado deve ser um número maior ou igual a zero.';
    }
    if (!Number.isFinite(dados.impostoPct) || dados.impostoPct < 0) {
        return 'Imposto deve ser um número maior ou igual a zero.';
    }
    // Entra no cálculo de custoMaoObraTotal (tempoGasto * valorHora) e, por
    // consequência, no preço de venda gravado — um negativo aqui corromperia
    // o orçamento. Na UI o campo vem de um dropdown, mas a API é chamável
    // diretamente.
    if (!Number.isFinite(dados.valorHoraSelecionado) || dados.valorHoraSelecionado < 0) {
        return 'Valor hora selecionado deve ser um número maior ou igual a zero.';
    }
    // Quando informado, precisa ser um id utilizável — a checagem de posse
    // (se a obra é da empresa do usuário) fica na rota, que responde 403.
    if (dados.idCenarioMo !== null && dados.idCenarioMo !== undefined
        && (!Number.isInteger(dados.idCenarioMo) || dados.idCenarioMo <= 0)) {
        return 'Cenário de mão de obra inválido.';
    }
    return null;
}

export interface ICenarioMaoObraDTO {
    id: number;
    titulo: string;
    valorUnitario: number;
    unidade: string;
    tipoTempo: string;
    dataCriacao: string;
}

export class OrcamentoService {
    
    // Delega para a fonte única do indicador (FinanceiroService), sem período
    // explícito: ancora no faturamento mais recente lançado pela empresa.
    async obterTaxaFixoAtual(empresa_id: number): Promise<number> {
        return FinanceiroService.calcularTaxaCustoFixo(empresa_id);
    }

    /**
     * Confirma que o cenário de mão de obra informado (uma obra) pertence à
     * empresa do usuário autenticado.
     *
     * A foreign key do banco (fk_orcamento_cenario_mo) só garante que o id
     * existe em `obras` — nada impede referenciar a obra de OUTRA empresa
     * chamando a API diretamente, já que o dropdown que filtra por empresa
     * vive só no frontend. Por isso o vínculo é reconferido aqui.
     */
    async cenarioMaoObraPertenceAEmpresa(idCenario: number, empresa_id: number): Promise<boolean> {
        const result = await db.query(
            'SELECT 1 FROM public.obras WHERE id = $1 AND empresa_id = $2',
            [idCenario, empresa_id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async listarCenariosMaoObra(empresa_id: number): Promise<ICenarioMaoObraDTO[]> {
        const query = `
            SELECT 
                o.id,
                o.titulo || COALESCE(' (' || o.cliente || ')', '') AS titulo,
                CAST(o.custo_total_estimado AS numeric(10,2)) AS "valorUnitario",
                'total da obra' AS "unidade",
                COALESCE(o.tipo_tempo, 'horas') AS "tipoTempo",
                TO_CHAR(o.criado_em, 'YYYY-MM-DD') AS "dataCriacao"
            FROM public.obras o
            WHERE o.custo_total_estimado IS NOT NULL AND o.empresa_id = $1
            ORDER BY o.id DESC;
        `;
        const result = await db.query(query, [empresa_id]);
        return result.rows.map(row => ({
            id: Number(row.id),
            titulo: String(row.titulo),
            valorUnitario: Number(row.valorUnitario),
            unidade: String(row.unidade),
            tipoTempo: String(row.tipoTempo),
            dataCriacao: String(row.dataCriacao)
        }));
    }

    async listarOrcamentos(empresa_id: number) {
        const query = `
            SELECT 
                o.id, o.cliente, o.nome_produto, o.custo_mercadoria AS custo_materiais,
                o.tempo_gasto AS horas_trabalhadas, o.lucro_desejado_pct AS lucro_desejado,
                o.imposto_pct AS imposto, o.custo_fixo_pct_snapshot AS taxa_fixa_snapshot,
                o.custo_mao_obra_unitario, o.custo_mao_obra_total, o.preco_venda, 
                TO_CHAR(o.criado_em, 'YYYY-MM-DD') AS criado_em, o.id_cenario_mo,
                os.id AS os_id
            FROM public.orcamentos o
            LEFT JOIN public.ordens_servico os ON os.orcamento_id = o.id
            WHERE o.empresa_id = $1
            ORDER BY o.id DESC;
        `;
        const result = await db.query(query, [empresa_id]);
        return result.rows;
    }

    private async calcularPrecoVenda(dados: IOrcamentoPayload, empresa_id: number): Promise<{ precoVenda: number, taxaFixa: number, custoMaoObraTotal: number }> {
        const taxaFixa = await this.obterTaxaFixoAtual(empresa_id);
        const custoMaoObraTotal = dados.tempoGasto * dados.valorHoraSelecionado;
        const custoProducao = dados.custoMercadoria + custoMaoObraTotal;

        const somaPorcentagens = taxaFixa + dados.lucroPct + dados.impostoPct;
        const divisor = 1 - (somaPorcentagens / 100);

        if (divisor <= 0) {
            throw new Error("A soma das taxas (Fixo + Lucro + Imposto) excede 100%. Divisor inválido.");
        }

        const precoVenda = custoProducao / divisor;
        return { precoVenda, taxaFixa, custoMaoObraTotal };
    }

    async criarOrcamento(dados: IOrcamentoPayload, empresa_id: number) {
        const calculo = await this.calcularPrecoVenda(dados, empresa_id);
        const query = `
            INSERT INTO public.orcamentos (
                cliente, nome_produto, custo_mercadoria, tempo_gasto, 
                lucro_desejado_pct, imposto_pct, custo_fixo_pct_snapshot, 
                custo_mao_obra_unitario, custo_mao_obra_total, preco_venda, id_cenario_mo, empresa_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;
        const values = [
            dados.cliente || null, dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto,
            dados.lucroPct, dados.impostoPct, calculo.taxaFixa, 
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, 
            dados.idCenarioMo || null, empresa_id
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async atualizarOrcamento(id: number, dados: IOrcamentoPayload, empresa_id: number) {
        const calculo = await this.calcularPrecoVenda(dados, empresa_id);
        const query = `
            UPDATE public.orcamentos
            SET cliente = $1, nome_produto = $2, custo_mercadoria = $3, tempo_gasto = $4,
                lucro_desejado_pct = $5, imposto_pct = $6, custo_fixo_pct_snapshot = $7,
                custo_mao_obra_unitario = $8, custo_mao_obra_total = $9, preco_venda = $10, id_cenario_mo = $11
            WHERE id = $12 AND empresa_id = $13
            RETURNING *;
        `;
        const values = [
            dados.cliente || null, dados.nomeProduto, dados.custoMercadoria, dados.tempoGasto,
            dados.lucroPct, dados.impostoPct, calculo.taxaFixa, 
            dados.valorHoraSelecionado, calculo.custoMaoObraTotal, calculo.precoVenda, 
            dados.idCenarioMo || null,
            id, empresa_id
        ];
        const result = await db.query(query, values);
        if (result.rowCount === 0) throw new Error("Orçamento não encontrado para atualização.");
        return result.rows[0];
    }

    async deletarOrcamento(id: number, empresa_id: number): Promise<boolean> {
        const query = `DELETE FROM public.orcamentos WHERE id = $1 AND empresa_id = $2`;
        await db.query(query, [id, empresa_id]);
        return true;
    }
}