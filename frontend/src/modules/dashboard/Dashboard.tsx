import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from './hooks/useDashboard';
import { formatarBRL } from '../../utils/formatters';
import { IndicadorCard } from './components/IndicadorCard';
import { GraficoFinanceiro } from './components/GraficoFinanceiro';
import { DollarSign, Clock, CircleCheck, FileText, Wallet, AlertCircle, Calendar, ShieldAlert, ChevronDown, BarChart3, TrendingUp, Trophy, Sparkles, LayoutDashboard, Tag } from 'lucide-react';
import './styles/Dashboard.css';

const MESES = [
    { id: 1, nome: 'Janeiro' }, { id: 2, nome: 'Fevereiro' }, { id: 3, nome: 'Março' },
    { id: 4, nome: 'Abril' }, { id: 5, nome: 'Maio' }, { id: 6, nome: 'Junho' },
    { id: 7, nome: 'Julho' }, { id: 8, nome: 'Agosto' }, { id: 9, nome: 'Setembro' },
    { id: 10, nome: 'Outubro' }, { id: 11, nome: 'Novembro' }, { id: 12, nome: 'Dezembro' }
];

const ANOS = Array.from({ length: 7 }, (_, i) => {
    const ano = 2022 + i;
    return { id: ano, nome: String(ano) };
});

type TipoVisao = 'urgentes' | 'maiorValor' | 'recentes';

const OPCOES_OS: { id: TipoVisao, nome: string }[] = [
    { id: 'urgentes', nome: 'Urgências (Prazo)' },
    { id: 'maiorValor', nome: 'Maior Valor Financeiro' },
    { id: 'recentes', nome: 'Recém Criadas' }
];

function FiltroDropdown<T extends string | number>({ valor, opcoes, onChange }: { valor: T, opcoes: { id: T, nome: string }[], onChange: (v: T) => void }) {
    const [aberto, setAberto] = useState(false);
    const selecionado = opcoes.find(o => o.id === valor);

    return (
        <div className="filtro-custom-container" tabIndex={0} onBlur={() => setAberto(false)}>
            <div className="filtro-custom-trigger" onClick={() => setAberto(!aberto)}>
                <span>{selecionado?.nome}</span>
                <ChevronDown size={14} color="#94a3b8" style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>
            {aberto && (
                <div className="filtro-custom-dropdown">
                    {opcoes.map(op => (
                        <div key={op.id} className={`filtro-custom-option ${op.id === valor ? 'ativo' : ''}`} onMouseDown={() => { onChange(op.id); setAberto(false); }}>
                            {op.nome}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function Dashboard() {
    const navigate = useNavigate(); 
    const { dados, loading, error, mes, setMes, ano, setAno } = useDashboard();
    
    const [visaoOS, setVisaoOS] = useState<TipoVisao>('urgentes');

    if (error) {
        return (
            <div className="dashboard-loading" style={{ gap: '12px' }}>
                <ShieldAlert size={48} color="#ef4444" />
                <h3 style={{ color: '#f87171', margin: 0 }}>Falha de Conexão</h3>
                <p style={{ color: '#94a3b8' }}>{error}</p>
            </div>
        );
    }

    if (loading || !dados) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Processando métricas de produção...</p>
            </div>
        );
    }

    const { indicadores, funilProducao, ordensDestaque, graficoFinanceiro } = dados;
    const listaExibicao = ordensDestaque[visaoOS];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-title-group">
                    <div className="icone-destaque">
                        <LayoutDashboard size={26} color="#f97316" />
                    </div>
                    <div>
                        <h2 className="titulo-gradient">Visão Geral</h2>
                        <p className="dashboard-sub">Métricas limitadas às operações de Ordens de Serviço (Produção)</p>
                    </div>
                </div>
                <div className="filtros-globais">
                    <Calendar size={18} color="#94a3b8" />
                    <FiltroDropdown valor={mes} opcoes={MESES} onChange={setMes} />
                    <FiltroDropdown valor={ano} opcoes={ANOS} onChange={setAno} />
                </div>
            </div>

            <div className="indicadores-grid">
                <IndicadorCard titulo="Taxa Custo Fixo (Atual)" valor={`${indicadores.taxaCustoFixo.toFixed(2)}%`} icone={<BarChart3 size={20} />} cor="#f59e0b" sub={`Base declarada: ${formatarBRL(indicadores.faturamentoBase)}`} />
                <IndicadorCard titulo="Custo Operacional Total" valor={formatarBRL(indicadores.custoOperacionalTotal)} icone={<Wallet size={20} />} cor="#ef4444" sub="Fixos + Folha + Investimentos" />
                <IndicadorCard titulo="Receita Realizada (O.S.)" valor={formatarBRL(indicadores.receitaRealizada)} icone={<DollarSign size={20} />} cor="#10b981" sub="Pagamentos baixados no mês" />
                <IndicadorCard titulo="Ticket Médio" valor={formatarBRL(indicadores.ticketMedio)} icone={<Tag size={20} />} cor="#3b82f6" sub="Receita Realizada ÷ Qtd pagamentos" />
                <IndicadorCard titulo="Receita Prevista (Gargalo)" valor={formatarBRL(indicadores.receitaPrevista)} icone={<Clock size={20} />} cor="#a855f7" sub="Projeção das O.S. abertas no mês" />
            </div>

            <div className="dashboard-linha">
                <GraficoFinanceiro data={graficoFinanceiro} />

                <div className="coluna-lateral">
                    <div className="card-modulo destaque-lateral">
                        <div className="card-header" style={{ paddingBottom: '8px' }}>
                            <FiltroDropdown valor={visaoOS} opcoes={OPCOES_OS} onChange={setVisaoOS} />
                        </div>
                        <div className="lista-entregas">
                            {listaExibicao.length === 0 ? (
                                <p className="msg-vazia">Nenhum dado encontrado para o período.</p>
                            ) : (
                                listaExibicao.map((os) => (
                                    <div key={os.id} className="item-entrega">
                                        <div className="item-entrega-info">
                                            <span className="os-id">#{os.id}</span>
                                            <span className="os-cliente">{os.cliente}</span>
                                        </div>
                                        <div className="item-entrega-meta">
                                            <span className="os-data" style={{ color: visaoOS === 'maiorValor' ? '#10b981' : '#94a3b8' }}>
                                                {visaoOS === 'urgentes' && <AlertCircle size={12} color="#f59e0b" />}
                                                {visaoOS === 'maiorValor' && <Trophy size={12} color="#10b981" />}
                                                {visaoOS === 'recentes' && <Sparkles size={12} color="#3b82f6" />}
                                                
                                                {visaoOS === 'maiorValor' 
                                                    ? formatarBRL(Number(os.info_secundaria)) 
                                                    : new Date(os.info_secundaria).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="os-status">{os.status_producao.toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card-modulo destaque-lateral">
                        <div className="card-header">
                            <h3>Esteira de Produção</h3>
                        </div>
                        <div className="status-grid">
                            <div className="status-box" style={{ borderBottom: '3px solid #f97316' }}>
                                <Clock size={18} color="#f97316" />
                                <strong>{funilProducao.fila}</strong>
                                <span>Fila</span>
                            </div>
                            <div className="status-box" style={{ borderBottom: '3px solid #3b82f6' }}>
                                <TrendingUp size={18} color="#3b82f6" />
                                <strong>{funilProducao.andamento}</strong>
                                <span>Andamento</span>
                            </div>
                            <div className="status-box" style={{ borderBottom: '3px solid #10b981' }}>
                                <CircleCheck size={18} color="#10b981" />
                                <strong>{funilProducao.concluido}</strong>
                                <span>Pronto</span>
                            </div>
                        </div>
                        <button className="btn-ver-todas" onClick={() => navigate('/ordens-servico')}>
                            <FileText size={14} /> Gerenciar Ordens de Serviço
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}