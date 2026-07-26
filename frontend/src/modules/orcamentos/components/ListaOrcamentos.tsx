import { useState } from 'react';
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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

export function ListaOrcamentos({ lista, idEditando, onEditar, onExcluir, onVerDemonstrativo }: Props) {
    // --- ESTADOS DA PAGINAÇÃO ---
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const ITENS_POR_PAGINA = 10;

    // --- CÁLCULOS MATEMÁTICOS (Estado Derivado) ---
    const totalRegistros = lista.length;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / ITENS_POR_PAGINA));

    // LÓGICA SÊNIOR: Matemática pura substituindo o useEffect.
    // Impede que a tela tente ler uma página que não existe mais após uma exclusão.
    const paginaEfetiva = Math.min(paginaAtual, totalPaginas);

    // O método 'slice' fatia o array original usando a página validada matematicamente
    const indiceInicial = (paginaEfetiva - 1) * ITENS_POR_PAGINA;
    const indiceFinal = indiceInicial + ITENS_POR_PAGINA;
    const itensPaginados = lista.slice(indiceInicial, indiceFinal);

    // --- CONTROLES DE NAVEGAÇÃO ---
    const irParaPaginaAnterior = () => {
        if (paginaEfetiva > 1) setPaginaAtual(paginaEfetiva - 1);
    };

    const irParaProximaPagina = () => {
        if (paginaEfetiva < totalPaginas) setPaginaAtual(paginaEfetiva + 1);
    };

    const irParaPagina = (pagina: number) => {
        setPaginaAtual(pagina);
    };

    return (
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
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Nenhum orçamento.</td></tr>
                    ) : (
                        itensPaginados.map(orc => (
                            <tr key={orc.id} style={{ backgroundColor: idEditando === orc.id ? '#fff7ed' : 'transparent' }}>
                                <td>
                                    <div style={{ fontWeight: 'bold', color: '#334155' }}>{orc.cliente || 'Sem cliente'}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{orc.nome_produto}</div>
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
                                        <button className="btn-icon btn-del" title="Excluir" onClick={() => orc.id && onExcluir(orc.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* --- CONTROLES VISUAIS DA PAGINAÇÃO --- */}
            {totalRegistros > 0 && (
                <div className="paginacao-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
                    
                    <div className="paginacao-info">
                        Mostrando <strong>{indiceInicial + 1}</strong> a <strong>{Math.min(indiceFinal, totalRegistros)}</strong> de <strong>{totalRegistros}</strong> registros
                    </div>

                    <div className="paginacao-botoes" style={{ display: 'flex', gap: '5px' }}>
                        <button 
                            onClick={irParaPaginaAnterior} 
                            disabled={paginaEfetiva === 1}
                            style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: paginaEfetiva === 1 ? '#f1f5f9' : '#fff', cursor: paginaEfetiva === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numeroPagina => (
                            <button
                                key={numeroPagina}
                                onClick={() => irParaPagina(numeroPagina)}
                                style={{
                                    padding: '5px 12px',
                                    border: '1px solid',
                                    borderColor: paginaEfetiva === numeroPagina ? '#ef4444' : '#cbd5e1',
                                    backgroundColor: paginaEfetiva === numeroPagina ? '#ef4444' : '#fff',
                                    color: paginaEfetiva === numeroPagina ? '#fff' : '#334155',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {numeroPagina}
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
    );
}