import { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import type { Orcamento } from '../types';
import { formatarBRL } from '../../../utils/formatters';
import './ListaOrcamentos.css';

interface Props {
    lista: Orcamento[];
    idEditando: number | null;
    onEditar: (orc: Orcamento) => void;
    onExcluir: (id: number) => void;
    onVerDemonstrativo: (orc: Orcamento) => void;
}

type OrcamentoComData = Orcamento & {
    data_criacao?: string;
    criado_em?: string;
    dataCriacao?: string;
    created_at?: string;
    data?: string;
};

const normalizarDataParaComparacao = (orc?: OrcamentoComData): string => {
    if (!orc) return '';
    const val = orc.data_criacao || orc.criado_em || orc.dataCriacao || orc.created_at || orc.data || '';
    if (typeof val !== 'string' || !val) return '';
    
    if (val.charAt(2) === '/') {
        const partes = val.split('/');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return val.slice(0, 10);
};

export function ListaOrcamentos({ lista, idEditando, onEditar, onExcluir, onVerDemonstrativo }: Props) {
    // --- ESTADOS DE FILTRO POR PERÍODO ---
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');

    // --- ESTADO DO MODAL DE EXCLUSÃO ---
    const [orcamentoParaExcluir, setOrcamentoParaExcluir] = useState<Orcamento | null>(null);

    // --- ESTADOS DA PAGINAÇÃO ---
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const ITENS_POR_PAGINA = 10;

    // --- FILTRAGEM DE REGISTROS POR DATA ---
    const listaFiltrada = useMemo(() => {
        const listaSegura = Array.isArray(lista) ? lista : [];
        return listaSegura.filter(orc => {
            const dataNormalizada = normalizarDataParaComparacao(orc);
            const matchInicio = !dataInicio || (dataNormalizada && dataNormalizada >= dataInicio);
            const matchFim = !dataFim || (dataNormalizada && dataNormalizada <= dataFim);
            return matchInicio && matchFim;
        });
    }, [lista, dataInicio, dataFim]);

    // --- CÁLCULOS MATEMÁTICOS DA PAGINAÇÃO ---
    const totalRegistros = listaFiltrada.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / ITENS_POR_PAGINA));
    const paginaEfetiva = Math.min(paginaAtual, totalPaginas);

    const indiceInicial = (paginaEfetiva - 1) * ITENS_POR_PAGINA;
    const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
    const itensPaginados = listaFiltrada.slice(indiceInicial, indiceFinal);

    // --- CONTROLES DE NAVEGAÇÃO ---
    const irParaPaginaAnterior = () => {
        if (paginaEfetiva > 1) setPaginaAtual(paginaEfetiva - 1);
    };

    const irParaProximaPagina = () => {
        if (paginaEfetiva < totalPaginas) setPaginaAtual(paginaEfetiva + 1);
    };

    const handleConfirmarExclusao = () => {
        if (orcamentoParaExcluir?.id) {
            onExcluir(orcamentoParaExcluir.id);
            setOrcamentoParaExcluir(null);
        }
    };

    const isPeriodoAtivo = Boolean(dataInicio || dataFim);

    return (
        <div>
            {/* --- BARRA DE FILTRO COMPACTA DE DATAS --- */}
            <div className="toolbar-lista-orcamentos">
                <div className="date-range-clean">
                    <div className="date-input-group">
                        <span className="date-label">DE</span>
                        <input
                            type="date"
                            className="input-date-clean"
                            value={dataInicio}
                            onChange={e => { setDataInicio(e.target.value); setPaginaAtual(1); }}
                            title="Data inicial"
                        />
                    </div>

                    <span className="date-divisor">|</span>

                    <div className="date-input-group">
                        <span className="date-label">ATÉ</span>
                        <input
                            type="date"
                            className="input-date-clean"
                            value={dataFim}
                            onChange={e => { setDataFim(e.target.value); setPaginaAtual(1); }}
                            title="Data final"
                        />
                    </div>

                    {isPeriodoAtivo && (
                        <button
                            type="button"
                            className="btn-clear-date"
                            onClick={() => { setDataInicio(''); setDataFim(''); setPaginaAtual(1); }}
                            title="Limpar período"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- TABELA ADMINISTRATIVA EM FUNDO BRANCO --- */}
            <div className="card-lista">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente / Produto</th>
                            <th>Custo Mat.</th>
                            <th>Lucro</th>
                            <th>Preço Final</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itensPaginados.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    Nenhum orçamento encontrado {isPeriodoAtivo ? 'para o período selecionado.' : '.'}
                                </td>
                            </tr>
                        ) : (
                            itensPaginados.map(orc => (
                                <tr key={orc.id} style={{ backgroundColor: idEditando === orc.id ? '#fff7ed' : 'transparent' }}>
                                    <td>
                                        <div style={{ fontWeight: 'bold', color: '#334155' }}>{orc.cliente || 'Sem cliente'}</div>
                                        <div style={{ fontSize: '0.88rem', color: '#64748b' }}>{orc.nome_produto}</div>
                                    </td>
                                    
                                    <td>{formatarBRL(orc.custo_materiais)}</td>
                                    
                                    <td>
                                        <span className="badge-lucro">
                                            {Number(orc.lucro_desejado).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                        </span>
                                    </td>
                                    
                                    <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatarBRL(orc.preco_venda)}</td>
                                    
                                    <td>
                                        <div className="acoes-td">
                                            <button className="btn-icon btn-ver" title="Ver Demonstrativo" onClick={() => onVerDemonstrativo(orc)}>
                                                <Eye size={16} />
                                            </button>
                                            <button className="btn-icon" style={{ backgroundColor: '#f59e0b' }} title="Editar" onClick={() => onEditar(orc)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon btn-del" title="Excluir" onClick={() => setOrcamentoParaExcluir(orc)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* --- CONTROLES DA PAGINAÇÃO --- */}
                {totalRegistros > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                        <div>
                            Mostrando <strong>{indiceInicial + 1}</strong> a <strong>{Math.min(indiceFinal, totalRegistros)}</strong> de <strong>{totalRegistros}</strong> registros
                        </div>

                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                onClick={irParaPaginaAnterior} 
                                disabled={paginaEfetiva === 1}
                                style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: paginaEfetiva === 1 ? '#f1f5f9' : '#fff', cursor: paginaEfetiva === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => setPaginaAtual(num)}
                                    style={{
                                        padding: '5px 12px',
                                        border: '1px solid',
                                        borderColor: paginaEfetiva === num ? '#ef4444' : '#cbd5e1',
                                        backgroundColor: paginaEfetiva === num ? '#ef4444' : '#fff',
                                        color: paginaEfetiva === num ? '#fff' : '#334155',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {num}
                                </button>
                            ))}

                            <button 
                                onClick={irParaProximaPagina} 
                                disabled={paginaEfetiva === totalPaginas}
                                style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: paginaEfetiva === totalPaginas ? '#f1f5f9' : '#fff', cursor: paginaEfetiva === totalPaginas ? 'not-allowed' : 'pointer' }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (PALETA DARK #0F172A) --- */}
            {orcamentoParaExcluir && (
                <div className="modal-delete-overlay" onClick={() => setOrcamentoParaExcluir(null)}>
                    <div className="modal-delete-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-delete-header">
                            <div className="icon-delete-warning">
                                <AlertTriangle size={22} />
                            </div>
                            <h3 className="modal-delete-title">Excluir Orçamento?</h3>
                        </div>

                        <p className="modal-delete-body">
                            Tem certeza que deseja excluir o orçamento de{' '}
                            <strong style={{ color: '#f8fafc' }}>{orcamentoParaExcluir.cliente || 'Sem cliente'}</strong>{' '}
                            ({orcamentoParaExcluir.nome_produto})? Esta ação não poderá ser desfeita.
                        </p>

                        <div className="modal-delete-footer">
                            <button
                                type="button"
                                className="btn-cancelar-delete"
                                onClick={() => setOrcamentoParaExcluir(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-confirmar-delete"
                                onClick={handleConfirmarExclusao}
                            >
                                <Trash2 size={16} />
                                Sim, excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}