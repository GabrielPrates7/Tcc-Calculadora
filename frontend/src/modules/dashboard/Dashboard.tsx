import { useDashboard } from './hooks/useDashboard';
import { formatarBRL } from './utils/formatters';
import { IndicadorCard } from './components/IndicadorCard';
import { GraficoFinanceiro } from './components/GraficoFinanceiro';
import { TrendingUp, DollarSign, BarChart3, Clock, Hammer, CheckCircle2, FileText, Wallet } from 'lucide-react';
import './styles/Dashboard.css'; // NOVO CAMINHO DO CSS

export function Dashboard() {
    const { dados, loading } = useDashboard();

    if (loading || !dados) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Processando inteligência de dados...</p>
            </div>
        );
    }

    const { indicadores, funilProducao, topCustos } = dados;
    const totalOS = funilProducao.fila + funilProducao.andamento + funilProducao.concluido;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2>Dashboard</h2>
                    <p className="dashboard-sub">Visão geral do sistema Denarius</p>
                </div>
                <span className="dashboard-badge">
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </span>
            </div>

            <div className="indicadores-grid">
                <IndicadorCard
                    titulo="Taxa Custo Fixo"
                    valor={`${indicadores.taxaCustoFixo.toFixed(2)}%`}
                    icone={<BarChart3 size={20} />}
                    cor="#f97316"
                    sub={`Base: ${formatarBRL(indicadores.faturamentoBase)}`}
                />
                <IndicadorCard
                    titulo="Total Despesas Ativas"
                    valor={formatarBRL(indicadores.totalDespesas)}
                    icone={<Wallet size={20} />}
                    cor="#ef4444"
                    sub="Custo operacional base mensal"
                />
                <IndicadorCard
                    titulo="Receita Prevista (Mês)"
                    valor={formatarBRL(indicadores.receitaMes)}
                    icone={<DollarSign size={20} />}
                    cor="#10b981"
                    sub="Projeção baseada em O.S. ativas"
                />
                <IndicadorCard
                    titulo="Lucro Projetado (Mês)"
                    valor={formatarBRL(indicadores.lucroMes)}
                    icone={<TrendingUp size={20} />}
                    cor="#a855f7"
                    sub="Margem líquida estimada"
                />
            </div>

            <div className="dashboard-linha">
                <GraficoFinanceiro />

                <div className="coluna-lateral">
                    <div className="card-modulo">
                        <div className="card-header">
                            <h3>Maiores Custos (Mão de Obra)</h3>
                        </div>
                        <div className="lista-top-custos">
                            {topCustos.map((item, idx) => (
                                <div key={idx} className="item-custo">
                                    <div className="item-custo-info">
                                        <span className="rank-badge">#{idx + 1}</span>
                                        <span className="nome-funcao">{item.funcao}</span>
                                    </div>
                                    <span className="valor-funcao">{formatarBRL(item.custo_total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-modulo">
                        <div className="card-header">
                            <h3>Status de Produção</h3>
                            <span className="card-badge">{totalOS} O.S.</span>
                        </div>
                        <div className="status-grid">
                            <div className="status-box">
                                <Clock size={18} color="#f97316" />
                                <strong>{funilProducao.fila}</strong>
                                <span>Fila</span>
                            </div>
                            <div className="status-box">
                                <Hammer size={18} color="#3b82f6" />
                                <strong>{funilProducao.andamento}</strong>
                                <span>Andamento</span>
                            </div>
                            <div className="status-box">
                                <CheckCircle2 size={18} color="#10b981" />
                                <strong>{funilProducao.concluido}</strong>
                                <span>Concluído</span>
                            </div>
                        </div>
                        <button className="btn-ver-todas" onClick={() => window.location.href = '/ordens'}>
                            <FileText size={14} /> Gerenciar Produção
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}