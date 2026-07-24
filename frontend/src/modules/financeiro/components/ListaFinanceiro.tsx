// ARQUIVO: src/modules/financeiro/components/ListaFinanceiro.tsx

import { 
    Edit2, Trash2, Search, Filter, RotateCcw, ArrowUpAZ, ArrowDownZA, 
    Plus, Power, User, Calendar, CheckCircle, AlertCircle, Copy,
    ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useState } from 'react'; 
import type { ItemFinanceiro, ViewMode, SortField, SortDirection, StatusFilter } from '../types';
import { formatarBRL } from '../../../utils/formatters';
import './ListaFinanceiro.css';

interface Props {
    itens: ItemFinanceiro[];
    view: ViewMode;
    filtroDataInicio: string;
    filtroDataFim: string;
    filtroStatus: StatusFilter;
    
    onNovo: () => void;
    onEditar: (item: ItemFinanceiro) => void;
    onExcluir: (id: number) => void;
    onAlternarAtivo: (item: ItemFinanceiro) => void;
    onClonar: (item: ItemFinanceiro) => void;
}

export function ListaFinanceiro({ 
    itens, view, 
    filtroDataInicio, filtroDataFim, filtroStatus,
    onNovo, onEditar, onExcluir, onAlternarAtivo, onClonar 
}: Props) {
    
    const [busca, setBusca] = useState('');
    const [sortField, setSortField] = useState<SortField>('dataVencimento');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');
    
    const [paginaAtual, setPaginaAtual] = useState(1);
    const ITENS_POR_PAGINA = 8;

    const corTema = view === 'despesas' ? '#ef4444' : '#3b82f6';
    
    const formatarData = (d?: string) => {
        if (!d) return '-';
        try {
            const dataIso = d.includes('T') ? d : d + 'T12:00:00';
            const dataObj = new Date(dataIso);
            
            if (isNaN(dataObj.getTime())) return '-';
            return dataObj.toLocaleDateString('pt-BR');
        } catch {
            return '-';
        }
    };

    const getValorOrdenacao = (item: ItemFinanceiro, field: SortField) => {
        if (field === 'status') return item.pago ? 1 : 0;
        if (field === 'valor') return Number(item.valor);
        if (field === 'dataVencimento') return item.dataVencimento || '';
        if (field === 'nome') return item.nome.toLowerCase();
        return '';
    };

    const itensProcessados = itens
        .filter(item => {
            const termo = busca.toLowerCase();
            const matchTexto = item.nome.toLowerCase().includes(termo) || 
                               (item.beneficiario || '').toLowerCase().includes(termo);

            const dataItem = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
            let matchData = true;
            if (filtroDataInicio && dataItem) matchData = matchData && dataItem >= filtroDataInicio;
            if (filtroDataFim && dataItem) matchData = matchData && dataItem <= filtroDataFim;

            let matchStatus = true;
            if (filtroStatus === 'ativos') matchStatus = item.ativo === true;
            if (filtroStatus === 'pendentes') matchStatus = item.pago === false;
            if (filtroStatus === 'pagos') matchStatus = item.pago === true;

            return matchTexto && matchData && matchStatus;
        })
        .sort((a, b) => {
            const valA = getValorOrdenacao(a, sortField);
            const valB = getValorOrdenacao(b, sortField);

            if (valA === valB) {
                return sortDir === 'asc' ? a.id - b.id : b.id - a.id;
            }

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDir === 'asc' ? valA - valB : valB - valA;
            }
            
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });

    // ==========================================
    // MOTOR DE PAGINAÇÃO SEGURO 
    // ==========================================
    
    const totalItens = itensProcessados.length;
    const totalPaginas = Math.ceil(totalItens / ITENS_POR_PAGINA) || 1;
    
    const paginaSegura = Math.min(paginaAtual, totalPaginas);

    const indiceInicial = (paginaSegura - 1) * ITENS_POR_PAGINA;
    const indiceFinal = Math.min(indiceInicial + ITENS_POR_PAGINA, totalItens);
    const itensPaginados = itensProcessados.slice(indiceInicial, indiceFinal);

    const gerarArrayPaginas = () => {
        if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => i + 1);
        if (paginaSegura <= 3) return [1, 2, 3, 4, '...', totalPaginas];
        if (paginaSegura >= totalPaginas - 2) return [1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
        return [1, '...', paginaSegura - 1, paginaSegura, paginaSegura + 1, '...', totalPaginas];
    };

    const totalExibido = itensProcessados.reduce((acc, curr) => acc + Number(curr.valor), 0);
    
    const limparOrdenacao = () => { setBusca(''); setSortField('dataVencimento'); setSortDir('asc'); setPaginaAtual(1); };

    return (
        <div className="lista-container">
            <div className="toolbar-financeiro">
                <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input 
                        placeholder="Buscar..." 
                        value={busca} 
                        onChange={e => { setBusca(e.target.value); setPaginaAtual(1); }} 
                    />
                </div>
                <div className="actions-group">
                    <div className="filter-wrapper">
                        <Filter size={16} color="#64748b" />
                        <select value={sortField} onChange={e => { setSortField(e.target.value as SortField); setPaginaAtual(1); }}>
                            <option value="dataVencimento">Vencimento</option>
                            <option value="nome">Nome</option>
                            <option value="valor">Valor</option>
                            <option value="status">Status Pagto</option>
                        </select>
                    </div>
                    <div className="filter-wrapper">
                        {sortDir === 'asc' ? <ArrowUpAZ size={16} color="#64748b"/> : <ArrowDownZA size={16} color="#64748b"/>}
                        <select value={sortDir} onChange={e => { setSortDir(e.target.value as SortDirection); setPaginaAtual(1); }}>
                            <option value="asc">Crescente</option>
                            <option value="desc">Decrescente</option>
                        </select>
                    </div>
                    <button className="btn-reset" onClick={limparOrdenacao} title="Limpar"><RotateCcw size={18} /></button>
                    <div className="separator-vertical"></div>
                    <button className="btn-add-main" style={{ backgroundColor: corTema }} onClick={onNovo}><Plus size={18} /> Novo</button>
                </div>
            </div>

            <div className="tabela-header">
                <div style={{width: 60, textAlign:'center'}}>Ativo</div>
                <div style={{flex: 2}}>Descrição / Beneficiário</div>
                <div style={{width: 120}}>Vencimento</div>
                <div style={{width: 100, textAlign:'center'}}>Status</div>
                <div style={{width: 120, textAlign:'right', paddingRight: 20}}>Valor</div>
                <div style={{width: 100}}>Ações</div>
            </div>

            <div className="lista-scroll">
                {itensPaginados.length === 0 ? (
                    <div className="empty-state">
                        <Filter size={48} style={{marginBottom: 10, opacity: 0.2}}/>
                        <p>Nenhum lançamento encontrado.</p>
                    </div>
                ) : (
                    itensPaginados.map(item => (
                        <div key={item.id} className={`lista-item-row ${!item.ativo ? 'inativo' : ''}`}>
                            <div className="col-switch">
                                <button className={`btn-switch ${item.ativo ? 'on' : 'off'}`} onClick={() => onAlternarAtivo(item)}><Power size={14} /></button>
                            </div>
                            <div className="col-info">
                                <span className="text-nome">{item.nome}</span>
                                {item.beneficiario && <span className="text-beneficiario"><User size={12}/> {item.beneficiario}</span>}
                            </div>
                            <div className="col-data">
                                <Calendar size={14}/> {formatarData(item.dataVencimento)}
                            </div>
                            <div className="col-status">
                                {item.pago ? <span className="badge badge-pago"><CheckCircle size={12}/> Pago</span> : <span className="badge badge-pendente"><AlertCircle size={12}/> Pendente</span>}
                            </div>
                            <div className="col-valor" style={{ color: item.ativo ? corTema : '#94a3b8' }}>{formatarBRL(item.valor)}</div>
                            <div className="col-acoes">
                                <button className="btn-icon-sm btn-copy" onClick={() => onClonar(item)} title="Duplicar"><Copy size={16} /></button>
                                <button className="btn-icon-sm btn-edit" onClick={() => onEditar(item)}><Edit2 size={16} /></button>
                                <button className="btn-icon-sm btn-del" onClick={() => onExcluir(item.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="lista-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Mostrando <strong style={{color: '#1e293b'}}>{totalItens === 0 ? 0 : indiceInicial + 1}</strong> a <strong style={{color: '#1e293b'}}>{indiceFinal}</strong> de <strong style={{color: '#1e293b'}}>{totalItens}</strong> registros
                </div>

                {/* MUDANÇA: Exibe os botões se houver ao menos 1 página (> 0) */}
                {totalPaginas > 0 && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                            disabled={paginaSegura === 1}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px',
                                backgroundColor: 'transparent', border: '1px solid #334155', color: paginaSegura === 1 ? '#334155' : '#94a3b8', 
                                cursor: paginaSegura === 1 ? 'not-allowed' : 'pointer'
                            }}
                        ><ChevronLeft size={16}/></button>

                        {gerarArrayPaginas().map((p, index) => (
                            <button
                                key={index}
                                onClick={() => typeof p === 'number' && setPaginaAtual(p)}
                                disabled={p === '...'}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', fontWeight: 'bold',
                                    backgroundColor: p === paginaSegura ? corTema : 'transparent',
                                    color: p === paginaSegura ? '#fff' : (p === '...' ? '#64748b' : '#94a3b8'),
                                    border: p === paginaSegura ? `1px solid ${corTema}` : (p === '...' ? 'none' : '1px solid #334155'),
                                    cursor: p === '...' ? 'default' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaSegura === totalPaginas}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px',
                                backgroundColor: 'transparent', border: '1px solid #334155', color: paginaSegura === totalPaginas ? '#334155' : '#94a3b8', 
                                cursor: paginaSegura === totalPaginas ? 'not-allowed' : 'pointer'
                            }}
                        ><ChevronRight size={16}/></button>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="footer-label">Total Filtrado:</span>
                    <span className="footer-valor" style={{ color: corTema }}>{formatarBRL(totalExibido)}</span>
                </div>
            </div>
        </div>
    );
}