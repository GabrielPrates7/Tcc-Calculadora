import { useState, useRef } from 'react';
import { 
    Plus, Search, RotateCcw, Download, 
    ArrowUpAZ, ArrowDownZA, Calendar, Filter, FileBarChart2
} from 'lucide-react';
import html2canvas from 'html2canvas'; // <--- Importado
import jsPDF from 'jspdf';             // <--- Importado

import { useFuncionarios } from './hooks/useFuncionarios';
import { TabelaFuncionarios } from './components/TabelaFuncionarios';
import { ModalFuncionario } from './components/ModalFuncionario';
import { ModalDetalhes } from './components/ModalDetalhes';
import { ResumoFinanceiro } from './components/ResumoFinanceiro'; 
import { ModalRelatorioCusto } from './components/ModalRelatorioCusto'; 

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

    // Filtros e Estados
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroSetor, setFiltroSetor] = useState<FiltroSetor>('todos');
    const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativos'); 
    const [filtroDataAdmissao, setFiltroDataAdmissao] = useState(''); 
    const [ordenarPor, setOrdenarPor] = useState<OpcaoOrdenacao>('nome');
    const [direcaoOrdem, setDirecaoOrdem] = useState<DirecaoOrdenacao>('asc');
    
    // Estados de UI
    const [modalAberto, setModalAberto] = useState(false);
    const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
    const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);
    const [funcionarioDetalhes, setFuncionarioDetalhes] = useState<Funcionario | null>(null);
    
    // Estado do PDF
    const [gerandoPdf, setGerandoPdf] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null); // <--- REF PARA CAPTURAR A TELA

    // --- FUNÇÃO EXPORTAR PDF DA TELA PRINCIPAL ---
    const exportarPDF = async () => {
        if (!containerRef.current) return;
        setGerandoPdf(true);

        try {
            const element = containerRef.current;
            
            // Captura a tela com configurações para Tema Escuro
            const canvas = await html2canvas(element, { 
                scale: 2, 
                backgroundColor: '#0f172a', // Mantém o fundo escuro do dashboard (Slate-900)
                onclone: (documentClone) => {
                    // --- A MÁGICA ACONTECE AQUI: LIMPEZA PARA IMPRESSÃO ---
                    
                    // 1. Esconde a barra de ferramentas inteira (Busca, Filtros, Botões)
                    const toolbar = documentClone.querySelector('.toolbar-container') as HTMLElement;
                    if (toolbar) toolbar.style.display = 'none';

                    // 2. Esconde o botão "Relatório Histórico" lá em cima
                    const btnRelatorio = documentClone.querySelector('.btn-relatorio-topo') as HTMLElement;
                    if (btnRelatorio) btnRelatorio.style.display = 'none';

                    // 3. Adiciona um subtítulo com a data
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
            const isAtivo = String(func.ativo) === 'true' || func.ativo === true;
            const matchStatus = filtroStatus === 'todos' ? true : (filtroStatus === 'ativos' ? isAtivo : !isAtivo);
            const dataStr = func.data_admissao ? String(func.data_admissao) : '';
            const matchData = !filtroDataAdmissao || dataStr.includes(filtroDataAdmissao);
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
    
    const totalAtivos = funcionarios.filter(f => String(f.ativo) === 'true' || f.ativo === true).length;
    const custoFolha = funcionarios.filter(f => String(f.ativo) === 'true' || f.ativo === true).reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);
    const custoProducao = funcionarios.filter(f => (String(f.ativo) === 'true' || f.ativo === true) && f.setor === 'producao').reduce((acc, f) => acc + (Number(f.custo_total_mensal) || 0), 0);

    const handleNovo = () => { setFuncionarioEdicao(null); setModalAberto(true); };
    const handleEditar = (f: Funcionario) => { setFuncionarioEdicao(f); setModalAberto(true); };
    
    const limparFiltros = () => {
        setTermoBusca(''); setFiltroSetor('todos'); setFiltroStatus('ativos');
        setFiltroDataAdmissao(''); setOrdenarPor('nome'); setDirecaoOrdem('asc');
        recarregarLista(); 
    };

    return (
        // ADICIONEI A REF AQUI PARA CAPTURAR TUDO
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
                
                {/* Adicionei a classe 'btn-relatorio-topo' para poder esconder no PDF */}
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

            {/* A Toolbar será escondida automaticamente no PDF */}
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
                        
                        {/* BOTÃO DE DOWNLOAD PDF ATUALIZADO */}
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

            {modalRelatorioAberto && (
                <ModalRelatorioCusto
                    onClose={() => setModalRelatorioAberto(false)}
                    onBuscar={buscarRelatorio}
                />
            )}
        </div>
    );
}