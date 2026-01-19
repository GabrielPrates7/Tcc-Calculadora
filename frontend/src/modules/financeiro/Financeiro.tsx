// ARQUIVO: src/modules/financeiro/Financeiro.tsx

import { useState, useMemo } from 'react';
import { useFinanceiro } from './hooks/useFinanceiro';
import { ResumoFinanceiro } from './components/ResumoFinanceiro';
import { ListaFinanceiro } from './components/ListaFinanceiro';
import { ModalFinanceiro } from './components/ModalFinanceiro';
import { FiltroFinanceiro } from './components/FiltroFinanceiro'; 
import type { ViewMode, TipoModal, ItemFinanceiro, StatusFilter } from './types'; 
import './Financeiro.css'; 

export function Financeiro() {
    const { 
        loading, 
        dashboard: dashboardOriginal, // Renomeei para indicar que vem do Banco (Bruto)
        despesas, 
        investimentos, 
        salvarItem, 
        excluirItem, 
        atualizarFaturamento 
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
    
    // Inicializa com as datas do Mês Atual preenchidas
    const [filtroDataInicio, setFiltroDataInicio] = useState(getInicioMes());
    const [filtroDataFim, setFiltroDataFim] = useState(getFimMes());
    const [filtroStatus, setFiltroStatus] = useState<StatusFilter>('todos');

    const [modalConfig, setModalConfig] = useState<{
        aberto: boolean;
        tipo: TipoModal;
        modo: 'criar' | 'editar';
        itemEdicao: ItemFinanceiro | null;
    }>({ aberto: false, tipo: 'despesa', modo: 'criar', itemEdicao: null });

    // --- CÉREBRO MATEMÁTICO (Cálculo Dinâmico) ---
    const dashboardCalculado = useMemo(() => {
        // Função que soma apenas o que está dentro do filtro de data
        const somarFiltrados = (lista: ItemFinanceiro[]) => {
            return lista.filter(item => {
                // Se item não está ativo, não entra na conta do Custo Fixo
                if (!item.ativo) return false;

                const dataItem = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
                
                // Se não tem filtro de data selecionado, soma tudo
                if (!filtroDataInicio && !filtroDataFim) return true;

                // Se TEM filtro de data, itens sem data de vencimento são ignorados no cálculo do período
                if (!dataItem) return false;

                let match = true;
                if (filtroDataInicio) match = match && dataItem >= filtroDataInicio;
                if (filtroDataFim) match = match && dataItem <= filtroDataFim;
                
                return match;
            }).reduce((acc, curr) => acc + Number(curr.valor), 0);
        };

        const totalDespesasFiltradas = somarFiltrados(despesas);
        const totalInvestimentosFiltrados = somarFiltrados(investimentos);
        
        // Recalcula a Taxa de Custo Fixo baseada na soma filtrada
        // Fórmula: ((Despesas + Investimentos) / Faturamento) * 100
        const taxaCustoFixo = dashboardOriginal.faturamento > 0 
            ? ((totalDespesasFiltradas + totalInvestimentosFiltrados) / dashboardOriginal.faturamento) * 100 
            : 0;

        // Retorna um novo objeto de dashboard com os valores atualizados
        return {
            ...dashboardOriginal,
            totalDespesas: totalDespesasFiltradas,
            totalInvestimentos: totalInvestimentosFiltrados,
            taxaCustoFixo: taxaCustoFixo,
            // Mantemos o faturamento original pois ele é uma média fixa configurada
        };
    }, [despesas, investimentos, filtroDataInicio, filtroDataFim, dashboardOriginal]);

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

    const handleEditFaturamento = () => setModalConfig({ aberto: true, tipo: 'faturamento', modo: 'editar', itemEdicao: null });
    
    const handleAlternarAtivo = async (item: ItemFinanceiro) => {
        const rota = view === 'despesas' ? 'despesas' : 'investimentos';
        await salvarItem(rota, { ...item, ativo: !item.ativo });
    };

    const handleSalvarModal = async (dados: Partial<ItemFinanceiro>) => {
        const { tipo, itemEdicao, modo } = modalConfig;
        if (tipo === 'faturamento') {
            await atualizarFaturamento(Number(dados.valor));
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

    if (loading) {
        return (
            <div className="financeiro-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Carregando finanças...
            </div>
        );
    }

    return (
        <div className="financeiro-container">
            <h1>Gestão Financeira 💰</h1>
            
            {/* Passamos o dashboard CALCULADO, que muda conforme o filtro */}
            <ResumoFinanceiro 
                dados={dashboardCalculado} 
                viewAtual={view} 
                onViewChange={setView} 
                onEditFaturamento={handleEditFaturamento}
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
                onExcluir={(id) => excluirItem(view === 'despesas' ? 'despesas' : 'investimentos', id)}
                onAlternarAtivo={handleAlternarAtivo}
            />
            
            {modalConfig.aberto && (
                <ModalFinanceiro 
                    tipo={modalConfig.tipo} itemEdicao={modalConfig.itemEdicao} valorFaturamentoAtual={dashboardOriginal.faturamento}
                    onClose={() => setModalConfig({ ...modalConfig, aberto: false })} onSalvar={handleSalvarModal}
                />
            )}
        </div>
    );
}