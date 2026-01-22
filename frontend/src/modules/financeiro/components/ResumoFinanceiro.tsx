// ARQUIVO: src/modules/financeiro/components/ResumoFinanceiro.tsx

import { TrendingDown, TrendingUp, PieChart, Edit2 } from 'lucide-react';
import type { DashboardData, ViewMode } from '../types';
import './ResumoFinanceiro.css';

interface Props {
    dados: DashboardData;
    viewAtual: ViewMode;
    onViewChange: (v: ViewMode) => void;
    onEditFaturamento: () => void;
    
    // NOVAS PROPS (Opcionais, pois podem não vir no primeiro render)
    labelMes?: string;      // Ex: "JANEIRO"
    isMesUnico?: boolean;   // Se for true, permite editar. Se false, bloqueia.
}

export function ResumoFinanceiro({ 
    dados, 
    viewAtual, 
    onViewChange, 
    onEditFaturamento,
    labelMes,
    isMesUnico = false // Valor padrão para evitar erro
}: Props) {
    
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const getCorTaxa = () => {
        if (dados.taxaCustoFixo > 30) return '#ef4444';
        if (dados.taxaCustoFixo > 15) return '#f59e0b';
        return '#22c55e';
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
                <div className="card-info">
                    <h3>
                        Faturamento 
                        {/* Mostra o mês selecionado pequeno ao lado */}
                        {labelMes && <span style={{fontSize: '0.7em', marginLeft: '6px', opacity: 0.8}}>({labelMes})</span>}
                    </h3>
                    
                    <p style={{ color: '#1e293b' }}>{BRL(dados.faturamento)}</p>
                    
                    {/* Texto condicional para explicar a situação */}
                    <small>
                        {isMesUnico 
                            ? "Clique para definir o real deste mês" 
                            : "Período composto (Visualização)"}
                    </small>
                </div>
                
                {/* Só mostra o ícone de editar se for um mês único */}
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
            >
                <div className="card-info">
                    <h3>Despesas Fixas</h3>
                    <p style={{ color: '#ef4444' }}>{BRL(dados.totalDespesas)}</p>
                </div>
                <TrendingDown size={28} color="#ef4444" />
            </div>

            {/* CARD 3: Investimentos */}
            <div 
                className={`resumo-card card-roxo ${viewAtual === 'investimentos' ? 'active' : ''}`}
                onClick={() => onViewChange('investimentos')}
            >
                <div className="card-info">
                    <h3>Investimentos</h3>
                    <p style={{ color: '#8b5cf6' }}>{BRL(dados.totalInvestimentos)}</p>
                </div>
                <PieChart size={28} color="#8b5cf6" />
            </div>

            {/* CARD 4: Taxa */}
            <div className="resumo-card card-laranja">
                <div className="card-info" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Taxa Custo Fixo</h3>
                        <TrendingUp size={20} color={getCorTaxa()} />
                    </div>
                    <p style={{ color: getCorTaxa() }}>{dados.taxaCustoFixo.toFixed(2)}%</p>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${Math.min(dados.taxaCustoFixo, 100)}%`, backgroundColor: getCorTaxa() }} />
                    </div>
                </div>
            </div>
        </div>
    );
}