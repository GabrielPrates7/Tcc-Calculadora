import type { Orcamento, CenarioMaoObra } from '../types';

const API_URL = 'http://localhost:3000';

/**
 * Interface para padronizar o retorno do carregamento inicial
 */
export interface DadosIniciaisOrcamento {
  listaCenarios: CenarioMaoObra[];
  taxaFixa: number;
  listaOrcamentos: Orcamento[];
}

export const OrcamentosService = {
  /**
   * Busca de forma paralela os dados de mão de obra, financeiro e orçamentos.
   * O uso do Promise.all é ideal aqui para não bloquear a renderização.
   */
  async buscarDadosIniciais(): Promise<DadosIniciaisOrcamento> {
    try {
      // MUDANÇA 1: Apontamos para a nova rota que devolve a lista completa de cenários
      const [resHistorico, resFin, resOrc] = await Promise.all([
        fetch(`${API_URL}/orcamentos/historico-obra`), 
        fetch(`${API_URL}/financeiro/dashboard`),
        fetch(`${API_URL}/orcamentos`)
      ]);

      // Verifica se alguma requisição falhou antes de tentar converter para JSON
      if (!resHistorico.ok || !resFin.ok || !resOrc.ok) {
        throw new Error('Erro ao buscar dados nos endpoints do servidor.');
      }

      // MUDANÇA 2: Pegamos a lista (array) vinda do backend
      const cenarios = await resHistorico.json(); 
      const dataFin = await resFin.json();
      const listaOrcamentos = await resOrc.json();

      return {
        // MUDANÇA 3: Passamos a lista inteira para o componente, removendo o "cenarioAtual" fixo
        listaCenarios: Array.isArray(cenarios) ? cenarios : [],
        taxaFixa: Number(dataFin?.taxaCustoFixo || 0),
        listaOrcamentos: Array.isArray(listaOrcamentos) ? listaOrcamentos : []
      };
    } catch (error) {
      console.error("Falha na comunicação com a API:", error);
      // Retorna valores padrão (fallback) para evitar crash na tela
      return { 
        listaCenarios: [], 
        taxaFixa: 0, 
        listaOrcamentos: [] 
      };
    }
  },

  /**
   * Lógica unificada para Criar (POST) ou Atualizar (PUT)
   */
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

  /**
   * Exclui um registro e retorna se a operação foi bem-sucedida
   */
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