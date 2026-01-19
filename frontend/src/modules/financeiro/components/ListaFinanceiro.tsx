import { Edit2, Trash2, Search, Filter, RotateCcw, ArrowUpAZ, ArrowDownZA, Plus, Power, User, Calendar, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import type { ItemFinanceiro, ViewMode, SortField, SortDirection, StatusFilter } from '../types';
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
    const [sortField, setSortField] = useState<SortField>('nome');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    const corTema = view === 'despesas' ? '#ef4444' : '#3b82f6';
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // CORREÇÃO DATA: Blindada contra erros
    const formatarData = (d?: string) => {
        if (!d) return '-';
        try {
            // Se já tem T (ISO), usa como está. Se não, adiciona meio-dia para evitar fuso.
            const dataIso = d.includes('T') ? d : d + 'T12:00:00';
            const dataObj = new Date(dataIso);
            
            if (isNaN(dataObj.getTime())) return '-';
            return dataObj.toLocaleDateString('pt-BR');
        } catch {
            return '-';
        }
    };

    // CORREÇÃO ORDENAÇÃO: Tipagem segura
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

            // Filtro de Data
            const dataItem = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
            let matchData = true;
            if (filtroDataInicio && dataItem) matchData = matchData && dataItem >= filtroDataInicio;
            if (filtroDataFim && dataItem) matchData = matchData && dataItem <= filtroDataFim;

            // Filtro de Status
            let matchStatus = true;
            if (filtroStatus === 'ativos') matchStatus = item.ativo === true;
            if (filtroStatus === 'pendentes') matchStatus = item.pago === false;
            if (filtroStatus === 'pagos') matchStatus = item.pago === true;

            return matchTexto && matchData && matchStatus;
        })
        .sort((a, b) => {
            const valA = getValorOrdenacao(a, sortField);
            const valB = getValorOrdenacao(b, sortField);

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDir === 'asc' ? valA - valB : valB - valA;
            }
            
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });

    const totalExibido = itensProcessados.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const limparOrdenacao = () => { setBusca(''); setSortField('nome'); setSortDir('asc'); };

    return (
        <div className="lista-container">
            <div className="toolbar-financeiro">
                <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
                </div>
                <div className="actions-group">
                    <div className="filter-wrapper">
                        <Filter size={16} color="#64748b" />
                        <select value={sortField} onChange={e => setSortField(e.target.value as SortField)}>
                            <option value="nome">Nome</option>
                            <option value="valor">Valor</option>
                            <option value="dataVencimento">Vencimento</option>
                            <option value="status">Status Pagto</option>
                        </select>
                    </div>
                    <div className="filter-wrapper">
                        {sortDir === 'asc' ? <ArrowUpAZ size={16} color="#64748b"/> : <ArrowDownZA size={16} color="#64748b"/>}
                        <select value={sortDir} onChange={e => setSortDir(e.target.value as SortDirection)}>
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
                {itensProcessados.length === 0 ? (
                    <div className="empty-state">
                        <Filter size={48} style={{marginBottom: 10, opacity: 0.2}}/>
                        <p>Nenhum lançamento encontrado.</p>
                    </div>
                ) : (
                    itensProcessados.map(item => (
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
                            <div className="col-valor" style={{ color: item.ativo ? corTema : '#94a3b8' }}>{BRL(Number(item.valor))}</div>
                            <div className="col-acoes">
                                <button className="btn-icon-sm btn-copy" onClick={() => onClonar(item)} title="Duplicar"><Copy size={16} /></button>
                                <button className="btn-icon-sm btn-edit" onClick={() => onEditar(item)}><Edit2 size={16} /></button>
                                <button className="btn-icon-sm btn-del" onClick={() => onExcluir(item.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="lista-footer">
                <span className="footer-label">Total Listado</span>
                <span className="footer-valor" style={{ color: corTema }}>{BRL(totalExibido)}</span>
            </div>
        </div>
    );
}