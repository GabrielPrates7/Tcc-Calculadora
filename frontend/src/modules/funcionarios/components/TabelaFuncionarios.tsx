import { Edit2, Trash2, Info } from 'lucide-react';
import type { Funcionario } from '../types';
import './TabelaFuncionarios.css';

interface Props {
    funcionarios: Funcionario[];
    loading: boolean;
    onEditar: (f: Funcionario) => void;
    onExcluir: (id: number) => Promise<void>;
    
    // --- O ERRO ESTÁ AQUI: ESSA LINHA É OBRIGATÓRIA ---
    onVerDetalhes: (f: Funcionario) => void; 
}

// E AQUI TAMBÉM: Adicione onVerDetalhes na desestruturação
export function TabelaFuncionarios({ funcionarios, loading, onEditar, onExcluir, onVerDetalhes }: Props) {
    
    if (loading) {
        return <div className="loading-state">Carregando dados...</div>;
    }

    if (funcionarios.length === 0) {
        return <div className="empty-state">Nenhum funcionário encontrado.</div>;
    }

    return (
        <div className="tabela-container">
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Função</th>
                        <th>Setor</th>
                        <th>Salário Base</th>
                        <th>Custo Mensal</th>
                        <th>Status</th>
                        <th>Admissão</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {funcionarios.map(func => (
                        <tr key={func.id} className={!func.ativo ? 'tr-inativo' : ''}>
                            <td>
                                <div className="col-nome">
                                    <strong>{func.nome}</strong>
                                </div>
                            </td>
                            <td>{func.funcao}</td>
                            <td>
                                <span className={`badge-setor ${func.setor}`}>
                                    {func.setor === 'producao' ? 'Produção' : 'Admin'}
                                </span>
                            </td>
                            <td>
                                {Number(func.salario_base).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td>
                                <strong style={{ color: '#0f172a' }}>
                                    {Number(func.custo_total_mensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </strong>
                            </td>
                            <td>
                                <span className={`badge-status ${func.ativo ? 'ativo' : 'inativo'}`}>
                                    {func.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td>{new Date(func.data_admissao).toLocaleDateString('pt-BR')}</td>
                            
                            <td style={{ textAlign: 'right' }}>
                                <div className="acoes-grupo">
                                    {/* Botão INFO que chama a função */}
<button
    className="btn-icon info"
    onClick={() => {
        console.log("Clicou no botão I - Funcionário:", func.nome); // <--- TESTE AQUI
        onVerDetalhes(func);
    }}
    title="Ver Memória de Cálculo"
>
    <Info size={18} />
</button>

                                    <button className="btn-icon edit" onClick={() => onEditar(func)} title="Editar">
                                        <Edit2 size={18} />
                                    </button>
                                    
                                    <button className="btn-icon delete" onClick={() => onExcluir(func.id!)} title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}