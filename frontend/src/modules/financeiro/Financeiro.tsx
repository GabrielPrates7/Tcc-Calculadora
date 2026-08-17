// ARQUIVO: src/modules/financeiro/Financeiro.tsx

import { useState, useMemo, useEffect } from 'react';
import { FileText, History, Save } from 'lucide-react'; 
import { useFinanceiro } from './hooks/useFinanceiro';
import { ResumoFinanceiro } from './components/ResumoFinanceiro';
import { ListaFinanceiro } from './components/ListaFinanceiro';
import { ModalFinanceiro } from './components/ModalFinanceiro';
import { FiltroFinanceiro } from './components/FiltroFinanceiro'; 
import { ModalRelatorio } from './components/ModalRelatorio';
import { ModalHistorico } from './components/ModalHistorico'; 
import { ModalConfirmacao } from './components/ModalConfirmacao'; 
import { ModalNovoCheckpoint } from './components/ModalNovoCheckpoint';
import type { ViewMode, TipoModal, ItemFinanceiro, StatusFilter } from './types'; 
import { analisarIntervalo } from './utils/dateHelper';
import { api } from '../../services/api'; // <-- IMPORTAÇÃO DA API CORRIGIDA
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
        somarFaturamentoPeriodo
    } = useFinanceiro();

    const getInicioMes = () => {
        const hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    };
    
    const getFimMes = () => {
        const hoje = new Date();
        return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
    };

    const [view, setView] = useState<ViewMode>('despesas');
    const [filtroDataInicio, setFiltroDataInicio] = useState(getInicioMes());
    const [filtroDataFim, setFiltroDataFim] = useState(getFimMes());
    const [filtroStatus, setFiltroStatus] = useState<StatusFilter>('todos');
    const [faturamentoExibido, setFaturamentoExibido] = useState<number>(0);

    const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
    const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false); 

    const [modalExclusao, setModalExclusao] = useState<{ aberto: boolean; id: number | null }>({ aberto: false, id: null });
    
    const [modalCheckpointAberto, setModalCheckpointAberto] = useState(false);

    const [modalConfig, setModalConfig] = useState<{
        aberto: boolean;
        tipo: TipoModal;
        modo: 'criar' | 'editar';
        itemEdicao: ItemFinanceiro | null;
    }>({ aberto: false, tipo: 'despesa', modo: 'criar', itemEdicao: null });

    const infoDatas = useMemo(() => {
        return analisarIntervalo(filtroDataInicio, filtroDataFim);
    }, [filtroDataInicio, filtroDataFim]);

    useEffect(() => {
        const carregarFaturamento = async () => {
            if (infoDatas.ano) {
                if (infoDatas.isMesUnico) {
                    const valor = await buscarFaturamentoMensal(infoDatas.meses[0] + 1, infoDatas.ano);
                    setFaturamentoExibido(valor || 0);
                } 
                else if (infoDatas.meses.length > 0) {
                    const mesesBanco = infoDatas.meses.map(m => m + 1);
                    const total = await somarFaturamentoPeriodo(mesesBanco, infoDatas.ano);
                    setFaturamentoExibido(total || 0);
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
        const faturamentoFinal = faturamentoExibido;

        const taxaCustoFixo = faturamentoFinal > 0 
            ? (totalDespesasFiltradas / faturamentoFinal) * 100 
            : 0;

        return {
            ...dashboardOriginal,
            faturamento: faturamentoFinal,
            totalDespesas: totalDespesasFiltradas,
            totalInvestimentos: totalInvestimentosFiltrados,
            taxaCustoFixo: taxaCustoFixo,
        };
    }, [despesas, investimentos, filtroDataInicio, filtroDataFim, faturamentoExibido, dashboardOriginal]);

    const handleSalvarCheckpoint = () => {
        setModalCheckpointAberto(true);
    };

    const confirmarSalvarCheckpoint = async (descricao: string): Promise<boolean> => {
        try {
            // CORREÇÃO: Usando a 'api' do Axios em vez de 'fetch'
            await api.post('/financeiro/snapshots', {
                descricao,
                faturamento: dashboardCalculado.faturamento,
                total_despesas: dashboardCalculado.totalDespesas,
                total_investimentos: dashboardCalculado.totalInvestimentos,
                taxa_custo_fixo: dashboardCalculado.taxaCustoFixo,
                dados_backup: { despesas, investimentos }
            });
            
            return true;
        } catch (error) {
            console.error("Erro ao salvar checkpoint:", error);
            alert("Erro de conexão ao salvar na API.");
            return false;
        }
    };

    const handleNovo = () => setModalConfig({ aberto: true, tipo: view === 'despesas' ? 'despesa' : 'investimento', modo: 'criar', itemEdicao: null });
    const handleEditar = (item: ItemFinanceiro) => setModalConfig({ aberto: true, tipo: view === 'despesas' ? 'despesa' : 'investimento', modo: 'editar', itemEdicao: item });
    const handleClonar = (item: ItemFinanceiro) => setModalConfig({ aberto: true, tipo: view === 'despesas' ? 'despesa' : 'investimento', modo: 'criar', itemEdicao: { ...item, pago: false, dataVencimento: '' } });
    
    const handleEditFaturamento = () => {
        if (infoDatas.isMesUnico) {
            setModalConfig({ aberto: true, tipo: 'faturamento', modo: 'editar', itemEdicao: null });
        }
    };

    const handleSalvarModal = async (dados: Partial<ItemFinanceiro>) => {
        const { tipo, itemEdicao, modo } = modalConfig;
        
        let sucesso = false;

        if (tipo === 'faturamento') {
            const novoValor = Number(dados.valor);
            if (infoDatas.isMesUnico && infoDatas.ano) {
                sucesso = await salvarFaturamentoMensal(infoDatas.meses[0] + 1, infoDatas.ano, novoValor);
                if (sucesso) setFaturamentoExibido(novoValor);
            } 
        } else {
            const rota = tipo === 'despesa' ? 'despesas' : 'investimentos';
            const idParaSalvar = modo === 'editar' ? itemEdicao?.id : undefined;
            sucesso = await salvarItem(rota, { ...dados, id: idParaSalvar });
        }

        if (!sucesso) {
            alert("O sistema bloqueou o cadastro: O valor excede o limite permitido ou ocorreu um erro de conexão com o banco.");
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
        setModalExclusao({ aberto: true, id });
    };

    const confirmarExclusao = () => {
        if (modalExclusao.id !== null) {
            excluirItem(view === 'despesas' ? 'despesas' : 'investimentos', modalExclusao.id);
        }
        setModalExclusao({ aberto: false, id: null });
    };

    if (loading) {
        return (
            <div className="financeiro-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    return (
        <div className="financeiro-container">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <h1>Gestão de Custos Fixos 📉</h1>
                    {infoDatas.label && (
                        <span style={{
                            backgroundColor: infoDatas.isMesUnico ? '#3b82f6' : '#f97316', 
                            color: 'white', padding: '4px 12px', borderRadius: '20px', 
                            fontWeight: 'bold', fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {infoDatas.label}
                        </span>
                    )}
                </div>

                <div style={{display: 'flex', gap: '10px'}}>
                    <button 
                        onClick={handleSalvarCheckpoint} 
                        style={{ backgroundColor: '#059669', color: 'white', border:'none', padding:'8px', borderRadius:6, cursor:'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                        title="Salvar Checkpoint Atual"
                    >
                        <Save size={20} />
                    </button>
                    <button 
                        onClick={() => setModalHistoricoAberto(true)} 
                        style={{ backgroundColor: '#475569', color: 'white', border:'none', padding:'8px', borderRadius:6, cursor:'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                        title="Ver Linha do Tempo"
                    >
                        <History size={20} />
                    </button>
                    <button 
                        onClick={() => setModalRelatorioAberto(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            backgroundColor: '#1e293b', color: 'white', border: 'none',
                            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        <FileText size={18} /> Relatório PDF
                    </button>
                </div>
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

            {modalRelatorioAberto && (
                <ModalRelatorio 
                    despesas={despesas}
                    investimentos={investimentos}
                    onClose={() => setModalRelatorioAberto(false)}
                    somarFaturamento={somarFaturamentoPeriodo}
                />
            )}

            {modalHistoricoAberto && (
                <ModalHistorico onClose={() => setModalHistoricoAberto(false)} />
            )}

            <ModalConfirmacao 
                isOpen={modalExclusao.aberto}
                onClose={() => setModalExclusao({ aberto: false, id: null })}
                onConfirm={confirmarExclusao}
            />

            <ModalNovoCheckpoint
                isOpen={modalCheckpointAberto}
                onClose={() => setModalCheckpointAberto(false)}
                onConfirm={confirmarSalvarCheckpoint}
            />
        </div>
    );
}