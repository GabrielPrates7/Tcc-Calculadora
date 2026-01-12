import { useState } from 'react';
import { useFinanceiro } from './hooks/useFinanceiro';
import { ResumoFinanceiro } from './components/ResumoFinanceiro';
import { ListaFinanceiro } from './components/ListaFinanceiro';
import { ModalFinanceiro } from './components/ModalFinanceiro';
import type { ViewMode, TipoModal, ItemFinanceiro } from './types';
import './Financeiro.css'; 

export function Financeiro() {
    // 1. Hook de Dados
    const { 
        loading, // Agora vamos usar essa variável
        dashboard, 
        despesas, 
        investimentos, 
        salvarItem, 
        excluirItem, 
        atualizarFaturamento 
    } = useFinanceiro();

    // 2. Estados de UI
    const [view, setView] = useState<ViewMode>('despesas');
    const [modalConfig, setModalConfig] = useState<{
        aberto: boolean;
        tipo: TipoModal;
        itemEdicao: ItemFinanceiro | null;
    }>({ aberto: false, tipo: 'despesa', itemEdicao: null });

    // 3. Handlers
    const handleNovo = () => {
        setModalConfig({ 
            aberto: true, 
            tipo: view === 'despesas' ? 'despesa' : 'investimento', 
            itemEdicao: null 
        });
    };

    const handleEditar = (item: ItemFinanceiro) => {
        setModalConfig({ 
            aberto: true, 
            tipo: view === 'despesas' ? 'despesa' : 'investimento', 
            itemEdicao: item 
        });
    };

    const handleEditFaturamento = () => {
        setModalConfig({ 
            aberto: true, 
            tipo: 'faturamento', 
            itemEdicao: null 
        });
    };

    const handleSalvarModal = async (nome: string, valor: number) => {
        const { tipo, itemEdicao } = modalConfig;
        
        if (tipo === 'faturamento') {
            await atualizarFaturamento(valor);
        } else {
            const rota = tipo === 'despesa' ? 'despesas' : 'investimentos';
            await salvarItem(rota, { id: itemEdicao?.id, nome, valor });
        }
    };

    // --- CORREÇÃO: Usando a variável loading ---
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
            <h1>Gestão Financeira 💰</h1>

            <ResumoFinanceiro 
                dados={dashboard} 
                viewAtual={view} 
                onViewChange={setView} 
                onEditFaturamento={handleEditFaturamento}
            />

            <ListaFinanceiro 
                view={view}
                itens={view === 'despesas' ? despesas : investimentos}
                onNovo={handleNovo}
                onEditar={handleEditar}
                onExcluir={(id) => excluirItem(view === 'despesas' ? 'despesas' : 'investimentos', id)}
            />

            {modalConfig.aberto && (
                <ModalFinanceiro 
                    tipo={modalConfig.tipo}
                    itemEdicao={modalConfig.itemEdicao}
                    valorFaturamentoAtual={dashboard.faturamento}
                    onClose={() => setModalConfig({ ...modalConfig, aberto: false })}
                    onSalvar={handleSalvarModal}
                />
            )}
        </div>
    );
}