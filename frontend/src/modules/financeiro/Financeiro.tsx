// ARQUIVO: src/modules/financeiro/Financeiro.tsx

import { useState, useMemo, useEffect } from 'react';
import { useFinanceiro } from './hooks/useFinanceiro';
import { ResumoFinanceiro } from './components/ResumoFinanceiro';
import { ListaFinanceiro } from './components/ListaFinanceiro';
import { ModalFinanceiro } from './components/ModalFinanceiro';
import { FiltroFinanceiro } from './components/FiltroFinanceiro'; 
import type { ViewMode, TipoModal, ItemFinanceiro, StatusFilter } from './types'; 
// Importando o Helper Novo que criamos
import { analisarIntervalo } from './utils/dateHelper';
import './Financeiro.css'; 

export function Financeiro() {
    const { 
        loading, 
        dashboard: dashboardOriginal, 
        despesas, 
        investimentos, 
        salvarItem, 
        excluirItem, 
        atualizarFaturamento,    // Atualiza o global (fallback)
        buscarFaturamentoMensal, // NOVO: Busca do mês específico
        salvarFaturamentoMensal  // NOVO: Salva no mês específico
    } = useFinanceiro();

    // --- DATAS PADRÃO (MÊS ATUAL) ---
    const getInicioMes = () => {
        const hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    };
    const getFimMes = () => {
        const hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
    };

    const [view, setView] = useState<ViewMode>('despesas');
    
    // Inicializa filtrando o mês atual
    const [filtroDataInicio, setFiltroDataInicio] = useState(getInicioMes());
    const [filtroDataFim, setFiltroDataFim] = useState(getFimMes());
    const [filtroStatus, setFiltroStatus] = useState<StatusFilter>('todos');

    // ESTADO LOCAL PARA O FATURAMENTO DO MÊS SELECIONADO
    // Se for null, significa que não tem faturamento específico cadastrado (ou estamos vendo múltiplos meses)
    const [faturamentoMesAtual, setFaturamentoMesAtual] = useState<number | null>(null);

    const [modalConfig, setModalConfig] = useState<{
        aberto: boolean;
        tipo: TipoModal;
        modo: 'criar' | 'editar';
        itemEdicao: ItemFinanceiro | null;
    }>({ aberto: false, tipo: 'despesa', modo: 'criar', itemEdicao: null });

    // 1. ANALISAR AS DATAS (Gera a Label "JANEIRO" e define se é mês único)
    const infoDatas = useMemo(() => {
        return analisarIntervalo(filtroDataInicio, filtroDataFim);
    }, [filtroDataInicio, filtroDataFim]);

    // 2. BUSCAR FATURAMENTO QUANDO MUDAR O MÊS (Efeito Colateral)
    useEffect(() => {
        const carregarFaturamento = async () => {
            if (infoDatas.isMesUnico && infoDatas.ano) {
                // Se selecionou apenas 1 mês (ex: Janeiro), busca no banco
                // infoDatas.meses[0] retorna 0 para Jan, mas o banco espera 1. Então somamos 1.
                const valor = await buscarFaturamentoMensal(infoDatas.meses[0] + 1, infoDatas.ano);
                
                // Atualiza o estado com o valor do banco (ou null se não tiver)
                setFaturamentoMesAtual(valor); 
            } else {
                setFaturamentoMesAtual(null); // Se for periodo composto, reseta para usar o global
            }
        };
        carregarFaturamento();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [infoDatas.meses, infoDatas.ano, infoDatas.isMesUnico]); 
    // OBS: Não coloque 'buscarFaturamentoMensal' aqui para evitar loop infinito


    // 3. CÁLCULO DINÂMICO DO DASHBOARD (O Cérebro)
    const dashboardCalculado = useMemo(() => {
        const somarFiltrados = (lista: ItemFinanceiro[]) => {
            return lista.filter(item => {
                // Se não está ativo, não conta no custo fixo
                if (!item.ativo) return false;
                
                const dataItem = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
                
                // Se não tem filtro de data, soma tudo
                if (!filtroDataInicio && !filtroDataFim) return true;
                
                // Se tem filtro, item sem data não entra
                if (!dataItem) return false;

                let match = true;
                if (filtroDataInicio) match = match && dataItem >= filtroDataInicio;
                if (filtroDataFim) match = match && dataItem <= filtroDataFim;
                return match;
            }).reduce((acc, curr) => acc + Number(curr.valor), 0);
        };

        const totalDespesasFiltradas = somarFiltrados(despesas);
        const totalInvestimentosFiltrados = somarFiltrados(investimentos);
        
        // DECISÃO DO FATURAMENTO A USAR:
        // 1. Se temos um faturamento específico do mês carregado do banco, usa ele.
        // 2. Se não (é null), usa o Faturamento Global (Configuração Geral) como fallback.
        const faturamentoParaCalculo = faturamentoMesAtual !== null 
            ? faturamentoMesAtual 
            : dashboardOriginal.faturamento;

        const taxaCustoFixo = faturamentoParaCalculo > 0 
            ? ((totalDespesasFiltradas + totalInvestimentosFiltrados) / faturamentoParaCalculo) * 100 
            : 0;

        return {
            ...dashboardOriginal,
            faturamento: faturamentoParaCalculo, // O visual vai mostrar qual valor está sendo usado
            totalDespesas: totalDespesasFiltradas,
            totalInvestimentos: totalInvestimentosFiltrados,
            taxaCustoFixo: taxaCustoFixo,
        };
    }, [despesas, investimentos, filtroDataInicio, filtroDataFim, dashboardOriginal, faturamentoMesAtual]);


    // --- HANDLERS ---
    const handleNovo = () => setModalConfig({ aberto: true, tipo: view === 'despesas' ? 'despesa' : 'investimento', modo: 'criar', itemEdicao: null });
    
    const handleEditar = (item: ItemFinanceiro) => setModalConfig({ aberto: true, tipo: view === 'despesas' ? 'despesa' : 'investimento', modo: 'editar', itemEdicao: item });

    const handleClonar = (item: ItemFinanceiro) => {
        setModalConfig({
            aberto: true,
            tipo: view === 'despesas' ? 'despesa' : 'investimento',
            modo: 'criar',
            itemEdicao: { ...item, pago: false, dataVencimento: '' }
        });
    };

    const handleEditFaturamento = () => {
        // Só permite abrir o modal se estiver visualizando um único mês
        if (infoDatas.isMesUnico) {
            setModalConfig({ aberto: true, tipo: 'faturamento', modo: 'editar', itemEdicao: null });
        }
    };

    const handleSalvarModal = async (dados: Partial<ItemFinanceiro>) => {
        const { tipo, itemEdicao, modo } = modalConfig;
        
        if (tipo === 'faturamento') {
            const novoValor = Number(dados.valor);
            
            if (infoDatas.isMesUnico && infoDatas.ano) {
                // SALVA O MENSAL ESPECÍFICO
                // infoDatas.meses[0] é 0 (Janeiro), banco quer 1. Somamos +1.
                const sucesso = await salvarFaturamentoMensal(infoDatas.meses[0] + 1, infoDatas.ano, novoValor);
                if (sucesso) {
                    setFaturamentoMesAtual(novoValor); // Atualiza a tela instantaneamente
                }
            } else {
                // Fallback: Se algo der errado na lógica, atualiza o global
                await atualizarFaturamento(novoValor);
            }
            
        } else {
            const rota = tipo === 'despesa' ? 'despesas' : 'investimentos';
            const idParaSalvar = modo === 'editar' ? itemEdicao?.id : undefined;
            await salvarItem(rota, { ...dados, id: idParaSalvar });
        }
    };

    const handleLimparFiltros = () => {
        setFiltroDataInicio('');
        setFiltroDataFim('');
        setFiltroStatus('todos');
    };

    const handleAlternarAtivo = async (item: ItemFinanceiro) => {
        const rota = view === 'despesas' ? 'despesas' : 'investimentos';
        await salvarItem(rota, { ...item, ativo: !item.ativo });
    };

    const handleExcluir = (id: number) => {
        excluirItem(view === 'despesas' ? 'despesas' : 'investimentos', id);
    };

    if (loading) {
        return (
            <div className="financeiro-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ color: '#94a3b8', fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Carregando finanças...
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="financeiro-container">
            {/* CABEÇALHO COM BADGE VISUAL */}
            <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px'}}>
                <h1>Gestão Financeira 💰</h1>
                
                {/* A Etiqueta Mágica: Mostra JANEIRO, JAN/FEV, etc */}
                {infoDatas.label && (
                    <span style={{
                        backgroundColor: infoDatas.isMesUnico ? '#3b82f6' : '#f97316', // Azul se for mês único, Laranja se for composto
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        letterSpacing: '0.05em'
                    }}>
                        {infoDatas.label}
                    </span>
                )}
            </div>

            <ResumoFinanceiro 
                dados={dashboardCalculado} 
                viewAtual={view} 
                onViewChange={setView} 
                onEditFaturamento={handleEditFaturamento}
                // Props novas para controlar a UI do card
                labelMes={infoDatas.isMesUnico ? infoDatas.label : undefined}
                isMesUnico={infoDatas.isMesUnico}
            />

            <FiltroFinanceiro 
                dataInicio={filtroDataInicio} setDataInicio={setFiltroDataInicio}
                dataFim={filtroDataFim} setDataFim={setFiltroDataFim}
                status={filtroStatus} setStatus={setFiltroStatus}
                onLimpar={handleLimparFiltros}
            />

            <ListaFinanceiro 
                view={view}
                itens={view === 'despesas' ? despesas : investimentos}
                filtroDataInicio={filtroDataInicio}
                filtroDataFim={filtroDataFim}
                filtroStatus={filtroStatus}
                onNovo={handleNovo} onEditar={handleEditar} onClonar={handleClonar}
                onExcluir={handleExcluir}
                onAlternarAtivo={handleAlternarAtivo}
            />
            
            {modalConfig.aberto && (
                <ModalFinanceiro 
                    tipo={modalConfig.tipo} itemEdicao={modalConfig.itemEdicao} 
                    // Mostra no modal o valor que está sendo usado no momento (seja o mensal ou o global)
                    valorFaturamentoAtual={dashboardCalculado.faturamento}
                    onClose={() => setModalConfig({ ...modalConfig, aberto: false })} onSalvar={handleSalvarModal}
                />
            )}
        </div>
    );
}