import React, { useState } from 'react';
import { Clock, PenTool, AlertCircle, CheckCircle, Package, DollarSign, Calendar, Search } from 'lucide-react';
import type { OrdemServico } from './types';
import { formatarBRL } from '../../utils/formatters';
import { ModalDetalhesOS } from './components/ModalDetalhesOS';
import { useKanban } from './hooks/useKanban';

import './styles/kanban.css';
import './styles/modalOS.css';
import './styles/printA4.css';

type TipoDataFiltro = 'criacao' | 'entrega' | 'finalizacao';

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
        atualizarOrdemCompleta, 
        excluirOrdem,
        registrarPagamento,
        excluirPagamento
    } = useKanban();

    const [busca, setBusca] = useState('');
    const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos');
    const [mostrarAtrasados, setMostrarAtrasados] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    
    const [tipoDataFiltro, setTipoDataFiltro] = useState<TipoDataFiltro>('criacao');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    
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

    const ordensFiltradas = ordens.filter(os => {
        const termo = busca.trim().toLowerCase();
        const idLimpo = termo.replace(/^[#nºº\s]+/, '');
        
        const matchBusca = (os.cliente || '').toLowerCase().includes(termo) || 
                           (os.nome_produto || '').toLowerCase().includes(termo) || 
                           os.os_id.toString().includes(idLimpo);

        const matchFin = filtroFinanceiro === 'todos' || os.status_financeiro === filtroFinanceiro;
        const matchAtraso = !mostrarAtrasados || Boolean(os.esta_atrasado);

        let matchData = true;
        if (dataInicio || dataFim) {
            let dataAlvo: string | undefined;
            if (tipoDataFiltro === 'criacao') dataAlvo = os.criado_em;
            else if (tipoDataFiltro === 'entrega') dataAlvo = os.data_entrega;
            else if (tipoDataFiltro === 'finalizacao') {
                dataAlvo = ['pronto', 'entregue'].includes(os.status_producao) ? (os.data_finalizacao || os.atualizado_em) : undefined;
            }

            if (!dataAlvo) matchData = false;
            else {
                const dataISO = dataAlvo.split('T')[0];
                if (dataInicio && dataISO < dataInicio) matchData = false;
                if (dataFim && dataISO > dataFim) matchData = false;
            }
        }

        return matchBusca && matchFin && matchAtraso && matchData;
    });

    const formatarData = (data?: string) => {
        if (!data) return 'N/A';
        const [ano, mes, dia] = data.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const getBadgeFinanceiro = (status: string) => {
        switch(status) {
            case 'pago': return <span className="badge-fin badge-pago"><DollarSign size={11}/> Pago</span>;
            case 'sinal_pago': return <span className="badge-fin badge-sinal"><DollarSign size={11}/> Parcial</span>;
            default: return <span className="badge-fin badge-pendente"><DollarSign size={11}/> Pendente</span>;
        }
    };

    if (loading) return <div className="loading-kanban" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Carregando o quadro de produção...</div>;

    const osAtualizadaSelecionada = osSelecionada ? ordens.find(o => o.os_id === osSelecionada.os_id) || null : null;

    return (
        <div className="kanban-container">
            <div className="kanban-header">
                <div className="header-titles">
                    <h1>ORDENS DE SERVIÇO 📋</h1>
                    <p>Controle de Ordens de Serviço e Fluxo de Fabricação</p>
                </div>

                <div className="kanban-toolbar">
                    <div className="search-box compacta">
                        <Search size={17} color="#f97316" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, produto ou #ID..." 
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    
                    <div className="filtros-box">
                        <div className="filtro-datas-pill">
                            <span className="filtro-label-inline">Período:</span>
                            <select 
                                value={tipoDataFiltro} 
                                onChange={(e) => setTipoDataFiltro(e.target.value as TipoDataFiltro)}
                                className="select-temporal"
                            >
                                <option value="criacao">📅 Criação</option>
                                <option value="entrega">⏳ Prazo</option>
                                <option value="finalizacao">✓ Conclusão</option>
                            </select>

                            <input 
                                type="date" className="input-data-compacto" value={dataInicio} 
                                onChange={(e) => setDataInicio(e.target.value)} title="Data inicial"
                            />
                            <span className="data-separador">a</span>
                            <input 
                                type="date" className="input-data-compacto" value={dataFim} 
                                onChange={(e) => setDataFim(e.target.value)} title="Data final"
                            />
                            {(dataInicio || dataFim) && (
                                <button type="button" className="btn-limpar-datas" onClick={() => { setDataInicio(''); setDataFim(''); }} title="Limpar filtro de data">✕</button>
                            )}
                        </div>

                        <select className="select-filtro-kanban" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Visão Geral (Kanban)</option>
                            <option value="fila">1. Fila de Espera</option>
                            <option value="producao">2. Em Produção</option>
                            <option value="pausado">3. Pausados / Faltam Peças</option>
                            <option value="pronto">4. Prontos</option>
                            <option value="entregue">5. Entregues</option>
                        </select>

                        <select className="select-filtro-kanban" value={filtroFinanceiro} onChange={(e) => setFiltroFinanceiro(e.target.value)}>
                            <option value="todos">Todos os Pagamentos</option>
                            <option value="pendente">Apenas Pendentes</option>
                            <option value="sinal_pago">Pagos Parcialmente</option>
                            <option value="pago">Totalmente Pagos</option>
                        </select>

                        <label className="checkbox-atraso">
                            <input type="checkbox" checked={mostrarAtrasados} onChange={(e) => setMostrarAtrasados(e.target.checked)}/>
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
                            <div key={coluna.id} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, coluna.id)}>
                                <div className="column-header">
                                    {coluna.icone}
                                    <h2>{coluna.titulo}</h2>
                                    <span className="card-count">{ordensDaColuna.length}</span>
                                </div>

                                <div className="column-body">
                                    {ordensDaColuna.length === 0 ? (
                                        <div className="empty-column" style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '12px',
                                            padding: '30px 10px',
                                            opacity: 0.6 
                                        }}>
                                            <img 
                                                src="/logo-denarius-branca.png" 
                                                alt="Logo Denarius" 
                                                style={{ 
                                                    width: '45px', 
                                                    filter: 'grayscale(100%) opacity(60%)' 
                                                }} 
                                            />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
                                                Nenhuma O.S. aqui
                                            </span>
                                        </div>
                                    ) : (
                                        ordensDaColuna.map(os => {
                                            const estaAtrasado = Boolean(os.esta_atrasado);
                                            return (
                                                <div 
                                                    key={os.os_id} className="kanban-card" draggable
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

                                                    {os.observacoes_cliente && (
                                                        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', padding: '6px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b', marginBottom: '10px', fontStyle: 'italic' }}>
                                                            "{os.observacoes_cliente.length > 50 ? os.observacoes_cliente.substring(0, 50) + '...' : os.observacoes_cliente}"
                                                        </div>
                                                    )}

                                                    <div className="card-footer">
                                                        <div className="card-datas">
                                                            <span className="criacao-os" title="Data de emissão/criação">Criado: {formatarData(os.criado_em)}</span>
                                                            <span className={`prazo-os ${estaAtrasado ? 'atrasado' : ''}`}><Calendar size={13}/> {formatarData(os.data_entrega)}</span>
                                                            
                                                            {['pronto', 'entregue'].includes(os.status_producao) && (
                                                                <span className="finalizado-os">✓ Finalizado: {formatarData(os.data_finalizacao || os.atualizado_em)}</span>
                                                            )}

                                                            {os.status_producao === 'entregue' && (
                                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginTop: '2px' }}>
                                                                    📦 Entregue: {formatarData(os.data_entregue || os.atualizado_em)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="valor-os">{formatarBRL(os.preco_venda)}</span>
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

            {osAtualizadaSelecionada && (
                <ModalDetalhesOS 
                    osSelecionada={osAtualizadaSelecionada}
                    tituloColunaAtual={COLUNAS.find(c => c.id === osAtualizadaSelecionada.status_producao)?.titulo || 'Desconhecido'}
                    onClose={() => setOsSelecionada(null)}
                    onSalvarEdicao={atualizarOrdemCompleta}
                    onExcluir={excluirOrdem}
                    onRegistrarPagamento={registrarPagamento}
                    onExcluirPagamento={excluirPagamento}
                />
            )}
        </div>
    );
}