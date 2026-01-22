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
        buscarFaturamentoMensal, 
        salvarFaturamentoMensal,
        somarFaturamentoPeriodo // IMPORTANTE: Nova função do hook
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

    // ESTADO LOCAL: Guarda o valor do faturamento a ser exibido (pode ser mês único ou soma)
    const [faturamentoExibido, setFaturamentoExibido] = useState<number>(0);

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

    // 2. BUSCAR OU SOMAR FATURAMENTO (Lógica Inteligente)
    useEffect(() => {
        const carregarFaturamento = async () => {
            // Se o período é válido (tem ano)
            if (infoDatas.ano) {
                if (infoDatas.isMesUnico) {
                    // Cenario A: Mês Único (Ex: Janeiro) -> Busca valor exato
                    // infoDatas.meses[0] é 0 (Jan), banco quer 1. Somamos +1.
                    const valor = await buscarFaturamentoMensal(infoDatas.meses[0] + 1, infoDatas.ano);
                    setFaturamentoExibido(valor || 0);
                } 
                else if (infoDatas.meses.length > 0) {
                    // Cenario B: Vários Meses (Ex: Jan a Mar) -> Soma tudo
                    const mesesBanco = infoDatas.meses.map(m => m + 1); // Converte [0,1,2] para [1,2,3]
                    const total = await somarFaturamentoPeriodo(mesesBanco, infoDatas.ano);
                    setFaturamentoExibido(total);
                } 
                else {
                    setFaturamentoExibido(0);
                }
            } else {
                setFaturamentoExibido(0);
            }
        };
        carregarFaturamento();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [infoDatas.meses, infoDatas.ano, infoDatas.isMesUnico]); 


    // 3. CÁLCULO DINÂMICO DO DASHBOARD (O Cérebro)
    const dashboardCalculado = useMemo(() => {
        const somarFiltrados = (lista: ItemFinanceiro[]) => {
            return lista.filter(item => {
                if (!item.ativo) return false;
                
                const dataItem = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
                
                if (!filtroDataInicio && !filtroDataFim) return true;
                if (!dataItem) return false;

                let match = true;
                if (filtroDataInicio) match = match && dataItem >= filtroDataInicio;
                if (filtroDataFim) match = match && dataItem <= filtroDataFim;
                return match;
            }).reduce((acc, curr) => acc + Number(curr.valor), 0);
        };

        const totalDespesasFiltradas = somarFiltrados(despesas);
        const totalInvestimentosFiltrados = somarFiltrados(investimentos);
        
        // Agora usamos sempre o valor que veio do banco (Soma ou Mês Único)
        const faturamentoFinal = faturamentoExibido;

        const taxaCustoFixo = faturamentoFinal > 0 
            ? ((totalDespesasFiltradas + totalInvestimentosFiltrados) / faturamentoFinal) * 100 
            : 0;

        return {
            ...dashboardOriginal,
            faturamento: faturamentoFinal, // Mostra o valor correto (Único ou Soma)
            totalDespesas: totalDespesasFiltradas,
            totalInvestimentos: totalInvestimentosFiltrados,
            taxaCustoFixo: taxaCustoFixo,
        };
    }, [despesas, investimentos, filtroDataInicio, filtroDataFim, faturamentoExibido, dashboardOriginal]);


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
                const sucesso = await salvarFaturamentoMensal(infoDatas.meses[0] + 1, infoDatas.ano, novoValor);
                if (sucesso) {
                    setFaturamentoExibido(novoValor); // Atualiza a tela instantaneamente
                }
            } 
            // Não existe mais "fallback" global, então se não for mês único, não faz nada (ou avisa erro)
            
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
                
                {infoDatas.label && (
                    <span style={{
                        backgroundColor: infoDatas.isMesUnico ? '#3b82f6' : '#f97316', 
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
                    valorFaturamentoAtual={dashboardCalculado.faturamento}
                    onClose={() => setModalConfig({ ...modalConfig, aberto: false })} onSalvar={handleSalvarModal}
                />
            )}
        </div>
    );
}