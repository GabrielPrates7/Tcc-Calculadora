import { useState, useEffect } from 'react';
import { OrcamentosService } from '../services/orcamentos.service';
import type { Orcamento, CenarioMaoObra } from '../types';

export function useOrcamentos() {
    const [loading, setLoading] = useState(true);
    const [listaOrcamentos, setListaOrcamentos] = useState<Orcamento[]>([]);
    
    // Lista de cenários para o dropdown
    const [listaCenarios, setListaCenarios] = useState<CenarioMaoObra[]>([]);
    const [taxaFixa, setTaxaFixa] = useState(0);

    const [versaoDados, setVersaoDados] = useState(0);

    useEffect(() => {
        async function carregar() {
            setLoading(true);
            try {
                const dados = await OrcamentosService.buscarDadosIniciais();
                
                setListaCenarios(dados.listaCenarios);
                setTaxaFixa(dados.taxaFixa);
                setListaOrcamentos(dados.listaOrcamentos);
            } catch (error) {
                console.error("Erro ao carregar orçamentos:", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [versaoDados]);

    const recarregar = () => setVersaoDados(v => v + 1);

    const salvarOrcamento = async (orcamento: Orcamento) => {
        try {
            await OrcamentosService.salvar(orcamento);
            recarregar();
            return true;
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar orçamento.");
            return false;
        }
    };

    const excluirOrcamento = async (id: number) => {
        // Usamos window.confirm para evitar ambiguidade e o erro do ESLint
        if (!window.confirm("Tem certeza que deseja apagar este orçamento?")) return;
        
        try {
            await OrcamentosService.excluir(id);
            recarregar();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir.");
        }
    };

    return {
        loading,
        listaOrcamentos,
        listaCenarios,
        taxaFixa,
        salvarOrcamento,
        excluirOrcamento
    };
}