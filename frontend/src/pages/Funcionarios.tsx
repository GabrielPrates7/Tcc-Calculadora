import { useState, useEffect } from 'react';
import {
    Users, Save, Trash2, Edit2, ChevronDown, ChevronUp,
    Wallet, CheckCircle, PauseCircle, Briefcase, Search, Plus, X, Download, ArrowUpDown, Calendar, AlertCircle, RotateCcw, DollarSign
} from 'lucide-react';
import './Funcionarios.css';

interface Funcionario {
  id: number;
  nome: string;
  funcao?: string;
  salario_base: string;
  epi: string;
  custo_total_mensal: string;
  ativo: boolean;
  setor: 'producao' | 'administrativo';

  // NOVOS CAMPOS
  data_admissao: string;
  data_inativacao?: string;
  motivo_inativacao?: string;

  // Detalhes
  decimo_terceiro: string;
  ferias: string;
  um_terco_ferias: string;
  inss: string;
  multa_fgts: string;
}

// Tipagem auxiliar
type TipoFiltroSetor = 'todos' | 'producao' | 'administrativo';
type TipoFiltroStatus = 'todos' | 'ativos' | 'inativos';
type TipoSetor = 'producao' | 'administrativo';
type SortConfig = { key: keyof Funcionario | 'custo'; direction: 'asc' | 'desc' } | null;

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [versaoDados, setVersaoDados] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Controle
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroSetor, setFiltroSetor] = useState<TipoFiltroSetor>('todos');
  const [filtroStatus, setFiltroStatus] = useState<TipoFiltroStatus>('ativos');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // --- STATES RELATÓRIO HISTÓRICO ---
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [dataInicioRel, setDataInicioRel] = useState('');
  const [dataFimRel, setDataFimRel] = useState('');

  // MUDANÇA: Agora o resultado é uma lista de funcionários ou null
  const [listaRelatorio, setListaRelatorio] = useState<Funcionario[] | null>(null);
  const [loadingRel, setLoadingRel] = useState(false);

  // --- FORMULÁRIO ---
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [salario, setSalario] = useState('');
  const [epi, setEpi] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [setor, setSetor] = useState<TipoSetor>('producao');

  // Novos Inputs
  const [dataAdmissao, setDataAdmissao] = useState('');
  const [dataInativacao, setDataInativacao] = useState('');
  const [motivoInativacao, setMotivoInativacao] = useState('');

  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [idExpandido, setIdExpandido] = useState<number | null>(null);

  const API_URL = 'http://localhost:3000/funcionarios';

  // Helper de Data (Visualização)
  const formatarDataBR = (dataISO: string) => {
      if (!dataISO) return '-';
      const [ano, mes, dia] = dataISO.split('T')[0].split('-');
      return `${dia}/${mes}/${ano}`;
  };

  // Helper para Input Date (Valor)
  const formatarDataInput = (dataISO: string) => {
      if (!dataISO) return '';
      return dataISO.split('T')[0];
  }

  // Helper de Moeda
  const BRL = (v: string | number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    async function carregar() {
      setIsLoading(true);
      try {
        const res = await fetch(API_URL);
        const dados = await res.json();
        setFuncionarios(dados);
      } catch (error) { console.error("Erro:", error); }
      finally { setIsLoading(false); }
    }
    carregar();
  }, [versaoDados]);

  // --- BUSCAR RELATÓRIO ---
  async function handleBuscarRelatorio() {
      if (!dataInicioRel || !dataFimRel) return alert("Selecione data de início e fim.");

      setLoadingRel(true);
      try {
          const query = new URLSearchParams({ inicio: dataInicioRel, fim: dataFimRel }).toString();
          const res = await fetch(`${API_URL}/relatorio?${query}`);
          const dados = await res.json();

          // O backend agora retorna um Array. Salvamos direto.
          setListaRelatorio(dados);
      } catch (error) {
          console.error("Erro relatório:", error);
      } finally {
          setLoadingRel(false);
      }
  }

  // Helper para somar o total do relatório no frontend
  const totalCustoRelatorio = listaRelatorio
      ? listaRelatorio.reduce((acc, curr) => acc + Number(curr.custo_total_mensal), 0)
      : 0;

  // --- LÓGICA DE FILTRAGEM E ORDENAÇÃO ---
  const dadosProcessados = () => {
      const resultado = funcionarios.filter(func => {
          const textoMatch = func.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                             (func.funcao || '').toLowerCase().includes(termoBusca.toLowerCase());
          const setorMatch = filtroSetor === 'todos' || func.setor === filtroSetor;
          let statusMatch = true;
          if (filtroStatus === 'ativos') statusMatch = func.ativo === true;
          if (filtroStatus === 'inativos') statusMatch = func.ativo === false;
          return textoMatch && setorMatch && statusMatch;
      });

      if (sortConfig !== null) {
          resultado.sort((a, b) => {
              const key = sortConfig.key as keyof Funcionario;
              const rawA = a[key];
              const rawB = b[key];

              if (key === 'data_admissao') {
                  const timeA = new Date(String(rawA)).getTime();
                  const timeB = new Date(String(rawB)).getTime();
                  return (timeA - timeB) * (sortConfig.direction === 'asc' ? 1 : -1);
              }

              if (['custo_total_mensal', 'salario_base', 'id'].includes(key)) {
                  const numA = Number(rawA);
                  const numB = Number(rawB);
                  return (numA - numB) * (sortConfig.direction === 'asc' ? 1 : -1);
              }

              const strA = String(rawA || '').toLowerCase();
              const strB = String(rawB || '').toLowerCase();

              if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return resultado;
  };

  const listaExibicao = dadosProcessados();

  // --- HELPERS ---
  const limparFiltros = () => {
      setTermoBusca('');
      setFiltroSetor('todos');
      setFiltroStatus('ativos');
      setSortConfig(null);
  };

  const handleSort = (key: keyof Funcionario) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  function getIniciais(nome: string) {
      const partes = nome.trim().split(' ');
      if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  const custoFolhaAtiva = funcionarios.filter(f => f.ativo).reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);
  const custoProducaoAtiva = funcionarios.filter(f => f.ativo && f.setor === 'producao').reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);

  // --- MODAL ---
  function abrirModalNovo() {
      limparForm();
      setDataAdmissao(new Date().toISOString().split('T')[0]);
      setModalAberto(true);
  }

  function abrirModalEditar(func: Funcionario) {
      setIdEditando(func.id); setNome(func.nome); setFuncao(func.funcao || '');
      setSalario(func.salario_base); setEpi(func.epi); setAtivo(func.ativo);
      setSetor((func.setor === 'administrativo' ? 'administrativo' : 'producao'));

      setDataAdmissao(formatarDataInput(func.data_admissao));
      setDataInativacao(formatarDataInput(func.data_inativacao || ''));
      setMotivoInativacao(func.motivo_inativacao || '');

      setModalAberto(true);
  }

  function fecharModal() { setModalAberto(false); limparForm(); }

  function limparForm() {
    setIdEditando(null); setNome(''); setFuncao(''); setSalario(''); setEpi('');
    setAtivo(true); setSetor('producao');
    setDataAdmissao(''); setDataInativacao(''); setMotivoInativacao('');
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !salario) return alert("Preencha nome e salário!");

    if (!ativo && (!dataInativacao || !motivoInativacao)) {
        return alert("Para inativar, preencha a Data de Saída e o Motivo.");
    }

    const corpo = {
        nome, funcao, salario: Number(salario), epi: Number(epi), ativo, setor,
        data_admissao: dataAdmissao,
        data_inativacao: !ativo ? dataInativacao : null,
        motivo_inativacao: !ativo ? motivoInativacao : null
    };

    try {
      const url = idEditando ? `${API_URL}/${idEditando}` : API_URL;
      const method = idEditando ? 'PUT' : 'POST';
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
      fecharModal();
      setVersaoDados(v => v + 1);
    } catch (error) { console.error(error); }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir funcionário?")) return;
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setVersaoDados(v => v + 1);
  }

  function exportarCSV() {
      const cabecalho = "Nome,Funcao,Setor,Status,Admissao,Saida,Motivo,CustoMensal\n";
      const linhas = listaExibicao.map(f =>
          `${f.nome},${f.funcao},${f.setor},${f.ativo ? 'Ativo' : 'Inativo'},${formatarDataBR(f.data_admissao)},${formatarDataBR(f.data_inativacao || '')},"${f.motivo_inativacao || ''}","${f.custo_total_mensal}"`
      ).join("\n");
      const blob = new Blob([cabecalho + linhas], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'funcionarios_denarius.csv'; a.click();
  }

  return (
    <div className="funcionarios-container">
      {/* CABEÇALHO */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px'}}>
        <h1>Gestão de Equipe 👥</h1>
        <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
            <div className="card-resumo-mini">
                <small><Wallet size={16}/> Folha Mensal (Ativa)</small>
                <div className="valor">{isLoading ? <span className="skeleton skeleton-text" style={{width:'100px'}}></span> : BRL(custoFolhaAtiva)}</div>
                <div className="info-extra" style={{color:'#94a3b8', fontWeight:'normal', fontSize:'0.7rem'}}>Produção + Admin</div>
            </div>
            <div className="card-resumo-mini destaque">
                <small><Briefcase size={16}/> Custo Produção (Ativa)</small>
                <div className="valor">{isLoading ? <span className="skeleton skeleton-text" style={{width:'100px'}}></span> : BRL(custoProducaoAtiva)}</div>
                <div className="info-extra">Base para Custo Hora</div>
            </div>
        </div>
      </div>

      {/* --- NOVO: PAINEL DE RELATÓRIO HISTÓRICO (Accordion) --- */}
      <div className="card-filtro-custo" style={{
          backgroundColor: '#1e293b',
          padding: relatorioAberto ? '20px' : '15px 20px', // Padding menor se fechado
          borderRadius: '8px',
          marginTop: '24px',
          border: '1px solid #334155',
          transition: 'all 0.2s ease'
      }}>
        {/* CABEÇALHO DO ACCORDION (CLICÁVEL) */}
        <div
            onClick={() => setRelatorioAberto(!relatorioAberto)}
            style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none'
            }}
        >
            <h3 style={{color: '#f8fafc', display: 'flex', gap: '8px', alignItems: 'center', margin: 0, fontSize: '1rem'}}>
                <Calendar size={20} color="#3b82f6"/>
                Custo de Produção Histórico (Filtro por Período)
            </h3>
            {/* Seta indicando estado */}
            {relatorioAberto ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
        </div>

        {/* CONTEÚDO DO ACCORDION (SÓ APARECE SE ABERTO) */}
        {relatorioAberto && (
            <div style={{animation: 'fadeIn 0.3s ease'}}>
                {/* Inputs de Data */}
                <div style={{display: 'flex', gap: '16px', alignItems: 'flex-end', marginTop: '16px', flexWrap: 'wrap'}}>
                    <div>
                        <label style={{display:'block', color:'#94a3b8', fontSize:'0.9rem', marginBottom:'4px'}}>De:</label>
                        <input type="date" value={dataInicioRel} onChange={e => setDataInicioRel(e.target.value)} />
                    </div>
                    <div>
                        <label style={{display:'block', color:'#94a3b8', fontSize:'0.9rem', marginBottom:'4px'}}>Até:</label>
                        <input type="date" value={dataFimRel} onChange={e => setDataFimRel(e.target.value)} />
                    </div>
                    <button
                        onClick={handleBuscarRelatorio}
                        disabled={loadingRel}
                        style={{
                            backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', borderRadius: '4px',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                        }}
                    >
                        <Search size={18} /> {loadingRel ? 'Calculando...' : 'Filtrar'}
                    </button>
                </div>

                {/* RESULTADO DO FILTRO */}
                {listaRelatorio && (
                    <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #334155'}}>
                        {/* RESUMO DOS NÚMEROS */}
                        <div style={{display:'flex', gap:'30px', marginBottom: '20px'}}>
                            <div>
                                <span style={{color: '#94a3b8', fontSize:'0.9rem'}}>Colaboradores Ativos na Época:</span>
                                <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc'}}>{listaRelatorio.length}</div>
                            </div>
                            <div>
                                <span style={{color: '#94a3b8', fontSize:'0.9rem'}}>Custo Produção Mensal (Na Época):</span>
                                <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e', display: 'flex', alignItems: 'center'}}>
                                    <DollarSign size={20}/>
                                    {totalCustoRelatorio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </div>
                            </div>
                        </div>

                        {/* TABELA DE DETALHES (A JANELINHA) */}
                        {listaRelatorio.length > 0 && (
                            <details style={{backgroundColor: '#0f172a', borderRadius: '6px', padding: '10px', border: '1px solid #334155'}}>
                                <summary style={{cursor: 'pointer', color: '#3b82f6', fontWeight: '600', fontSize: '0.9rem'}}>
                                    Ver Lista Detalhada ({listaRelatorio.length} pessoas)
                                </summary>
                                <div style={{marginTop: '10px', maxHeight: '200px', overflowY: 'auto'}}>
                                    <table style={{width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse'}}>
                                        <thead>
                                            <tr style={{textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid #334155'}}>
                                                <th style={{padding: '8px'}}>Nome</th>
                                                <th style={{padding: '8px'}}>Função</th>
                                                <th style={{padding: '8px'}}>Custo na Época</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listaRelatorio.map((func) => (
                                                <tr key={func.id} style={{borderBottom: '1px solid #1e293b'}}>
                                                    <td style={{padding: '8px', color: '#e2e8f0'}}>{func.nome}</td>
                                                    <td style={{padding: '8px', color: '#94a3b8'}}>{func.funcao}</td>
                                                    <td style={{padding: '8px', color: '#cbd5e1'}}>{BRL(func.custo_total_mensal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="toolbar" style={{marginTop:'24px'}}>
          <div className="search-group">
              <Search size={18} color="#94a3b8"/>
              <input placeholder="Buscar por nome ou função..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)}/>
          </div>
          <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
            <div className="filter-group">
                <select value={filtroSetor} onChange={e => setFiltroSetor(e.target.value as TipoFiltroSetor)}>
                    <option value="todos">🏭 Todos os Setores</option>
                    <option value="producao">🛠️ Produção</option>
                    <option value="administrativo">💻 Administrativo</option>
                </select>
            </div>
            <div className="filter-group">
                <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as TipoFiltroStatus)}>
                    <option value="todos">🌗 Todos Status</option>
                    <option value="ativos">✅ Apenas Ativos</option>
                    <option value="inativos">⛔ Apenas Inativos</option>
                </select>
            </div>

            <button className="btn-reset" onClick={limparFiltros} title="Limpar Filtros">
                <RotateCcw size={18}/>
            </button>

            <button className="btn-icon btn-expand" onClick={exportarCSV} title="Exportar CSV" style={{background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', width:'40px', height:'40px'}}><Download size={18}/></button>
            <button className="btn-novo" onClick={abrirModalNovo}><Plus size={20}/> Novo Colaborador</button>
          </div>
      </div>

      {/* TABELA */}
      <div className="card-lista">
        <table>
            <thead>
                <tr>
                    <th style={{width:'50px', textAlign:'center'}}>Status</th>

                    <th className="sortable" onClick={() => handleSort('nome')}>
                        <div className="th-content">Colaborador <ArrowUpDown size={14} color="#94a3b8"/></div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('setor')}>
                        <div className="th-content">Setor <ArrowUpDown size={14} color="#94a3b8"/></div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('data_admissao')}>
                        <div className="th-content">Admissão <Calendar size={14} color="#94a3b8"/></div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('custo_total_mensal')}>
                        <div className="th-content">Custo Mensal <ArrowUpDown size={14} color="#94a3b8"/></div>
                    </th>

                    <th style={{width:'120px', textAlign:'center'}}>Ações</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    [1,2,3].map(i => (
                        <tr key={i}>
                            <td><span className="skeleton skeleton-avatar" style={{width:'24px', height:'24px'}}></span></td>
                            <td><div style={{display:'flex', alignItems:'center'}}><div className="skeleton skeleton-avatar" style={{marginRight:'10px'}}></div><div className="skeleton skeleton-text" style={{width:'150px'}}></div></div></td>
                            <td><div className="skeleton skeleton-text" style={{width:'80px'}}></div></td>
                            <td><div className="skeleton skeleton-text" style={{width:'80px'}}></div></td>
                            <td><div className="skeleton skeleton-text" style={{width:'100px'}}></div></td>
                            <td></td>
                        </tr>
                    ))
                ) : listaExibicao.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>Nenhum colaborador encontrado.</td></tr>
                ) : (
                    listaExibicao.map(func => (
                        <>
                            <tr key={func.id} style={{backgroundColor: idExpandido === func.id ? '#eff6ff' : 'transparent', opacity: func.ativo ? 1 : 0.6}}>
                                <td style={{textAlign:'center'}}>
                                    {func.ativo
                                        ? <div title="Ativo"><CheckCircle size={22} color="#16a34a" fill="#dcfce7"/></div>
                                        : <div title="Inativo"><PauseCircle size={22} color="#ef4444" fill="#fee2e2"/></div>
                                    }
                                </td>
                                <td>
                                    <div className="colaborador-info">
                                        <div className="avatar-circle" style={{backgroundColor: func.ativo ? '#3b82f6' : '#94a3b8'}}>
                                            {getIniciais(func.nome)}
                                        </div>
                                        <div>
                                            <div style={{fontWeight:'700', color:'#1e293b', fontSize:'1.05rem'}}>{func.nome}</div>
                                            <div style={{fontSize:'0.85rem', color:'#64748b'}}>{func.funcao}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge-setor ${func.setor}`}>
                                        {func.setor === 'producao' ? 'Produção' : 'Admin'}
                                    </span>
                                </td>

                                <td style={{color:'#64748b', fontSize:'0.9rem'}}>{formatarDataBR(func.data_admissao)}</td>

                                <td><span className="custo-total-highlight">{BRL(func.custo_total_mensal)}</span></td>
                                <td>
                                    <div className="acoes" style={{justifyContent:'center'}}>
                                        <button className="btn-icon btn-expand" onClick={() => setIdExpandido(idExpandido === func.id ? null : func.id)} title="Ver Detalhes">
                                            {idExpandido === func.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                                        </button>
                                        <button className="btn-icon btn-edit" onClick={() => abrirModalEditar(func)} title="Editar"><Edit2 size={16}/></button>
                                        <button className="btn-icon btn-delete" onClick={() => excluir(func.id)} title="Excluir"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>

                            {idExpandido === func.id && (
                                <tr className="row-detalhes"><td colSpan={6}>
                                    {!func.ativo && (
                                        <div style={{backgroundColor:'#fef2f2', padding:'10px 20px', borderBottom:'1px solid #fee2e2', color:'#b91c1c', display:'flex', gap:'20px', fontSize:'0.9rem'}}>
                                            <span><strong>Inativo desde:</strong> {formatarDataBR(func.data_inativacao || '')}</span>
                                            <span><strong>Motivo:</strong> {func.motivo_inativacao}</span>
                                        </div>
                                    )}
                                    <div className="detalhes-grid">
                                        <div className="detalhe-item"><span>Salário Base</span><span>{BRL(func.salario_base)}</span></div>
                                        <div className="detalhe-item"><span>EPI/Vale</span><span>{BRL(func.epi)}</span></div>
                                        <div className="detalhe-item"><span>13º Salário</span><span>{BRL(func.decimo_terceiro)}</span></div>
                                        <div className="detalhe-item"><span>Férias + 1/3</span><span>{BRL(Number(func.ferias) + Number(func.um_terco_ferias))}</span></div>
                                        <div className="detalhe-item"><span>Encargos (INSS)</span><span>{BRL(func.inss)}</span></div>
                                        <div className="detalhe-item"><span>Multa FGTS</span><span>{BRL(func.multa_fgts)}</span></div>
                                    </div>
                                </td></tr>
                            )}
                        </>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{idEditando ? <Edit2 size={24} color="#3b82f6"/> : <Users size={24} color="#3b82f6"/>} {idEditando ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
                    <button className="btn-close-modal" onClick={fecharModal}><X size={24}/></button>
                </div>
                <form onSubmit={handleSalvar} className="form-funcionario">
                    <div className="form-grid-modal">
                        <div className="input-group"><label>Nome Completo</label><input type="text" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} autoFocus /></div>
                        <div className="input-group"><label>Função / Cargo</label><input type="text" placeholder="Ex: Marceneiro" value={funcao} onChange={e => setFuncao(e.target.value)} /></div>
                        <div className="input-group"><label>Salário Base (R$)</label><input type="number" placeholder="0.00" value={salario} onChange={e => setSalario(e.target.value)} /></div>
                        <div className="input-group"><label>EPI / Vale (R$)</label><input type="number" placeholder="0.00" value={epi} onChange={e => setEpi(e.target.value)} /></div>
                    </div>

                    <div className="form-row-bottom" style={{marginBottom:'10px'}}>
                        <div className="input-group"><label>Setor</label><select value={setor} onChange={e => setSetor(e.target.value as TipoSetor)}><option value="producao">🛠️ Produção (Fábrica)</option><option value="administrativo">💻 Administrativo (Escritório)</option></select></div>
                        <div className="input-group"><label>Status</label><select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}><option value="true">✅ Ativo (Trabalhando)</option><option value="false">⛔ Inativo / Afastado</option></select></div>
                    </div>

                    <div className="form-row-bottom">
                         <div className="input-group">
                             <label>Data Admissão</label>
                             <input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} />
                         </div>

                         {!ativo && (
                            <div className="input-group" style={{gridColumn: '1 / -1', borderTop:'1px dashed #cbd5e1', paddingTop:'15px', marginTop:'5px'}}>
                                <div style={{display:'flex', gap:'8px', color:'#ef4444', fontWeight:'bold', fontSize:'0.9rem', marginBottom:'10px'}}>
                                    <AlertCircle size={16}/> Dados de Saída / Afastamento
                                </div>
                                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                                    <div>
                                        <label style={{color:'#ef4444'}}>Data Saída</label>
                                        <input type="date" value={dataInativacao} onChange={e => setDataInativacao(e.target.value)} style={{borderColor:'#fca5a5', backgroundColor:'#fef2f2'}} />
                                    </div>
                                    <div>
                                        <label style={{color:'#ef4444'}}>Motivo</label>
                                        <select value={motivoInativacao} onChange={e => setMotivoInativacao(e.target.value)} style={{borderColor:'#fca5a5', backgroundColor:'#fef2f2'}}>
                                            <option value="">Selecione...</option>
                                            <option value="Demissão sem justa causa">Demissão sem justa causa</option>
                                            <option value="Demissão com justa causa">Demissão com justa causa</option>
                                            <option value="Pedido de Demissão">Pedido de Demissão</option>
                                            <option value="Fim de Contrato">Fim de Contrato</option>
                                            <option value="Atestado / Doença">Atestado / Doença</option>
                                            <option value="Férias">Férias</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                         )}
                    </div>

                    <div className="btn-container-modal"><button type="submit" className="btn-salvar"><Save size={18} /> {idEditando ? 'Salvar Alterações' : 'Cadastrar'}</button></div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}