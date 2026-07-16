import { useState, useRef, useEffect } from 'react';
import { 
    Plus, Search, RotateCcw, Download, 
    ArrowUpAZ, ArrowDownZA, Calendar, Filter, FileBarChart2, Briefcase
} from 'lucide-react';
import html2canvas from 'html2canvas'; 
import jsPDF from 'jspdf';             

import { useFuncionarios } from './hooks/useFuncionarios';
import { TabelaFuncionarios } from './components/TabelaFuncionarios';
import { ModalFuncionario } from './components/ModalFuncionario';
import { ModalDetalhes } from './components/ModalDetalhes';
import { ResumoFinanceiro } from './components/ResumoFinanceiro'; 
import { ModalRelatorioCusto } from './components/ModalRelatorioCusto'; 

import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';

import type { Funcionario } from './types';
import './Funcionarios.css'; 

type OpcaoOrdenacao = 'nome' | 'salario' | 'admissao';
type DirecaoOrdenacao = 'asc' | 'desc';
type FiltroSetor = 'todos' | 'producao' | 'administrativo';
type FiltroStatus = 'todos' | 'ativos' | 'inativos';

export function Funcionarios() {
    const { 
        funcionarios, 
        loading, 
        salvar, 
        excluir, 
        buscarRelatorio, 
        recarregarLista 
    } = useFuncionarios();

    const [termoBusca, setTermoBusca] = useState('');
    const [filtroSetor, setFiltroSetor] = useState<FiltroSetor>('todos');
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos'); 
    const [filtroDataAdmissao, setFiltroDataAdmissao] = useState(''); 
    const [ordenarPor, setOrdenarPor] = useState<OpcaoOrdenacao>('nome');
    const [direcaoOrdem, setDirecaoOrdem] = useState<DirecaoOrdenacao>('asc');
    
    const [listaFuncoes, setListaFuncoes] = useState<{id: number, nome: string}[]>([]);
    const [filtroFuncao, setFiltroFuncao] = useState<string>('todas');
    
    // GATILHO DE RECARREGAMENTO: Altera esse número para forçar o useEffect a rodar
    const [atualizarFiltro, setAtualizarFiltro] = useState(0);
    
    const [modalAberto, setModalAberto] = useState(false);
    const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
    const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);
    const [funcionarioDetalhes, setFuncionarioDetalhes] = useState<Funcionario | null>(null);
    const [modalExclusao, setModalExclusao] = useState<{isOpen: boolean, id: number, nome: string}>({
        isOpen: false, id: 0, nome: ''
    });

    const [gerandoPdf, setGerandoPdf] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null); 

    // USE EFFECT ISOLADO E SEGURO (Sem depender de funções externas)
    useEffect(() => {
        const fetchFuncoes = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/funcoes');
                const data = await res.json();
                setListaFuncoes(data);
            } catch (error) {
                console.error("Erro ao carregar lista de funções para o filtro", error);
            }
        };
        
        void fetchFuncoes();
    }, [atualizarFiltro]); // Roda na montagem (0) e toda vez que o modal fechar (+1)

    const exportarPDF = async () => {
        if (!containerRef.current) return;
        setGerandoPdf(true);

        try {
            const element = containerRef.current;
            const canvas = await html2canvas(element, { 
                scale: 2, 
                backgroundColor: '#0f172a', 
                onclone: (documentClone) => {
                    const toolbar = documentClone.querySelector('.toolbar-container') as HTMLElement;
                    if (toolbar) toolbar.style.display = 'none';

                    const btnRelatorio = documentClone.querySelector('.btn-relatorio-topo') as HTMLElement;
                    if (btnRelatorio) btnRelatorio.style.display = 'none';

                    const header = documentClone.querySelector('.header-top div') as HTMLElement;
                    if (header) {
                        const dataImpressao = document.createElement('p');
                        dataImpressao.innerText = `Relatório Geral emitido em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`;
                        dataImpressao.style.color = '#94a3b8';
                        dataImpressao.style.fontSize = '0.8rem';
                        dataImpressao.style.marginTop = '5px';
                        header.appendChild(dataImpressao);
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Dashboard_Equipe_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Erro PDF:", error);
            alert("Erro ao gerar PDF");
        } finally {
            setGerandoPdf(false);
        }
    };

    const getDadosProcessados = () => {
        const lista = funcionarios.filter(func => {
            const termo = termoBusca.toLowerCase();
            const nome = (func.nome || '').toLowerCase();
            const funcao = (func.funcao || '').toLowerCase();
            const matchNome = nome.includes(termo) || funcao.includes(termo);
            
            const matchSetor = filtroSetor === 'todos' || func.setor === filtroSetor;
            const matchFuncao = filtroFuncao === 'todas' || func.funcao === filtroFuncao;
            
            const isAtivo = String(func.ativo) === 'true' || func.ativo === true;
            const matchStatus = filtroStatus === 'todos' ? true : (filtroStatus === 'ativos' ? isAtivo : !isAtivo);
            const dataStr = func.data_admissao ? String(func.data_admissao) : '';
            const matchData = !filtroDataAdmissao || dataStr.includes(filtroDataAdmissao);
            
            return matchNome && matchSetor && matchFuncao && matchStatus && matchData;
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
    
    const totalAtivos = funcionarios.filter(f => String(f.ativo) === 'true' || f.ativo === true).length;
    const custoFolha = funcionarios.filter(f => String(f.ativo) === 'true' || f.ativo === true).reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);
    const custoProducao = funcionarios.filter(f => (String(f.ativo) === 'true' || f.ativo === true) && f.setor === 'producao').reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);

    const handleNovo = () => { setFuncionarioEdicao(null); setModalAberto(true); };
    const handleEditar = (f: Funcionario) => { setFuncionarioEdicao(f); setModalAberto(true); };
    
    const limparFiltros = () => {
        setTermoBusca(''); setFiltroSetor('todos'); setFiltroStatus('ativos');
        setFiltroFuncao('todas'); 
        setFiltroDataAdmissao(''); setOrdenarPor('nome'); setDirecaoOrdem('asc');
        recarregarLista(); 
    };

    const abrirModalExclusao = (id: number) => {
        const funcionarioSelecionado = funcionarios.find(f => f.id === id);
        if (funcionarioSelecionado) {
            setModalExclusao({ 
                isOpen: true, 
                id: id, 
                nome: funcionarioSelecionado.nome 
            });
        }
    };

    const confirmarExclusao = async () => {
        try {
            await excluir(modalExclusao.id);
            recarregarLista(); 
        } catch (error) {
            console.error("Erro ao excluir", error);
        } finally {
            setModalExclusao({ isOpen: false, id: 0, nome: '' });
        }
    };

    return (
        <div className="funcionarios-container" ref={containerRef}>
            
            <div className="header-top">
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '5px' }}>
                        Gestão de Equipe
                    </h1>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                        Gerencie colaboradores, custos e memória de cálculo.
                    </p>
                </div>
                
                <button 
                    className="btn-relatorio-topo"
                    onClick={() => setModalRelatorioAberto(true)}
                    style={{
                        background: 'transparent', border: '1px solid var(--cor-primaria)', color: 'var(--cor-primaria)',
                        padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <FileBarChart2 size={18} />
                    Relatório Histórico
                </button>
            </div>

            <ResumoFinanceiro 
                custoFolha={custoFolha}
                custoProducao={custoProducao}
                totalAtivos={totalAtivos}
                loading={loading}
            />

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
                        <label><Briefcase size={14}/> Função</label>
                        <select value={filtroFuncao} onChange={e => setFiltroFuncao(e.target.value)}>
                            <option value="todas">Todas</option>
                            {listaFuncoes.map(f => (
                                <option key={f.id} value={f.nome}>
                                    {f.nome}
                                </option>
                            ))}
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
                        
                        <button 
                            className="btn-icon btn-csv" 
                            onClick={exportarPDF} 
                            title="Baixar Tabela Atual (PDF)"
                            disabled={gerandoPdf}
                        >
                            {gerandoPdf ? '...' : <Download size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            <TabelaFuncionarios 
                funcionarios={dadosExibicao} 
                loading={loading} 
                onEditar={handleEditar} 
                onExcluir={abrirModalExclusao} 
                onVerDetalhes={setFuncionarioDetalhes}
            />

            {modalAberto && (
                <ModalFuncionario 
                    key={funcionarioEdicao ? funcionarioEdicao.id : 'novo'}
                    funcionarioEdicao={funcionarioEdicao} 
                    onClose={() => {
                        setModalAberto(false);
                        // INCREMENTA O GATILHO PARA RECARREGAR AS FUNÇÕES NA TELA
                        setAtualizarFiltro(prev => prev + 1); 
                    }} 
                    onSalvar={async (dados) => await salvar(dados as unknown as Funcionario)} 
                />
            )}

            {funcionarioDetalhes && (
                <ModalDetalhes
                    funcionario={funcionarioDetalhes}
                    onClose={() => setFuncionarioDetalhes(null)}
                />
            )}

            {modalRelatorioAberto && (
                <ModalRelatorioCusto
                    onClose={() => setModalRelatorioAberto(false)}
                    onBuscar={buscarRelatorio}
                />
            )}

            <ConfirmModal 
                isOpen={modalExclusao.isOpen}
                title="Excluir Colaborador"
                message={`Tem certeza que deseja excluir o registro de "${modalExclusao.nome}"? Se ele possuir vínculos com orçamentos ou obras, o sistema abortará a exclusão para manter a integridade dos dados.`}
                textoConfirmar="Excluir Colaborador"
                onConfirm={confirmarExclusao}
                onCancel={() => setModalExclusao({ isOpen: false, id: 0, nome: '' })}
            />
        </div>
    );
}