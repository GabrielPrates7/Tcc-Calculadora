import { useState, useEffect } from 'react';
import { CustoObraService } from '../services/custo-obra.service';
import type { TipoTempo, TipoOrganizacao, CustoResultado, HistoricoItem } from '../types';

export function useCustoObra() {
    const [loading, setLoading] = useState(true);
    const [versaoDados, setVersaoDados] = useState(0);

    // Estados do Formulário
    const [tipoTempo, setTipoTempo] = useState<TipoTempo>('horas');
    const [tipoOrganizacao, setTipoOrganizacao] = useState<TipoOrganizacao>('individual');
    const [tempoInput, setTempoInput] = useState(0);
    const [qtdUnidades, setQtdUnidades] = useState(1);
    const [tamanhoGrupo, setTamanhoGrupo] = useState(2);

    // Controle visual e lógico da edição
    const [titulo, setTitulo] = useState('');
    const [cenarioEmEdicao, setCenarioEmEdicao] = useState<string | null>(null);
    const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null);

    const [resultado, setResultado] = useState<CustoResultado>({
        custoEquipeMensal: 0,
        valorUnitario: 0
    });

    const [historico, setHistorico] = useState<HistoricoItem[]>([]);

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);
                const [dataAtual, listaHistorico] = await Promise.all([
                    CustoObraService.buscar(),
                    CustoObraService.listarHistorico()
                ]);
                
                const conf = dataAtual.config;
                const calculo = dataAtual.calculo;

                setResultado({
                    custoEquipeMensal: Number(calculo.custoEquipeMensal) || 0,
                    valorUnitario: Number(calculo.valorUnitario) || 0
                });
                setHistorico(listaHistorico);

                // Só carrega a configuração inicial do banco se NÃO estivermos editando um cenário específico
                if (!cenarioEmEdicao) {
                    setTipoTempo(conf.tipo_tempo || 'horas');
                    setTipoOrganizacao(conf.tipo_organizacao || 'individual');
                    setQtdUnidades(Number(conf.qtd_unidades) || 1);
                    setTamanhoGrupo(Number(conf.tamanho_grupo) || 2);
                    
                    if (conf.tipo_tempo === 'dias') {
                        setTempoInput(Number(conf.dias_trabalhados_mes) || 20);
                    } else {
                        setTempoInput(Number(conf.horas_trabalhadas_dia) || 160);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar:", error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [versaoDados]); 

    const atualizarCalculo = async (tituloParaSalvar?: string, salvarHistorico: boolean = true) => {
        try {
            await CustoObraService.atualizar({
                tempoInput: Number(tempoInput),
                qtdUnidades: Number(qtdUnidades),
                tipoTempo,
                tipoOrganizacao,
                tamanhoGrupo: Number(tamanhoGrupo),
                tituloCenario: tituloParaSalvar,
                idHistoricoParaEditar: idEmEdicao,
                salvarHistorico: salvarHistorico
            });
            
            setVersaoDados(v => v + 1); // Aqui mantemos o reload pois o cálculo muda
            
            if (salvarHistorico) {
                if (tituloParaSalvar) {
                    setCenarioEmEdicao(null); 
                    setIdEmEdicao(null);
                    setTitulo(''); 
                }
                alert("Cálculo salvo e atualizado!");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar.");
        }
    };

    // --- CORREÇÃO DA EXCLUSÃO (Sem Reload) ---
    const excluirItem = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este cenário?")) return;
        try {
            await CustoObraService.excluirHistorico(id);
            
            // ATUALIZAÇÃO LOCAL (Removemos o setVersaoDados daqui)
            // Isso evita que a tela pisque ou recarregue o formulário
            setHistorico(prev => prev.filter(item => item.id !== id));
            
            if (id === idEmEdicao) {
                cancelarEdicao();
            }
        } catch (error) {
            console.error(error); // Corrigido erro de variável não usada
            alert("Erro ao excluir");
        }
    };

    // --- CORREÇÃO DA RENOMEAÇÃO (Sem Reload) ---
    const renomearItem = async (id: number, novoTitulo: string) => {
        try {
            await CustoObraService.renomearHistorico(id, novoTitulo);
            
            // ATUALIZAÇÃO LOCAL
            setHistorico(prev => prev.map(item => 
                item.id === id ? { ...item, titulo: novoTitulo } : item
            ));
            
            if (id === idEmEdicao) {
                setCenarioEmEdicao(novoTitulo);
                setTitulo(novoTitulo);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao renomear");
        }
    };

    const restaurarCenario = (item: HistoricoItem) => {
        const conf = item.configuracao_usada;
        
        setTipoTempo(conf.tipo);
        setTipoOrganizacao(conf.organizacao);
        setTempoInput(conf.tempo);
        setQtdUnidades(conf.equipes);
        setTamanhoGrupo(conf.tamanhoGrupo || 2); 

        setCenarioEmEdicao(item.titulo);
        setIdEmEdicao(item.id);
        setTitulo(item.titulo);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelarEdicao = () => {
        setCenarioEmEdicao(null);
        setIdEmEdicao(null);
        setTitulo('');
        setVersaoDados(v => v + 1); // Recarrega o padrão
    };

    return {
        loading,
        form: { tipoTempo, tipoOrganizacao, tempoInput, qtdUnidades, tamanhoGrupo },
        resultado,
        historico,
        cenarioEmEdicao, 
        titulo,     
        setTitulo,  
        
        setTipoTempo, setTipoOrganizacao, setTempoInput, setQtdUnidades, setTamanhoGrupo,
        atualizarCalculo,
        excluirItem,
        renomearItem,
        restaurarCenario,
        cancelarEdicao 
    };
}