import { useState, useEffect } from 'react';
import { OrcamentosService } from '../services/orcamentos.service';
import type { Orcamento } from '../types';

export function useOrcamentos() {
    const [loading, setLoading] = useState(true);
    const [listaOrcamentos, setListaOrcamentos] = useState<Orcamento[]>([]);
    
    // Dados do Sistema (Vêm de outros módulos)
    const [valorHora, setValorHora] = useState(0);
    const [taxaFixa, setTaxaFixa] = useState(0);

    const [versaoDados, setVersaoDados] = useState(0);

    useEffect(() => {
        async function carregar() {
            setLoading(true);
            try {
                const dados = await OrcamentosService.buscarDadosIniciais();
                setValorHora(dados.valorHora);
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
        if (!confirm("Tem certeza que deseja apagar?")) return;
        try {
            await OrcamentosService.excluir(id);
            recarregar();
        } catch (error) {
            console.error(error);
        }
    };

    return {
        loading,
        listaOrcamentos,
        valorHora,
        taxaFixa,
        salvarOrcamento,
        excluirOrcamento
    };
}