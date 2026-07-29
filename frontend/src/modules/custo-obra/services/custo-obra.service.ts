// ============================================================================
// CONTRATOS (Interfaces)
// ============================================================================

export interface TaxaFuncao {
    funcao_id: number;
    funcao_nome: string;
    total_funcionarios_ativos: number;
    custo_mensal_setor: number;
    custo_hora_calculado: number;
    custo_dia_calculado: number; // <-- NOVA MÉTRICA RECEBIDA DA API
}

export interface RecursoObraInput {
    funcao_id: number;
    qtd_profissionais: number;
    horas_estimadas: number;
    custo_hora_aplicado: number;
}

export interface NovaObraBody {
    titulo: string;
    cliente: string;
    data_entrega?: string | null;
    recursos: RecursoObraInput[];
}

export interface ObraHistorico {
    id: number;
    titulo: string;
    cliente: string;
    data_inicio: string;
    data_entrega: string;
    status: string;
    custo_total_estimado: string; 
    criado_em: string;
    recursos: {
        funcao_id: number;
        funcao_nome: string;
        qtd_profissionais: number;
        horas_estimadas: number;
        custo_hora_aplicado: number;
    }[];
}

const API_URL = 'http://localhost:3000/api/obras'; 

// ============================================================================
// SERVIÇO (Data Fetching)
// ============================================================================
export const CustoObraService = {
    
    async obterTaxas(): Promise<TaxaFuncao[]> {
        const res = await fetch(`${API_URL}/taxas`);
        if (!res.ok) throw new Error('Falha ao buscar as taxas de produção por função.');
        return res.json();
    },

    async salvarOrcamento(dados: NovaObraBody): Promise<{ message: string; obra_id: number; custo_total: number }> {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!res.ok) throw new Error('Falha ao salvar o orçamento da obra.');
        return res.json();
    },

    async atualizarOrcamento(id: number, dados: NovaObraBody): Promise<{ message: string; custo_total: number }> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        if (!res.ok) throw new Error('Falha ao atualizar o orçamento da obra.');
        return res.json();
    },

    async listarHistorico(): Promise<ObraHistorico[]> {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Falha ao carregar o histórico de obras.');
        return res.json();
    },

    async excluirObra(id: number): Promise<void> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('Falha ao excluir a obra no servidor.');
    }
};