import { useState } from 'react';
import { Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Funcionario } from '../types';
import './TabelaFuncionarios.css'; 

interface Props {
    funcionarios: Funcionario[];
    loading: boolean;
    onEditar: (f: Funcionario) => void;
    onExcluir: (id: number) => void;
    onVerDetalhes: (f: Funcionario) => void;
}

export function TabelaFuncionarios({ funcionarios, loading, onEditar, onExcluir, onVerDetalhes }: Props) {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const itensPorPagina = 8;

    const totalPaginas = Math.ceil(funcionarios.length / itensPorPagina);
    const paginaAtual = Math.max(1, Math.min(paginaSelecionada, totalPaginas));

    if (loading) return <div className="loading-state">Carregando dados...</div>;

    const indiceUltimoItem = paginaAtual * itensPorPagina;
    const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
    const itensAtuais = funcionarios.slice(indicePrimeiroItem, indiceUltimoItem);

    const irParaPagina = (pagina: number) => {
        if (pagina >= 1 && pagina <= totalPaginas) setPaginaSelecionada(pagina);
    };

    const formatarMoeda = (valor: number | string) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Algoritmo de Paginação com Elipse
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
                    <tbody>
                        {itensAtuais.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                    Nenhum colaborador encontrado na filtragem atual.
                                </td>
                            </tr>
                        ) : (
                            itensAtuais.map(f => (
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
                                    <td>{new Date(f.data_admissao).toLocaleDateString('pt-BR')}</td>
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

            {totalPaginas > 0 && (
                <div className="paginacao-container">
                    <span className="paginacao-info">
                        Mostrando <strong>{funcionarios.length === 0 ? 0 : indicePrimeiroItem + 1}</strong> a <strong>{Math.min(indiceUltimoItem, funcionarios.length)}</strong> de <strong>{funcionarios.length}</strong> registros
                    </span>
                    
                    <div className="paginacao-botoes">
                        <button 
                            onClick={() => irParaPagina(paginaAtual - 1)} 
                            disabled={paginaAtual === 1}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        {gerarPaginas().map((item, index) => (
                            <button 
                                key={index}
                                className={paginaAtual === item ? 'ativo' : ''}
                                onClick={() => typeof item === 'number' && irParaPagina(item)}
                                disabled={item === '...'}
                                style={item === '...' ? { cursor: 'default', background: 'transparent', borderColor: 'transparent', color: '#94a3b8' } : {}}
                            >
                                {item}
                            </button>
                        ))}

                        <button 
                            onClick={() => irParaPagina(paginaAtual + 1)} 
                            disabled={paginaAtual === totalPaginas}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}