import { useState, useRef, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { 
    Plus, Search, RotateCcw, Download, 
    ArrowUpAZ, ArrowDownZA, Calendar, Filter, FileBarChart2, Briefcase, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useFuncionarios } from './hooks/useFuncionarios';
import { TabelaFuncionarios } from './components/TabelaFuncionarios';
import { ModalFuncionario } from './components/ModalFuncionario';
import { ModalDetalhes } from './components/ModalDetalhes';
import { ResumoFinanceiro } from './components/ResumoFinanceiro'; 
import { ModalRelatorioCusto } from './components/ModalRelatorioCusto'; 
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { api } from '../../services/api'; // <-- Injeção do Interceptador Axios

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

    const [paginaAtual, setPaginaAtual] = useState(1);
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroSetor, setFiltroSetor] = useState<FiltroSetor>('todos');
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos'); 
    const [filtroDataAdmissao, setFiltroDataAdmissao] = useState(''); 
    const [ordenarPor, setOrdenarPor] = useState<OpcaoOrdenacao>('nome');
    const [direcaoOrdem, setDirecaoOrdem] = useState<DirecaoOrdenacao>('asc');
    
    const [listaFuncoes, setListaFuncoes] = useState<{id: number, nome: string}[]>([]);
    const [filtroFuncao, setFiltroFuncao] = useState<string>('todas');
    const [buscaFiltroFuncao, setBuscaFiltroFuncao] = useState('');
    const [dropdownFiltroFuncaoOpen, setDropdownFiltroFuncaoOpen] = useState(false);
    
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

    useEffect(() => {
        const fetchFuncoes = async () => {
            try {
                // CORREÇÃO: Usando a api do Axios
                const res = await api.get('/funcoes');
                const data = res.data;
                
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

    const formatarMoedaPDF = (valor?: number | string) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const exportarPDF = async () => {
        setGerandoPdf(true);

        try {
            let listaCompleta: Funcionario[] = [];
            let paginaAtualBusca = 1;
            let buscarMais = true;
            let ultimoIdVisto: number | string | null = null;
            
            const LIMITE_ALTO = 1000; 

            while (buscarMais) {
                // CORREÇÃO: Utilizando os params através do Axios
                const paramsConfig = {
                    busca: termoBusca,
                    setor: filtroSetor,
                    status: filtroStatus,
                    funcao: filtroFuncao !== 'todas' ? filtroFuncao : '',
                    ordenarPor: ordenarPor,
                    direcaoOrdem: direcaoOrdem,
                    limite: LIMITE_ALTO,
                    limit: LIMITE_ALTO,
                    pagina: paginaAtualBusca,
                    page: paginaAtualBusca
                };

                const res = await api.get('/funcionarios', { params: paramsConfig });
                const data = res.data;
                
                const itens: Funcionario[] = Array.isArray(data) ? data : (data.dados || data.funcionarios || data.data || []);
                
                if (itens.length > 0) {
                    const idPrimeiroItem = itens[0]?.id;
                    if (ultimoIdVisto === idPrimeiroItem) {
                        console.warn("API retornou registros duplicados. Interrompendo paginação do PDF.");
                        break; 
                    }
                    ultimoIdVisto = idPrimeiroItem ?? null;

                    listaCompleta = [...listaCompleta, ...itens];
                    
                    if (itens.length < LIMITE_ALTO) {
                        buscarMais = false;
                    } else {
                        paginaAtualBusca++;
                    }
                } else {
                    buscarMais = false; 
                }

                if (paginaAtualBusca > 20) buscarMais = false; 
            }

            const doc = new jsPDF('p', 'pt', 'a4');

            const yHeader = 35;
            const logoImg = document.getElementById('logo-pdf-branca') as HTMLImageElement;
            
            if (logoImg) {
                doc.addImage(logoImg, 'PNG', 40, yHeader - 15, 28, 28);
                doc.setFontSize(16);
                doc.setTextColor(15, 23, 42); 
                doc.text('Gestão de Equipe', 75, yHeader);
                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`Relatório Analítico emitido em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 75, yHeader + 14);
            } else {
                doc.setFontSize(16);
                doc.setTextColor(15, 23, 42); 
                doc.text('Gestão de Equipe', 40, yHeader);
                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`Relatório Analítico emitido em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 40, yHeader + 14);
            }

            const yCards = 75; 
            const wCard = 160;
            const hCard = 40;
            
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(1);

            doc.roundedRect(40, yCards, wCard, hCard, 4, 4, 'S'); 
            doc.setFontSize(8); doc.setTextColor(100, 116, 139);
            doc.text('EQUIPE ATIVA', 50, yCards + 15);
            doc.setFontSize(12); doc.setTextColor(249, 115, 22);
            doc.text(`${resumo.totalAtivos} colaboradores`, 50, yCards + 30);

            doc.roundedRect(215, yCards, wCard, hCard, 4, 4, 'S');
            doc.setFontSize(8); doc.setTextColor(100, 116, 139);
            doc.text('CUSTO FOLHA MENSAL', 225, yCards + 15);
            doc.setFontSize(12); doc.setTextColor(59, 130, 246);
            doc.text(formatarMoedaPDF(resumo.custoFolha), 225, yCards + 30);

            doc.roundedRect(390, yCards, wCard, hCard, 4, 4, 'S');
            doc.setFontSize(8); doc.setTextColor(100, 116, 139);
            doc.text('CUSTO PRODUÇÃO', 400, yCards + 15);
            doc.setFontSize(12); doc.setTextColor(16, 185, 129);
            doc.text(formatarMoedaPDF(resumo.custoProducao), 400, yCards + 30);

            autoTable(doc, {
                startY: yCards + hCard + 15,
                head: [['NOME', 'FUNÇÃO', 'SETOR', 'SALÁRIO BASE', 'CUSTO MENSAL', 'STATUS']],
                body: listaCompleta.map((f: Funcionario) => [
                    f.nome,
                    f.funcao || '-',
                    f.setor?.toUpperCase() || '-',
                    formatarMoedaPDF(f.salario_base),
                    formatarMoedaPDF(f.custo_total_mensal),
                    f.ativo ? 'Ativo' : 'Inativo'
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 255, 255], 
                    textColor: [15, 23, 42],
                    fontSize: 8,
                    fontStyle: 'bold',
                    lineColor: [226, 232, 240],
                    lineWidth: 1,
                },
                bodyStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [51, 65, 85],
                    fontSize: 8,
                    lineColor: [226, 232, 240],
                    lineWidth: 1,
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255] 
                },
                styles: {
                    cellPadding: 6,
                }
            });

            doc.save(`Relatorio_Equipe_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Erro PDF:", error);
            alert("Erro ao buscar registros integrais para o PDF.");
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
            <img 
                id="logo-pdf-branca"
                src="/logo-denarius-branca.png" 
                alt="Logo Denarius Branca" 
                style={{ display: 'none' }}
            />

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
                            title="Gerar Relatório Analítico (PDF)"
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