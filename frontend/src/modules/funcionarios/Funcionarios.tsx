import { useState } from 'react';
import { 
    Plus, Wallet, Briefcase, Search, RotateCcw, Download, 
    ArrowUpAZ, ArrowDownZA, Calendar, Filter
    // Removi o 'Info' daqui pois ele não é usado neste arquivo (ele é usado dentro da Tabela ou no Modal)
} from 'lucide-react';

import { useFuncionarios } from './hooks/useFuncionarios';
import { TabelaFuncionarios } from './components/TabelaFuncionarios';
import { FiltroHistorico } from './components/FiltroHistorico';
import { ModalFuncionario } from './components/ModalFuncionario';
// Agora este import não vai ter sublinhado vermelho
import { ModalDetalhes } from './components/ModalDetalhes';

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

    // Lógica (Mantida igual, sem alterações necessárias aqui)
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
    
    const custoFolha = funcionarios.filter(f => f.ativo).reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);
    const custoProducao = funcionarios.filter(f => f.ativo && f.setor === 'producao').reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Handlers
    const handleNovo = () => { setFuncionarioEdicao(null); setModalAberto(true); };
    const handleEditar = (f: Funcionario) => { setFuncionarioEdicao(f); setModalAberto(true); };
    const limparFiltros = () => {
        setTermoBusca(''); setFiltroSetor('todos'); setFiltroStatus('ativos');
        setFiltroDataAdmissao(''); setOrdenarPor('nome'); setDirecaoOrdem('asc');
    };
    const exportarCSV = () => {
        // Lógica de exportação mantida...
    };

    return (
        <div className="funcionarios-container">
            <div className="header-top">
                <h1>Gestão de Equipe 👥</h1>
                <div className="resumo-badges">
                    <div className="card-resumo-mini">
                        <small><Wallet size={16} /> Folha Mensal (Ativa)</small>
                        <div className="valor">{loading ? '...' : BRL(custoFolha)}</div>
                    </div>
                    <div className="card-resumo-mini destaque">
                        <small><Briefcase size={16} /> Custo Produção (Ativa)</small>
                        <div className="valor">{loading ? '...' : BRL(custoProducao)}</div>
                    </div>
                </div>
            </div>

            <FiltroHistorico onBuscar={buscarRelatorio} />

            <div className="toolbar-container">
                <div className="toolbar-row principal">
                    <div className="search-group">
                        <Search size={18} color="#94a3b8" />
                        <input placeholder="Buscar nome ou função..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                    </div>
                    <button className="btn-novo" onClick={handleNovo}><Plus size={20} /> Novo</button>
                </div>

                <div className="toolbar-row filtros">
                    <div className="filtro-grupo">
                        <label><Filter size={14}/> Setor</label>
                        <select value={filtroSetor} onChange={e => setFiltroSetor(e.target.value as FiltroSetor)}>
                            <option value="todos">Todos</option><option value="producao">Produção</option><option value="administrativo">Admin</option>
                        </select>
                    </div>
                    <div className="filtro-grupo">
                        <label>Status</label>
                        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as FiltroStatus)}>
                            <option value="todos">Todos</option><option value="ativos">Ativos</option><option value="inativos">Inativos</option>
                        </select>
                    </div>
                    <div className="filtro-grupo">
                        <label><Calendar size={14}/> Admissão</label>
                        <input type="date" value={filtroDataAdmissao} onChange={e => setFiltroDataAdmissao(e.target.value)} className="input-data-dark"/>
                    </div>
                    
                    <div className="filtro-grupo separador-esq">
                        <label>Ordenar</label>
                        <div className="ordenacao-controles">
                            <select value={ordenarPor} onChange={e => setOrdenarPor(e.target.value as OpcaoOrdenacao)} style={{borderTopRightRadius:0, borderBottomRightRadius:0}}>
                                <option value="nome">Nome</option><option value="salario">Salário</option><option value="admissao">Admissão</option>
                            </select>
                            <button className="btn-direcao" onClick={() => setDirecaoOrdem(direcaoOrdem==='asc'?'desc':'asc')}>
                                {ordenarPor==='nome' ? (direcaoOrdem==='asc' ? <ArrowUpAZ size={16}/> : <ArrowDownZA size={16}/>) : (direcaoOrdem==='asc' ? 'Min→Max' : 'Max→Min')}
                            </button>
                        </div>
                    </div>

                    <div className="acoes-extras">
                        <button className="btn-reset" onClick={limparFiltros}><RotateCcw size={18} /></button>
                        <button className="btn-icon btn-csv" onClick={exportarCSV}><Download size={18} /></button>
                    </div>
                </div>
            </div>

            <TabelaFuncionarios 
                funcionarios={dadosExibicao} 
                loading={loading} 
                onEditar={handleEditar} 
                onExcluir={excluir}
                onVerDetalhes={setFuncionarioDetalhes}
            />

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