import { useDashboard } from './hooks/useDashboard';
import { formatarBRL } from './utils/formatters';
import {
    TrendingUp, DollarSign, Wrench, BarChart3,
    Clock, Hammer, CheckCircle2, FileText
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css';

// Dados simulados para o gráfico (substituir por dados reais da API futuramente)
const dadosGrafico = [
    { mes: 'Jan', receita: 18000, lucro: 5400 },
    { mes: 'Fev', receita: 22000, lucro: 6600 },
    { mes: 'Mar', receita: 19500, lucro: 5850 },
    { mes: 'Abr', receita: 25000, lucro: 7500 },
    { mes: 'Mai', receita: 21000, lucro: 6300 },
    { mes: 'Jun', receita: 28000, lucro: 8400 },
];

interface IndicadorCardProps {
    titulo: string;
    valor: string;
    icone: React.ReactNode;
    cor: string;
    sub?: string;
}

function IndicadorCard({ titulo, valor, icone, cor, sub }: IndicadorCardProps) {
    return (
        <div className="ind-card" style={{ borderBottom: `3px solid ${cor}` }}>
            <div className="ind-card-topo">
                <span className="ind-titulo">{titulo}</span>
                <div className="ind-icone" style={{ background: `${cor}22`, color: cor }}>
                    {icone}
                </div>
            </div>
            <p className="ind-valor">{valor}</p>
            {sub && <span className="ind-sub">{sub}</span>}
        </div>
    );
}

interface KanbanCardProps {
    titulo: string;
    quantidade: number;
    icone: React.ReactNode;
    cor: string;
}

function KanbanCard({ titulo, quantidade, icone, cor }: KanbanCardProps) {
    return (
        <div className="kanban-card" style={{ borderLeft: `4px solid ${cor}` }}>
            <div className="kanban-icone" style={{ color: cor }}>{icone}</div>
            <div className="kanban-info">
                <span className="kanban-titulo">{titulo}</span>
                <strong className="kanban-qtd" style={{ color: cor }}>{quantidade}</strong>
            </div>
        </div>
    );
}

const TooltipCustom = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name === 'receita' ? 'Receita' : 'Lucro'}: {formatarBRL(p.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function Dashboard() {
    const { dados, loading } = useDashboard();

    if (loading || !dados) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Carregando indicadores...</p>
            </div>
        );
    }

    const { indicadores, funilProducao } = dados;
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
                    titulo="Custo Hora / Dia"
                    valor={formatarBRL(indicadores.valorMaoObra)}
                    icone={<Wrench size={20} />}
                    cor="#3b82f6"
                    sub="Unidade produtiva atual"
                />
                <IndicadorCard
                    titulo="Receita Prevista"
                    valor={formatarBRL(indicadores.receitaMes)}
                    icone={<DollarSign size={20} />}
                    cor="#10b981"
                    sub="Ordens ativas no mês"
                />
                <IndicadorCard
                    titulo="Lucro Projetado"
                    valor={formatarBRL(indicadores.lucroMes)}
                    icone={<TrendingUp size={20} />}
                    cor="#a855f7"
                    sub="Lucro líquido estimado"
                />
            </div>

            <div className="dashboard-linha">

                <div className="grafico-card">
                    <div className="card-header">
                        <h3>Receita × Lucro</h3>
                        <span className="card-badge">Últimos 6 meses</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<TooltipCustom />} />
                            <Legend formatter={(v) => v === 'receita' ? 'Receita' : 'Lucro'} wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                            <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} fill="url(#gradReceita)" />
                            <Area type="monotone" dataKey="lucro" stroke="#a855f7" strokeWidth={2} fill="url(#gradLucro)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="funil-card">
                    <div className="card-header">
                        <h3>Ordens de Serviço</h3>
                        <span className="card-badge">{totalOS} total</span>
                    </div>

                    <div className="kanban-lista">
                        <KanbanCard
                            titulo="Fila de Espera"
                            quantidade={funilProducao.fila}
                            icone={<Clock size={20} />}
                            cor="#f97316"
                        />
                        <KanbanCard
                            titulo="Em Andamento"
                            quantidade={funilProducao.andamento}
                            icone={<Hammer size={20} />}
                            cor="#3b82f6"
                        />
                        <KanbanCard
                            titulo="Concluídas"
                            quantidade={funilProducao.concluido}
                            icone={<CheckCircle2 size={20} />}
                            cor="#10b981"
                        />
                    </div>

                    <div className="funil-barra-wrap">
                        <div className="funil-barra">
                            {totalOS > 0 && (
                                <>
                                    <div className="funil-seg" style={{ width: `${(funilProducao.fila / totalOS) * 100}%`, background: '#f97316' }} />
                                    <div className="funil-seg" style={{ width: `${(funilProducao.andamento / totalOS) * 100}%`, background: '#3b82f6' }} />
                                    <div className="funil-seg" style={{ width: `${(funilProducao.concluido / totalOS) * 100}%`, background: '#10b981' }} />
                                </>
                            )}
                        </div>
                        <div className="funil-legenda">
                            <span style={{ color: '#f97316' }}>● Fila</span>
                            <span style={{ color: '#3b82f6' }}>● Andamento</span>
                            <span style={{ color: '#10b981' }}>● Concluído</span>
                        </div>
                    </div>

                    <button className="btn-ver-todas" onClick={() => window.location.href = '/ordens'}>
                        <FileText size={14} /> Ver todas as O.S.
                    </button>
                </div>
            </div>
        </div>
    );
}
