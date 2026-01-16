import { Edit2, Trash2, Search, Filter, RotateCcw, ArrowUpAZ, ArrowDownZA, Plus } from 'lucide-react';
import { useState } from 'react';
import type { ItemFinanceiro, ViewMode, SortField, SortDirection } from '../types';
import './ListaFinanceiro.css';

interface Props {
    itens: ItemFinanceiro[];
    view: ViewMode;
    onNovo: () => void;
    onEditar: (item: ItemFinanceiro) => void;
    onExcluir: (id: number) => void;
}

export function ListaFinanceiro({ itens, view, onNovo, onEditar, onExcluir }: Props) {
    const [busca, setBusca] = useState('');
    const [sortField, setSortField] = useState<SortField>('nome');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    const corTema = view === 'despesas' ? '#ef4444' : '#3b82f6';
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const itensProcessados = itens
        .filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()))
        .sort((a, b) => {
            if (sortField === 'valor') {
                return (Number(a.valor) - Number(b.valor)) * (sortDir === 'asc' ? 1 : -1);
            }
            return a.nome.localeCompare(b.nome) * (sortDir === 'asc' ? 1 : -1);
        });

    const totalExibido = itensProcessados.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const limparFiltros = () => { setBusca(''); setSortField('nome'); setSortDir('asc'); };

    return (
        <div className="lista-container">
            <div className="toolbar-financeiro">
                <div className="search-box">
                    <Search size={18} color="#94a3b8" />
                    <input placeholder={`Buscar em ${view}...`} value={busca} onChange={e => setBusca(e.target.value)} />
                </div>
                <div className="actions-group">
                    <div className="filter-wrapper">
                        <Filter size={16} color="#64748b" />
                        <select value={sortField} onChange={e => setSortField(e.target.value as SortField)}>
                            <option value="nome">Nome</option>
                            <option value="valor">Valor</option>
                        </select>
                    </div>
                    <div className="filter-wrapper">
                        {sortDir === 'asc' ? <ArrowUpAZ size={16} color="#64748b"/> : <ArrowDownZA size={16} color="#64748b"/>}
                        <select value={sortDir} onChange={e => setSortDir(e.target.value as SortDirection)}>
                            <option value="asc">Crescente</option>
                            <option value="desc">Decrescente</option>
                        </select>
                    </div>
                    <button className="btn-reset" onClick={limparFiltros}><RotateCcw size={18} /></button>
                    <div className="separator-vertical"></div>
                    <button className="btn-add-main" style={{ backgroundColor: corTema }} onClick={onNovo}>
                        <Plus size={18} /> Novo
                    </button>
                </div>
            </div>
            {/* Lista Scroll e Footer iguais, só mantendo limpo */}
            <div className="lista-scroll">
                {itensProcessados.length === 0 ? (
                    <div className="empty-state">Nenhum item encontrado.</div>
                ) : (
                    itensProcessados.map(item => (
                        <div key={item.id} className="lista-item">
                            <div className="item-left">
                                <span className="item-nome">{item.nome}</span>
                                <span className="item-sub">ID: #{item.id}</span>
                            </div>
                            <div className="item-right">
                                <span className="item-valor" style={{ color: corTema }}>{BRL(Number(item.valor))}</span>
                                <div className="acoes-item">
                                    <button className="btn-icon-sm btn-edit" onClick={() => onEditar(item)}><Edit2 size={16} /></button>
                                    <button className="btn-icon-sm btn-del" onClick={() => onExcluir(item.id)}><Trash2 size={16} /></button>
                                </div>
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