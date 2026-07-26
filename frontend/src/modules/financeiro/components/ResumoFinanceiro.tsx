// ARQUIVO: src/modules/financeiro/components/ResumoFinanceiro.tsx

import { TrendingDown, TrendingUp, PieChart, Edit2 } from 'lucide-react';
import type { DashboardData, ViewMode } from '../types';
import { formatarBRL } from '../../../utils/formatters'; 
import './ResumoFinanceiro.css';

interface Props {
    dados: DashboardData;
    viewAtual: ViewMode;
    onViewChange: (v: ViewMode) => void;
    onEditFaturamento: () => void;
    
    labelMes?: string;      
    isMesUnico?: boolean;   
}

export function ResumoFinanceiro({ 
    dados, 
    viewAtual, 
    onViewChange, 
    onEditFaturamento,
    labelMes,
    isMesUnico = false 
}: Props) {
    
    const getCorTaxa = () => {
        if (dados.taxaCustoFixo > 30) return '#ef4444';
        if (dados.taxaCustoFixo > 15) return '#f59e0b';
        return '#22c55e';
    };

    // NOVA FUNÇÃO: Formatação Inteligente para porcentagens extremas
    const formatarTaxa = (taxa: number) => {
        // Se a taxa for absurda (ex: Faturamento baixo e Despesa na casa dos Bilhões)
        if (taxa >= 1_000_000) {
            return new Intl.NumberFormat('pt-BR', { 
                notation: 'compact', 
                maximumFractionDigits: 2 
            }).format(taxa) + '%';
        }
        return taxa.toFixed(2) + '%';
    };

    // Estilo CSS de defesa compartilhado para evitar quebra de layout em telas pequenas
    const cssProtecaoOverflow: React.CSSProperties = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%'
    };

    return (
        <div className="resumo-grid">
            {/* CARD 1: Faturamento (Inteligente) */}
            <div 
                className={`resumo-card card-azul ${!isMesUnico ? 'disabled' : ''}`} 
                onClick={isMesUnico ? onEditFaturamento : undefined}
                style={{ cursor: isMesUnico ? 'pointer' : 'default' }}
                title={!isMesUnico ? "Selecione apenas um mês para editar o faturamento" : "Clique para editar"}
            >
                <div className="card-info" style={{ overflow: 'hidden' }}>
                    <h3>
                        Faturamento 
                        {labelMes && <span style={{fontSize: '0.7em', marginLeft: '6px', opacity: 0.8}}>({labelMes})</span>}
                    </h3>
                    
                    {/* DEFESA APLICADA: CSS + Tooltip (title) */}
                    <p 
                        style={{ color: '#1e293b', ...cssProtecaoOverflow }} 
                        title={formatarBRL(dados.faturamento)}
                    >
                        {formatarBRL(dados.faturamento)}
                    </p>
                    
                    <small style={cssProtecaoOverflow}>
                        {isMesUnico 
                            ? "Clique para definir o real deste mês" 
                            : "Período composto (Visualização)"}
                    </small>
                </div>
                
                {isMesUnico && (
                    <button className="card-edit-btn">
                        <Edit2 size={20} />
                    </button>
                )}
            </div>

            {/* CARD 2: Despesas */}
            <div 
                className={`resumo-card card-vermelho ${viewAtual === 'despesas' ? 'active' : ''}`} 
                onClick={() => onViewChange('despesas')}
                title="Ver Despesas"
            >
                <div className="card-info" style={{ overflow: 'hidden' }}>
                    <h3>Despesas Fixas</h3>
                    {/* DEFESA APLICADA */}
                    <p 
                        style={{ color: '#ef4444', ...cssProtecaoOverflow }}
                        title={formatarBRL(dados.totalDespesas)}
                    >
                        {formatarBRL(dados.totalDespesas)}
                    </p>
                </div>
                <TrendingDown size={28} color="#ef4444" style={{ flexShrink: 0 }} />
            </div>

            {/* CARD 3: Investimentos */}
            <div 
                className={`resumo-card card-roxo ${viewAtual === 'investimentos' ? 'active' : ''}`}
                onClick={() => onViewChange('investimentos')}
                title="Ver Investimentos"
            >
                <div className="card-info" style={{ overflow: 'hidden' }}>
                    <h3>Investimentos</h3>
                    {/* DEFESA APLICADA */}
                    <p 
                        style={{ color: '#8b5cf6', ...cssProtecaoOverflow }}
                        title={formatarBRL(dados.totalInvestimentos)}
                    >
                        {formatarBRL(dados.totalInvestimentos)}
                    </p>
                </div>
                <PieChart size={28} color="#8b5cf6" style={{ flexShrink: 0 }} />
            </div>

            {/* CARD 4: Taxa Custo Fixo */}
            <div className="resumo-card card-laranja">
                <div className="card-info" style={{ width: '100%', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Taxa Custo Fixo</h3>
                        <TrendingUp size={20} color={getCorTaxa()} style={{ flexShrink: 0 }} />
                    </div>
                    
                    {/* DEFESA APLICADA: Formatação Compacta + Truncamento CSS */}
                    <p 
                        style={{ color: getCorTaxa(), ...cssProtecaoOverflow }}
                        title={`${dados.taxaCustoFixo.toFixed(2)}%`}
                    >
                        {formatarTaxa(dados.taxaCustoFixo)}
                    </p>
                    
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${Math.min(dados.taxaCustoFixo, 100)}%`, backgroundColor: getCorTaxa() }} />
                    </div>
                </div>
            </div>
        </div>
    );
}