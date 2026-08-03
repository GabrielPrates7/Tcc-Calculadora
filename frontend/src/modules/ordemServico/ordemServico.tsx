import React, { useState } from 'react';
import { Clock, PenTool, AlertCircle, CheckCircle, Package, DollarSign, Calendar, Search, Filter } from 'lucide-react';
import type { OrdemServico } from './types';
import { formatarBRL } from '../../utils/formatters';
import { ModalDetalhesOS } from './components/ModalDetalhesOS';
import { useKanban } from './hooks/useKanban';
import './ordemServico.css';

const COLUNAS = [
    { id: 'fila', titulo: 'Fila de Espera', icone: <Clock size={18} color="#f97316" /> },
    { id: 'producao', titulo: 'Em Produção', icone: <PenTool size={18} color="#3b82f6" /> },
    { id: 'pausado', titulo: 'Pausado / Faltam Peças', icone: <AlertCircle size={18} color="#ef4444" /> },
    { id: 'pronto', titulo: 'Pronto', icone: <CheckCircle size={18} color="#16a34a" /> },
    { id: 'entregue', titulo: 'Entregue', icone: <Package size={18} color="#64748b" /> }
];

export function OrdemServicoKanban() {
    const { 
        ordens, 
        loading, 
        moverOrdem, 
        atualizarPagamento, 
        atualizarOrdemCompleta, 
        excluirOrdem 
    } = useKanban();

    const [busca, setBusca] = useState('');
    const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos');
    const [mostrarAtrasados, setMostrarAtrasados] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [osSelecionada, setOsSelecionada] = useState<OrdemServico | null>(null);

    const handleDragStart = (e: React.DragEvent, osId: number) => {
        e.dataTransfer.setData('osId', osId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, novaColuna: string) => {
        e.preventDefault();
        const osId = parseInt(e.dataTransfer.getData('osId'));
        moverOrdem(osId, novaColuna);
    };

    const handleAtualizarFinanceiro = (novoStatus: OrdemServico['status_financeiro']) => {
        if (osSelecionada) {
            atualizarPagamento(osSelecionada.os_id, novoStatus);
            setOsSelecionada({ ...osSelecionada, status_financeiro: novoStatus });
        }
    };

    const ordensFiltradas = ordens.filter(os => {
        const termo = busca.toLowerCase();
        const matchBusca = (os.cliente || '').toLowerCase().includes(termo) || 
                           (os.nome_produto || '').toLowerCase().includes(termo) || 
                           os.os_id.toString().includes(termo);

        const matchFin = filtroFinanceiro === 'todos' || os.status_financeiro === filtroFinanceiro;

        let matchAtraso = true;
        if (mostrarAtrasados) {
            const dataEntrega = os.data_entrega ? new Date(os.data_entrega) : null;
            matchAtraso = dataEntrega ? dataEntrega < new Date() && os.status_producao !== 'entregue' : false;
        }

        return matchBusca && matchFin && matchAtraso;
    });

    const formatarData = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : 'Sem prazo';

    const getBadgeFinanceiro = (status: string) => {
        switch(status) {
            case 'pago': 
                return <span className="badge-fin badge-pago"><DollarSign size={11}/> Pago</span>;
            case 'sinal_pago': 
                return <span className="badge-fin badge-sinal"><DollarSign size={11}/> 50% Pago</span>;
            default: 
                return <span className="badge-fin badge-pendente"><DollarSign size={11}/> Pendente</span>;
        }
    };

    if (loading) return <div className="loading-kanban" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Carregando o quadro de produção...</div>;

    return (
        <div className="kanban-container">
            <div className="kanban-header">
                <div className="header-titles">
                    <h1>ORDENS DE SERVIÇO EM PRODUÇÃO 📋</h1>
                    <p>Controle de Ordens de Serviço e Fluxo de Fabrico</p>
                </div>

                <div className="kanban-toolbar">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, produto ou #ID..." 
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    
                    <div className="filtros-box">
                        <Filter size={18} color="#94a3b8" />
                        
                        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Visão Geral (Kanban)</option>
                            <option value="fila">1. Fila de Espera</option>
                            <option value="producao">2. Em Produção</option>
                            <option value="pausado">3. Pausados / Faltam Peças</option>
                            <option value="pronto">4. Prontos</option>
                            <option value="entregue">5. Entregues</option>
                        </select>

                        <select value={filtroFinanceiro} onChange={(e) => setFiltroFinanceiro(e.target.value)}>
                            <option value="todos">Todos os Pagamentos</option>
                            <option value="pendente">Apenas Pendentes</option>
                            <option value="sinal_pago">Sinal Pago (50%)</option>
                            <option value="pago">Totalmente Pago</option>
                        </select>

                        <label className="checkbox-atraso">
                            <input 
                                type="checkbox" 
                                checked={mostrarAtrasados}
                                onChange={(e) => setMostrarAtrasados(e.target.checked)}
                            />
                            <span>⚠️ Apenas Atrasados</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="kanban-board">
                {COLUNAS
                    .filter(coluna => filtroStatus === 'todos' || coluna.id === filtroStatus)
                    .map(coluna => {
                        const ordensDaColuna = ordensFiltradas.filter(os => os.status_producao === coluna.id);
                        return (
                            <div 
                                key={coluna.id} 
                                className="kanban-column"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, coluna.id)}
                            >
                                <div className="column-header">
                                    {coluna.icone}
                                    <h2>{coluna.titulo}</h2>
                                    <span className="card-count">{ordensDaColuna.length}</span>
                                </div>

                                <div className="column-body">
                                    {ordensDaColuna.length === 0 ? (
                                        <div className="empty-column">Nenhuma O.S. aqui</div>
                                    ) : (
                                        ordensDaColuna.map(os => {
                                            const estaAtrasado = Boolean(
                                                os.data_entrega && 
                                                new Date(os.data_entrega) < new Date() && 
                                                os.status_producao !== 'entregue'
                                            );

                                            return (
                                                <div 
                                                    key={os.os_id} 
                                                    className="kanban-card"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, os.os_id)}
                                                    onDoubleClick={() => setOsSelecionada(os)} 
                                                    title="Dê dois cliques para abrir os detalhes"
                                                >
                                                    <div className="card-top">
                                                        <span className="os-numero">O.S. #{os.os_id}</span>
                                                        {getBadgeFinanceiro(os.status_financeiro)}
                                                    </div>
                                                    
                                                    <div className="card-main">
                                                        <h3 className="cliente-nome">{os.cliente || 'Consumidor Final'}</h3>
                                                        <p className="produto-nome">{os.nome_produto}</p>
                                                    </div>
                                                    
                                                    <div className="card-footer">
                                                        <span className="valor-os">{formatarBRL(os.preco_venda)}</span>
                                                        <span className={`prazo-os ${estaAtrasado ? 'atrasado' : ''}`}>
                                                            <Calendar size={13}/> {formatarData(os.data_entrega)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                })}
            </div>

            {osSelecionada && (
                <ModalDetalhesOS 
                    osSelecionada={osSelecionada}
                    tituloColunaAtual={COLUNAS.find(c => c.id === osSelecionada.status_producao)?.titulo || 'Desconhecido'}
                    onClose={() => setOsSelecionada(null)}
                    onAtualizarFinanceiro={handleAtualizarFinanceiro}
                    onSalvarEdicao={atualizarOrdemCompleta}
                    onExcluir={excluirOrdem}
                />
            )}
        </div>
    );
}