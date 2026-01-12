import { Eye, Edit2, Trash2 } from 'lucide-react';
import type { Orcamento } from '../types';
import './ListaOrcamentos.css';

interface Props {
    lista: Orcamento[];
    idEditando: number | null;
    onEditar: (orc: Orcamento) => void;
    onExcluir: (id: number) => void;
    onVerDemonstrativo: (orc: Orcamento) => void;
}

export function ListaOrcamentos({ lista, idEditando, onEditar, onExcluir, onVerDemonstrativo }: Props) {
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
                    {lista.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Nenhum orçamento.</td></tr>
                    ) : (
                        lista.map(orc => (
                            <tr key={orc.id} style={{ backgroundColor: idEditando === orc.id ? '#fff7ed' : 'transparent' }}>
                                <td>
                                    <div style={{ fontWeight: 'bold', color: '#334155' }}>{orc.cliente || 'Sem cliente'}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{orc.nome_produto}</div>
                                </td>
                                <td>{BRL(Number(orc.custo_materiais))}</td>
                                <td><span className="badge-lucro">{orc.lucro_desejado}%</span></td>
                                <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{BRL(Number(orc.preco_venda))}</td>
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
        </div>
    );
}