import { Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Funcionario } from '../types';
import './TabelaFuncionarios.css'; 

interface Props {
    funcionarios: Funcionario[];
    loading: boolean;
    paginaAtual: number;
    totalPaginas: number;
    totalRegistros: number; // NOVO: Necessário para o cálculo textual
    onMudarPagina: (pagina: number) => void;
    onEditar: (f: Funcionario) => void;
    onExcluir: (id: number) => void;
    onVerDetalhes: (f: Funcionario) => void;
}

export function TabelaFuncionarios({ 
    funcionarios, 
    loading, 
    paginaAtual, 
    totalPaginas,
    totalRegistros, 
    onMudarPagina, 
    onEditar, 
    onExcluir, 
    onVerDetalhes 
}: Props) {

    const formatarMoeda = (valor: number | string) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const limite = 8;
    // Lógica para o texto exato "Mostrando X a Y de Z"
    const inicio = totalRegistros === 0 ? 0 : ((paginaAtual - 1) * limite) + 1;
    const fim = Math.min(paginaAtual * limite, totalRegistros);

    const gerarPaginas = () => {
        const paginas = [];
        if (totalPaginas <= 5) {
            for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
        } else {
            if (paginaAtual <= 3) {
                paginas.push(1, 2, 3, 4, '...', totalPaginas);
            } else if (paginaAtual >= totalPaginas - 2) {
                paginas.push(1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
            } else {
                paginas.push(1, '...', paginaAtual - 1, paginaAtual, paginaAtual + 1, '...', totalPaginas);
            }
        }
        return paginas;
    };

    return (
        <div className="tabela-wrapper">
            <div className="tabela-container">
                <table>
                    <thead>
                        <tr>
                            <th>NOME</th>
                            <th>FUNÇÃO</th>
                            <th>SETOR</th>
                            <th>SALÁRIO BASE</th>
                            <th>CUSTO MENSAL</th>
                            <th>STATUS</th>
                            <th>ADMISSÃO</th>
                            <th style={{ textAlign: 'center' }}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: loading ? 'none' : 'auto' }}>
                        {!funcionarios || funcionarios.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                                    {loading ? 'Buscando dados...' : 'Nenhum colaborador encontrado na filtragem atual.'}
                                </td>
                            </tr>
                        ) : (
                            funcionarios.map(f => (
                                <tr key={f.id} className={String(f.ativo) === 'false' ? 'tr-inativo' : ''}>
                                    <td className="col-nome" title={f.nome}>
                                        <strong>{f.nome}</strong>
                                    </td>
                                    <td>{f.funcao}</td>
                                    <td>
                                        <span className={`badge-setor ${f.setor}`}>
                                            {f.setor === 'producao' ? 'PRODUÇÃO' : 'ADMIN'}
                                        </span>
                                    </td>
                                    <td>{formatarMoeda(f.salario_base || 0)}</td>
                                    <td><strong>{formatarMoeda(f.custo_total_mensal || 0)}</strong></td>
                                    <td>
                                        <span className={`badge-status ${String(f.ativo) === 'true' ? 'ativo' : 'inativo'}`}>
                                            {String(f.ativo) === 'true' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>{f.data_admissao ? new Date(f.data_admissao).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td>
                                        <div className="acoes-grupo">
                                            <button className="btn-icon info" onClick={() => onVerDetalhes(f)} title="Ver Detalhes">
                                                <Eye size={18} />
                                            </button>
                                            <button className="btn-icon edit" onClick={() => onEditar(f)} title="Editar">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="btn-icon delete" onClick={() => onExcluir(f.id!)} title="Excluir">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Rodapé redesenhado conforme a imagem */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Mostrando <strong>{inicio}</strong> a <strong>{fim}</strong> de <strong>{totalRegistros}</strong> registros
                </span>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                        onClick={() => onMudarPagina(paginaAtual - 1)} 
                        disabled={paginaAtual === 1 || loading}
                        style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: (paginaAtual === 1 || loading) ? 'default' : 'pointer', color: '#64748b' }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {gerarPaginas().map((item, index) => (
                        <button 
                            key={index}
                            onClick={() => typeof item === 'number' && onMudarPagina(item)}
                            disabled={item === '...' || loading}
                            style={{
                                minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '6px', border: item === '...' ? 'none' : '1px solid #e2e8f0',
                                backgroundColor: paginaAtual === item ? '#3b82f6' : (item === '...' ? 'transparent' : '#fff'),
                                color: paginaAtual === item ? '#fff' : '#64748b',
                                cursor: item === '...' || loading ? 'default' : 'pointer',
                                fontWeight: paginaAtual === item ? '600' : '400',
                                transition: 'all 0.2s'
                            }}
                        >
                            {item}
                        </button>
                    ))}

                    <button 
                        onClick={() => onMudarPagina(paginaAtual + 1)} 
                        disabled={paginaAtual === totalPaginas || loading || totalPaginas === 0}
                        style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: (paginaAtual === totalPaginas || loading || totalPaginas === 0) ? 'default' : 'pointer', color: '#64748b' }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}