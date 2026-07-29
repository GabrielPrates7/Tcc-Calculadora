import type { Orcamento, CenarioMaoObra } from '../types';

const API_URL = 'http://localhost:3000/api';

export interface DadosIniciaisOrcamento {
  listaCenarios: CenarioMaoObra[];
  taxaFixa: number;
  listaOrcamentos: Orcamento[];
}

export const OrcamentosService = {
  
  async buscarDadosIniciais(): Promise<DadosIniciaisOrcamento> {
    try {
      const [resHistorico, resFin, resOrc] = await Promise.all([
        fetch(`${API_URL}/orcamentos/historico-obra`), 
        fetch(`${API_URL}/orcamentos/taxa-fixa`),
        fetch(`${API_URL}/orcamentos`)
      ]);

      if (!resHistorico.ok || !resFin.ok || !resOrc.ok) {
        throw new Error('Erro ao buscar dados nos endpoints do servidor.');
      }

      const cenarios = await resHistorico.json(); 
      const dataFin = await resFin.json();
      const listaOrcamentos = await resOrc.json();

      return {
        listaCenarios: Array.isArray(cenarios) ? cenarios : [],
        taxaFixa: Number(dataFin?.taxaCustoFixo || 0),
        listaOrcamentos: Array.isArray(listaOrcamentos) ? listaOrcamentos : []
      };
    } catch (error) {
      console.error("Falha na comunicação com a API:", error);
      return { 
        listaCenarios: [], 
        taxaFixa: 0, 
        listaOrcamentos: [] 
      };
    }
  },

  async salvar(orcamento: Orcamento): Promise<boolean> {
    try {
      const isUpdate = !!orcamento.id;
      const url = isUpdate ? `${API_URL}/orcamentos/${orcamento.id}` : `${API_URL}/orcamentos`;
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orcamento)
      });

      return response.ok;
    } catch (error) {
      console.error("Erro ao persistir orçamento:", error);
      return false;
    }
  },

  async excluir(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/orcamentos/${id}`, { 
        method: 'DELETE' 
      });
      return response.ok;
    } catch (error) {
      console.error(`Erro ao remover orçamento ${id}:`, error);
      return false;
    }
  }
};