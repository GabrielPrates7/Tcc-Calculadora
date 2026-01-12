import { useState, useEffect } from 'react';
import { CustoObraService } from '../services/custo-obra.service';
import type { TipoTempo, TipoOrganizacao, CustoResultado } from '../types';

export function useCustoObra() {
    const [loading, setLoading] = useState(true);
    const [versaoDados, setVersaoDados] = useState(0);

    // Estados do Formulário
    const [tipoTempo, setTipoTempo] = useState<TipoTempo>('horas');
    const [tipoOrganizacao, setTipoOrganizacao] = useState<TipoOrganizacao>('individual');
    const [tempoInput, setTempoInput] = useState(0);
    const [qtdUnidades, setQtdUnidades] = useState(1);
    const [tamanhoGrupo, setTamanhoGrupo] = useState(2);

    // Estado do Resultado
    const [resultado, setResultado] = useState<CustoResultado>({
        custoEquipeMensal: 0,
        valorUnitario: 0
    });

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                const data = await CustoObraService.buscar();
                const conf = data.config;
                const calculo = data.calculo;

                // 1. Atualiza Resultado
                setResultado({
                    custoEquipeMensal: Number(calculo.custoEquipeMensal) || 0,
                    valorUnitario: Number(calculo.valorUnitario) || 0
                });

                // 2. Atualiza Formulário (Lógica de conversão do backend)
                const modo = conf.tipo_tempo || 'horas';
                setTipoTempo(modo);
                setTipoOrganizacao(conf.tipo_organizacao || 'individual');
                setQtdUnidades(Number(conf.qtd_unidades) || 1);
                setTamanhoGrupo(Number(conf.tamanho_grupo) || 2);

                if (modo === 'dias') {
                    setTempoInput(Number(conf.dias_trabalhados_mes) || 20);
                } else {
                    setTempoInput(Number(conf.horas_trabalhadas_dia) || 160);
                }

            } catch (error) {
                console.error("Erro ao carregar Custo Obra:", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, [versaoDados]);

    const atualizarCalculo = async () => {
        try {
            await CustoObraService.atualizar({
                tempoInput,
                qtdUnidades,
                tipoTempo,
                tipoOrganizacao,
                tamanhoGrupo
            });
            setVersaoDados(v => v + 1); // Força recarregamento
            alert("Cálculo atualizado!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar.");
        }
    };

    return {
        loading,
        // Getters
        form: { tipoTempo, tipoOrganizacao, tempoInput, qtdUnidades, tamanhoGrupo },
        resultado,
        // Setters
        setTipoTempo, setTipoOrganizacao, setTempoInput, setQtdUnidades, setTamanhoGrupo,
        // Actions
        atualizarCalculo
    };
}