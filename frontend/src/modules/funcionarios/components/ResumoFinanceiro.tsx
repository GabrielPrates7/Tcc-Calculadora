import { Users, Wallet, Briefcase, TrendingUp } from 'lucide-react';
import './ResumoFinanceiro.css';

interface Props {
    custoFolha: number;
    custoProducao: number;
    totalAtivos: number;
    loading: boolean;
}

export function ResumoFinanceiro({ custoFolha, custoProducao, totalAtivos, loading }: Props) {
    
    // Função auxiliar para formatar moeda
    const BRL = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return (
            <div className="resumo-grid">
                <div className="card-skeleton"></div>
                <div className="card-skeleton"></div>
                <div className="card-skeleton"></div>
            </div>
        );
    }

    return (
        <div className="resumo-grid">
            
            {/* Card 1: Equipe */}
            <div className="card-metric card-orange">
                <div className="icon-wrapper">
                    <Users size={24} />
                </div>
                <div className="metric-info">
                    <span className="metric-label">Equipe Ativa</span>
                    <strong className="metric-value">{totalAtivos}</strong>
                    <span className="metric-sub">colaboradores</span>
                </div>
            </div>

            {/* Card 2: Custo Folha */}
            <div className="card-metric card-blue">
                <div className="icon-wrapper">
                    <Wallet size={24} />
                </div>
                <div className="metric-info">
                    <span className="metric-label">Custo Folha Mensal</span>
                    <strong className="metric-value">{BRL(custoFolha)}</strong>
                    <div className="metric-trend">
                        <TrendingUp size={14} /> <span>Visão Geral</span>
                    </div>
                </div>
            </div>

            {/* Card 3: Produção */}
            <div className="card-metric card-green">
                <div className="icon-wrapper">
                    <Briefcase size={24} />
                </div>
                <div className="metric-info">
                    <span className="metric-label">Custo Produção</span>
                    <strong className="metric-value">{BRL(custoProducao)}</strong>
                    <div className="metric-trend">
                        <div className="percent-badge">{(custoProducao / custoFolha * 100).toFixed(0)}%</div>
                        <span>do total</span>
                    </div>
                </div>
            </div>

        </div>
    );
}