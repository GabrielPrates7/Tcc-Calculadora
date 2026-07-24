import { useState, useRef, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
    Plus, Search, RotateCcw, Download, 
    ArrowUpAZ, ArrowDownZA, Calendar, Filter, FileBarChart2, Briefcase, X
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
        totalPaginas,
        totalRegistros,
        resumo,
        loading, 
        salvar, 
        excluir, 
        buscarRelatorio, 
        carregarLista,
        carregarResumo
    } = useFuncionarios();

    // Estados de Filtro e Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroSetor, setFiltroSetor] = useState<FiltroSetor>('todos');
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos'); 
    const [filtroDataAdmissao, setFiltroDataAdmissao] = useState(''); 
    const [ordenarPor, setOrdenarPor] = useState<OpcaoOrdenacao>('nome');
    const [direcaoOrdem, setDirecaoOrdem] = useState<DirecaoOrdenacao>('asc');
    
    // Estados do Autocomplete de Funções
    const [listaFuncoes, setListaFuncoes] = useState<{id: number, nome: string}[]>([]);
    const [filtroFuncao, setFiltroFuncao] = useState<string>('todas');
    const [buscaFiltroFuncao, setBuscaFiltroFuncao] = useState('');
    const [dropdownFiltroFuncaoOpen, setDropdownFiltroFuncaoOpen] = useState(false);
    
    // Gatilho para forçar recarregamento após CRUD
    const [atualizarFiltro, setAtualizarFiltro] = useState(0);
    
    // Estados Visuais (Modais)
    const [modalAberto, setModalAberto] = useState(false);
    const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
    const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);
    const [funcionarioDetalhes, setFuncionarioDetalhes] = useState<Funcionario | null>(null);
    const [modalExclusao, setModalExclusao] = useState<{isOpen: boolean, id: number, nome: string}>({
        isOpen: false, id: 0, nome: ''
    });

    const [gerandoPdf, setGerandoPdf] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null); 

    // Carrega Departamentos (Funções) com proteção contra falhas da API
    useEffect(() => {
        const fetchFuncoes = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/funcoes');
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    setListaFuncoes(data);
                } else {
                    setListaFuncoes([]); 
                }
            } catch (error) {
                console.error("Erro na requisição de funções:", error);
                setListaFuncoes([]); 
            }
        };
        void fetchFuncoes();
    }, [atualizarFiltro]);

    // Motor de Busca Assíncrona
    useEffect(() => {
        carregarLista({
            pagina: paginaAtual,
            limite: 8,
            busca: termoBusca,
            setor: filtroSetor,
            status: filtroStatus,
            funcao: filtroFuncao,
            ordenarPor: ordenarPor,
            direcaoOrdem: direcaoOrdem
        });
        carregarResumo();
    }, [paginaAtual, termoBusca, filtroSetor, filtroStatus, filtroFuncao, ordenarPor, direcaoOrdem, atualizarFiltro, carregarLista, carregarResumo]);

    // Filtro dinâmico para o input dropdown
    const funcoesFiltroFiltradas = (Array.isArray(listaFuncoes) ? listaFuncoes : []).filter(f => 
        f?.nome?.toLowerCase().includes(buscaFiltroFuncao.toLowerCase())
    );

    const handleFiltroChange = <T,>(setter: Dispatch<SetStateAction<T>>, value: T) => {
        setter(value);
        setPaginaAtual(1); 
    };

    const limparFiltros = () => {
        setTermoBusca(''); setFiltroSetor('todos'); setFiltroStatus('ativos');
        setFiltroFuncao('todas'); setBuscaFiltroFuncao(''); setFiltroDataAdmissao(''); 
        setOrdenarPor('nome'); setDirecaoOrdem('asc');
        setPaginaAtual(1);
    };

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

    const handleNovo = () => { setFuncionarioEdicao(null); setModalAberto(true); };
    const handleEditar = (f: Funcionario) => { setFuncionarioEdicao(f); setModalAberto(true); };
    
    const abrirModalExclusao = (id: number) => {
        const funcionarioSelecionado = funcionarios.find(f => f.id === id);
        if (funcionarioSelecionado) {
            setModalExclusao({ isOpen: true, id: id, nome: funcionarioSelecionado.nome });
        }
    };

    const confirmarExclusao = async () => {
        try {
            await excluir(modalExclusao.id);
            setAtualizarFiltro(prev => prev + 1); 
        } catch (error) {
            console.error("Erro ao excluir", error);
        } finally {
            setModalExclusao({ isOpen: false, id: 0, nome: '' });
        }
    };

    const onSalvarModal = async (dados: unknown) => {
        await salvar(dados as Funcionario);
        setAtualizarFiltro(prev => prev + 1);
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
                custoFolha={resumo.custoFolha}
                custoProducao={resumo.custoProducao}
                totalAtivos={resumo.totalAtivos}
                loading={loading}
            />

            <div className="toolbar-container">
                <div className="toolbar-row principal">
                    <div className="search-group">
                        <Search size={18} color="#94a3b8" />
                        <input 
                            placeholder="Buscar nome do colaborador..." 
                            value={termoBusca} 
                            onChange={e => handleFiltroChange(setTermoBusca, e.target.value)} 
                        />
                    </div>
                    <button className="btn-novo" onClick={handleNovo}>
                        <Plus size={20} /> Novo
                    </button>
                </div>

                <div className="toolbar-row filtros">
                    <div className="filtro-grupo">
                        <label><Filter size={14}/> Setor</label>
                        <select value={filtroSetor} onChange={e => handleFiltroChange(setFiltroSetor, e.target.value as FiltroSetor)}>
                            <option value="todos">Todos</option>
                            <option value="producao">Produção</option>
                            <option value="administrativo">Admin</option>
                        </select>
                    </div>

                    <div className="filtro-grupo" style={{ position: 'relative' }}>
                        <label><Briefcase size={14}/> Função</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', backgroundColor: '#0f172a',
                            border: '1px solid #334155', borderRadius: '6px', padding: '0 8px', height: '36px',
                            minWidth: '220px'
                        }}>
                            <Search size={14} color="#64748b" />
                            <input
                                type="text"
                                value={buscaFiltroFuncao}
                                onChange={e => {
                                    setBuscaFiltroFuncao(e.target.value);
                                    setDropdownFiltroFuncaoOpen(true);
                                    if (e.target.value === '') handleFiltroChange<string>(setFiltroFuncao, 'todas');
                                }}
                                onFocus={() => setDropdownFiltroFuncaoOpen(true)}
                                onBlur={() => setTimeout(() => setDropdownFiltroFuncaoOpen(false), 200)}
                                placeholder={filtroFuncao !== 'todas' ? filtroFuncao : "Todas"}
                                style={{
                                    border: 'none', background: 'transparent', width: '100%',
                                    outline: 'none', color: '#f8fafc', fontSize: '0.85rem', paddingLeft: '8px'
                                }}
                            />
                            {filtroFuncao !== 'todas' && (
    <span 
        title="Limpar função"
        onClick={() => {
            setBuscaFiltroFuncao('');
            handleFiltroChange<string>(setFiltroFuncao, 'todas');
        }}
        style={{ cursor: 'pointer', marginLeft: '4px', display: 'flex', alignItems: 'center' }}
    >
        <X size={14} color="#64748b" />
    </span>
)}
                        </div>

                        {dropdownFiltroFuncaoOpen && (
                            <ul style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, 
                                maxHeight: '200px', overflowY: 'auto', backgroundColor: '#1e293b', 
                                border: '1px solid #334155', borderRadius: '6px', 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', zIndex: 100,
                                listStyle: 'none', padding: 0, margin: '4px 0 0 0'
                            }}>
                                <li 
                                    onClick={() => {
                                        setBuscaFiltroFuncao('');
                                        handleFiltroChange<string>(setFiltroFuncao, 'todas');
                                        setDropdownFiltroFuncaoOpen(false);
                                    }}
                                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.85rem' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Todas as funções
                                </li>
                                {funcoesFiltroFiltradas.length === 0 ? (
                                    <li style={{ padding: '10px 12px', color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                                        Nenhuma encontrada.
                                    </li>
                                ) : (
                                    funcoesFiltroFiltradas.map(f => (
                                        <li 
                                            key={f.id} 
                                            onClick={() => {
                                                setBuscaFiltroFuncao(''); 
                                                handleFiltroChange(setFiltroFuncao, f.nome);
                                                setDropdownFiltroFuncaoOpen(false);
                                            }}
                                            style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #334155', color: '#f8fafc', fontSize: '0.85rem' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            {f.nome}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="filtro-grupo">
                        <label>Status</label>
                        <select value={filtroStatus} onChange={e => handleFiltroChange(setFiltroStatus, e.target.value as FiltroStatus)}>
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
                            onChange={e => handleFiltroChange(setFiltroDataAdmissao, e.target.value)} 
                            className="input-data-dark"
                        />
                    </div>
                    
                    <div className="filtro-grupo separador-esq">
                        <label>Ordenar</label>
                        <div className="ordenacao-controles">
                            <select 
                                value={ordenarPor} 
                                onChange={e => handleFiltroChange(setOrdenarPor, e.target.value as OpcaoOrdenacao)} 
                                style={{borderTopRightRadius:0, borderBottomRightRadius:0}}
                            >
                                <option value="nome">Nome</option>
                                <option value="salario">Salário</option>
                                <option value="admissao">Admissão</option>
                            </select>
                            <button className="btn-direcao" onClick={() => handleFiltroChange(setDirecaoOrdem, direcaoOrdem === 'asc' ? 'desc' : 'asc')}>
                                {ordenarPor === 'nome' 
                                    ? (direcaoOrdem === 'asc' ? <ArrowUpAZ size={16}/> : <ArrowDownZA size={16}/>) 
                                    : (direcaoOrdem === 'asc' ? 'Min→Max' : 'Max→Min')
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
                funcionarios={funcionarios} 
                loading={loading} 
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                totalRegistros={totalRegistros}
                onMudarPagina={setPaginaAtual}
                onEditar={handleEditar} 
                onExcluir={abrirModalExclusao} 
                onVerDetalhes={setFuncionarioDetalhes}
            />

            {modalAberto && (
                <ModalFuncionario 
                    key={funcionarioEdicao ? funcionarioEdicao.id : 'novo'}
                    funcionarioEdicao={funcionarioEdicao} 
                    onClose={() => setModalAberto(false)} 
                    onSalvar={onSalvarModal} 
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