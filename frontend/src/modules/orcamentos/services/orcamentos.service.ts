import type { Orcamento } from '../types';

const API_URL = 'http://localhost:3000';

export const OrcamentosService = {
    // Busca dados combinados (Config do sistema + Lista de orçamentos)
    async buscarDadosIniciais() {
        const [resObra, resFin, resOrc] = await Promise.all([
            fetch(`${API_URL}/calculo-obra`),
            fetch(`${API_URL}/financeiro/dashboard`),
            fetch(`${API_URL}/orcamentos`)
        ]);

        const dataObra = await resObra.json();
        const dataFin = await resFin.json();
        const lista = await resOrc.json();

        return {
            valorHora: Number(dataObra.calculo?.valorUnitario || 0),
            taxaFixa: Number(dataFin.taxaCustoFixo || 0),
            listaOrcamentos: lista as Orcamento[]
        };
    },

    async salvar(orcamento: Orcamento): Promise<void> {
        const url = orcamento.id ? `${API_URL}/orcamentos/${orcamento.id}` : `${API_URL}/orcamentos`;
        const method = orcamento.id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orcamento)
        });
    },

    async excluir(id: number): Promise<void> {
        await fetch(`${API_URL}/orcamentos/${id}`, { method: 'DELETE' });
    }
};