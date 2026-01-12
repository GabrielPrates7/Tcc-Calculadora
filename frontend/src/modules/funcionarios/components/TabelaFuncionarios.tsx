import { Edit2, Trash2, CheckCircle, PauseCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Funcionario } from '../types';
import './TabelaFuncionarios.css';

interface Props {
    funcionarios: Funcionario[];
    loading: boolean;
    onEditar: (f: Funcionario) => void;
    onExcluir: (id: number) => void;
}

export function TabelaFuncionarios({ funcionarios, loading, onEditar, onExcluir }: Props) {
    const [idExpandido, setIdExpandido] = useState<number | null>(null);

    const BRL = (v: string | number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatarData = (data: string) => data ? new Date(data).toLocaleDateString('pt-BR') : '-';
    const getIniciais = (nome: string) => nome.substring(0, 2).toUpperCase();

    if (loading) return <div style={{padding: 20, color: 'white'}}>Carregando equipe...</div>;

    return (
        <div className="card-lista">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>Status</th>
                        <th>Colaborador</th>
                        <th>Setor</th>
                        <th>Admissão</th>
                        <th>Custo Mensal</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {funcionarios.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Nenhum registro.</td></tr>
                    ) : (
                        funcionarios.map(func => (
                            <>
                                <tr key={func.id} style={{ opacity: func.ativo ? 1 : 0.6 }}>
                                    <td style={{ textAlign: 'center' }}>
                                        {func.ativo
                                            ? <CheckCircle size={20} color="#16a34a" />
                                            : <PauseCircle size={20} color="#ef4444" />
                                        }
                                    </td>
                                    <td>
                                        <div className="colaborador-info">
                                            <div className="avatar-circle" style={{ backgroundColor: func.ativo ? '#3b82f6' : '#94a3b8' }}>
                                                {getIniciais(func.nome)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{func.nome}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{func.funcao}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-setor ${func.setor}`}>
                                            {func.setor === 'producao' ? 'Produção' : 'Admin'}
                                        </span>
                                    </td>
                                    <td>{formatarData(func.data_admissao)}</td>
                                    <td><span className="custo-total-highlight">{BRL(func.custo_total_mensal)}</span></td>
                                    <td>
                                        <div className="acoes" style={{ justifyContent: 'center' }}>
                                            <button className="btn-icon" onClick={() => setIdExpandido(idExpandido === func.id ? null : func.id)}>
                                                {idExpandido === func.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            <button className="btn-icon btn-edit" onClick={() => onEditar(func)}><Edit2 size={16} /></button>
                                            <button className="btn-icon btn-delete" onClick={() => onExcluir(func.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                                {idExpandido === func.id && (
                                    <tr className="row-detalhes">
                                        <td colSpan={6}>
                                            <div className="detalhes-grid">
                                                <div className="detalhe-item"><span>Salário Base</span><span>{BRL(func.salario_base)}</span></div>
                                                <div className="detalhe-item"><span>EPI/Vale</span><span>{BRL(func.epi)}</span></div>
                                                <div className="detalhe-item"><span>13º Salário</span><span>{BRL(func.decimo_terceiro)}</span></div>
                                                <div className="detalhe-item"><span>Férias + 1/3</span><span>{BRL(Number(func.ferias) + Number(func.um_terco_ferias))}</span></div>
                                                <div className="detalhe-item"><span>Encargos</span><span>{BRL(func.inss)}</span></div>
                                                <div className="detalhe-item"><span>Multa FGTS</span><span>{BRL(func.multa_fgts)}</span></div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}