import { useState } from 'react';
import { 
    Plus, Search, RotateCcw, Download, 
    ArrowUpAZ, ArrowDownZA, Calendar, Filter
} from 'lucide-react';

import { useFuncionarios } from './hooks/useFuncionarios';
import { TabelaFuncionarios } from './components/TabelaFuncionarios';
import { FiltroHistorico } from './components/FiltroHistorico';
import { ModalFuncionario } from './components/ModalFuncionario';
import { ModalDetalhes } from './components/ModalDetalhes';
import { ResumoFinanceiro } from './components/ResumoFinanceiro'; // <--- Import Novo

import type { Funcionario } from './types';
import './Funcionarios.css'; 

type OpcaoOrdenacao = 'nome' | 'salario' | 'admissao';
type DirecaoOrdenacao = 'asc' | 'desc';
type FiltroSetor = 'todos' | 'producao' | 'administrativo';
type FiltroStatus = 'todos' | 'ativos' | 'inativos';

export function Funcionarios() {
    const { funcionarios, loading, salvar, excluir, buscarRelatorio } = useFuncionarios();

    // Filtros e Estados
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroSetor, setFiltroSetor] = useState<FiltroSetor>('todos');
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos');
    const [filtroDataAdmissao, setFiltroDataAdmissao] = useState(''); 
    const [ordenarPor, setOrdenarPor] = useState<OpcaoOrdenacao>('nome');
    const [direcaoOrdem, setDirecaoOrdem] = useState<DirecaoOrdenacao>('asc');
    
    // Modais
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);
    const [funcionarioDetalhes, setFuncionarioDetalhes] = useState<Funcionario | null>(null);

    // Lógica de Filtragem e Ordenação
    const getDadosProcessados = () => {
        const lista = funcionarios.filter(func => {
            const matchNome = func.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
                              (func.funcao || '').toLowerCase().includes(termoBusca.toLowerCase());
            const matchSetor = filtroSetor === 'todos' || func.setor === filtroSetor;
            const matchStatus = filtroStatus === 'todos' 
                ? true 
                : (filtroStatus === 'ativos' ? func.ativo : !func.ativo);
            const matchData = !filtroDataAdmissao || func.data_admissao.startsWith(filtroDataAdmissao);
            return matchNome && matchSetor && matchStatus && matchData;
        });

        return lista.sort((a, b) => {
            let comparacao = 0;
            if (ordenarPor === 'nome') comparacao = a.nome.localeCompare(b.nome);
            else if (ordenarPor === 'salario') comparacao = (Number(a.custo_total_mensal)||0) - (Number(b.custo_total_mensal)||0);
            else if (ordenarPor === 'admissao') comparacao = new Date(a.data_admissao).getTime() - new Date(b.data_admissao).getTime();
            return direcaoOrdem === 'asc' ? comparacao : comparacao * -1;
        });
    };

    const dadosExibicao = getDadosProcessados();
    
    // --- CÁLCULOS PARA O DASHBOARD (ResumoFinanceiro) ---
    const totalAtivos = funcionarios.filter(f => f.ativo).length;
    
    const custoFolha = funcionarios
        .filter(f => f.ativo)
        .reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);
        
    const custoProducao = funcionarios
        .filter(f => f.ativo && f.setor === 'producao')
        .reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);

    // Handlers
    const handleNovo = () => { setFuncionarioEdicao(null); setModalAberto(true); };
    const handleEditar = (f: Funcionario) => { setFuncionarioEdicao(f); setModalAberto(true); };
    const limparFiltros = () => {
        setTermoBusca(''); setFiltroSetor('todos'); setFiltroStatus('ativos');
        setFiltroDataAdmissao(''); setOrdenarPor('nome'); setDirecaoOrdem('asc');
    };
    const exportarCSV = () => {
        // TODO: Implementar exportação real se necessário
        alert("Funcionalidade de CSV em desenvolvimento");
    };

    return (
        <div className="funcionarios-container">
            
            {/* --- NOVO HEADER --- */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '5px' }}>
                    Gestão de Equipe
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                    Gerencie colaboradores, custos e memória de cálculo.
                </p>
            </div>

            {/* --- NOVO COMPONENTE DE RESUMO --- */}
            <ResumoFinanceiro 
                custoFolha={custoFolha}
                custoProducao={custoProducao}
                totalAtivos={totalAtivos}
                loading={loading}
            />

            {/* Filtro de Relatório Histórico */}
            <FiltroHistorico onBuscar={buscarRelatorio} />

            {/* Toolbar de Filtros da Tabela */}
            <div className="toolbar-container">
                <div className="toolbar-row principal">
                    <div className="search-group">
                        <Search size={18} color="#94a3b8" />
                        <input 
                            placeholder="Buscar nome ou função..." 
                            value={termoBusca} 
                            onChange={e => setTermoBusca(e.target.value)} 
                        />
                    </div>
                    <button className="btn-novo" onClick={handleNovo}>
                        <Plus size={20} /> Novo
                    </button>
                </div>

                <div className="toolbar-row filtros">
                    <div className="filtro-grupo">
                        <label><Filter size={14}/> Setor</label>
                        <select value={filtroSetor} onChange={e => setFiltroSetor(e.target.value as FiltroSetor)}>
                            <option value="todos">Todos</option>
                            <option value="producao">Produção</option>
                            <option value="administrativo">Admin</option>
                        </select>
                    </div>
                    <div className="filtro-grupo">
                        <label>Status</label>
                        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as FiltroStatus)}>
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>
                    </div>
                    <div className="filtro-grupo">
                        <label><Calendar size={14}/> Admissão</label>
                        <input 
                            type="date" 
                            value={filtroDataAdmissao} 
                            onChange={e => setFiltroDataAdmissao(e.target.value)} 
                            className="input-data-dark"
                        />
                    </div>
                    
                    <div className="filtro-grupo separador-esq">
                        <label>Ordenar</label>
                        <div className="ordenacao-controles">
                            <select 
                                value={ordenarPor} 
                                onChange={e => setOrdenarPor(e.target.value as OpcaoOrdenacao)} 
                                style={{borderTopRightRadius:0, borderBottomRightRadius:0}}
                            >
                                <option value="nome">Nome</option>
                                <option value="salario">Salário</option>
                                <option value="admissao">Admissão</option>
                            </select>
                            <button className="btn-direcao" onClick={() => setDirecaoOrdem(direcaoOrdem==='asc'?'desc':'asc')}>
                                {ordenarPor==='nome' 
                                    ? (direcaoOrdem==='asc' ? <ArrowUpAZ size={16}/> : <ArrowDownZA size={16}/>) 
                                    : (direcaoOrdem==='asc' ? 'Min→Max' : 'Max→Min')
                                }
                            </button>
                        </div>
                    </div>

                    <div className="acoes-extras">
                        <button className="btn-reset" onClick={limparFiltros} title="Limpar Filtros">
                            <RotateCcw size={18} />
                        </button>
                        <button className="btn-icon btn-csv" onClick={exportarCSV} title="Exportar CSV">
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabela de Dados */}
            <TabelaFuncionarios 
                funcionarios={dadosExibicao} 
                loading={loading} 
                onEditar={handleEditar} 
                onExcluir={excluir}
                onVerDetalhes={setFuncionarioDetalhes}
            />

            {/* Modais */}
            {modalAberto && (
                <ModalFuncionario 
                    key={funcionarioEdicao ? funcionarioEdicao.id : 'novo'}
                    funcionarioEdicao={funcionarioEdicao} 
                    onClose={() => setModalAberto(false)} 
                    onSalvar={salvar} 
                />
            )}

            {funcionarioDetalhes && (
                <ModalDetalhes
                    funcionario={funcionarioDetalhes}
                    onClose={() => setFuncionarioDetalhes(null)}
                />
            )}
        </div>
    );
}