import { useState, useEffect } from 'react';
import { OrcamentosService } from '../services/orcamentos.service';
import type { Orcamento, CenarioMaoObra, IOrcamentoPayload } from '../types';

interface HttpError {
    response?: {
        data?: {
            error?: string;
            message?: string;
        };
    };
    message?: string;
}

export function useOrcamentos() {
    const [loading, setLoading] = useState(true);
    const [listaOrcamentos, setListaOrcamentos] = useState<Orcamento[]>([]);
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

    const salvarOrcamento = async (orcamento: Orcamento | IOrcamentoPayload): Promise<boolean> => {
        try {
            const payloadSanitizado: IOrcamentoPayload = {
                ...orcamento,
                id_cenario_mo: orcamento.id_cenario_mo ? Number(orcamento.id_cenario_mo) : null,
                valorHoraSelecionado: Number('valorHoraSelecionado' in orcamento ? orcamento.valorHoraSelecionado : 0) || 0
            } as IOrcamentoPayload;

            await OrcamentosService.salvar(payloadSanitizado);
            recarregar();
            return true;
        } catch (error: unknown) {
            const err = error as HttpError;
            const mensagemErro = 
                err.response?.data?.error || 
                err.response?.data?.message || 
                err.message || 
                "Falha na comunicação com o servidor.";

            console.error("Detalhe do erro ao salvar:", err.response?.data || error);
            alert(`Não foi possível salvar o orçamento:\n${mensagemErro}`);
            return false;
        }
    };

    const excluirOrcamento = async (id: number): Promise<{ sucesso: boolean; mensagem?: string }> => {
        try {
            await OrcamentosService.excluir(id);
            recarregar();
            return { sucesso: true };
        } catch (error: unknown) {
            const err = error as HttpError;
            const mensagemErro = 
                err.response?.data?.error || 
                err.response?.data?.message || 
                err.message || 
                "Falha ao excluir o registro.";

            console.error("Detalhe do erro ao excluir:", err.response?.data || error);
            return { sucesso: false, mensagem: mensagemErro };
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