// ResumoFinanceiro.tsx
import { TrendingDown, TrendingUp, PieChart, Edit2 } from 'lucide-react';
import type { DashboardData, ViewMode } from '../types';
import './ResumoFinanceiro.css';

interface Props {
    dados: DashboardData;
    viewAtual: ViewMode;
    onViewChange: (v: ViewMode) => void;
    onEditFaturamento: () => void;
}

export function ResumoFinanceiro({ dados, viewAtual, onViewChange, onEditFaturamento }: Props) {
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const getCorTaxa = () => {
        if (dados.taxaCustoFixo > 30) return '#ef4444';
        if (dados.taxaCustoFixo > 15) return '#f59e0b';
        return '#22c55e';
    };

    return (
        <div className="resumo-grid">
            <div className="resumo-card card-azul" onClick={onEditFaturamento}>
                <div className="card-info">
                    <h3>Faturamento Mensal</h3>
                    <p style={{ color: '#1e293b' }}>{BRL(dados.faturamento)}</p>
                    <small>Clique para editar</small>
                </div>
                <button className="card-edit-btn"><Edit2 size={20} /></button>
            </div>

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