import { useState, useEffect } from 'react';
import { 
    Users, Save, Trash2, Edit2, ChevronDown, ChevronUp, 
    Wallet, CheckCircle, PauseCircle, Briefcase, Search, Plus, X, Download, ArrowUpDown, RotateCcw
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
  decimo_terceiro: string;
  ferias: string;
  um_terco_ferias: string;
  inss: string;
  multa_fgts: string;
}

// Tipagem para evitar erros de 'any'
type TipoFiltroSetor = 'todos' | 'producao' | 'administrativo';
type TipoFiltroStatus = 'todos' | 'ativos' | 'inativos';
type TipoSetor = 'producao' | 'administrativo';
type SortConfig = { key: keyof Funcionario | 'custo'; direction: 'asc' | 'desc' } | null;

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [versaoDados, setVersaoDados] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DE CONTROLE ---
  const [modalAberto, setModalAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroSetor, setFiltroSetor] = useState<TipoFiltroSetor>('todos');
  const [filtroStatus, setFiltroStatus] = useState<TipoFiltroStatus>('ativos');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // --- FORMULÁRIO ---
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [salario, setSalario] = useState('');
  const [epi, setEpi] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [setor, setSetor] = useState<TipoSetor>('producao');
  
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [idExpandido, setIdExpandido] = useState<number | null>(null);

  const API_URL = 'http://localhost:3000/funcionarios';

  // --- CARREGAMENTO ---
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

  // --- PROCESSAMENTO (Filtro + Ordenação) ---
  const dadosProcessados = () => {
      // 1. Filtrar
      const resultado = funcionarios.filter(func => {
          const textoMatch = func.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
                             (func.funcao || '').toLowerCase().includes(termoBusca.toLowerCase());
          const setorMatch = filtroSetor === 'todos' || func.setor === filtroSetor;
          let statusMatch = true;
          if (filtroStatus === 'ativos') statusMatch = func.ativo === true;
          if (filtroStatus === 'inativos') statusMatch = func.ativo === false;
          return textoMatch && setorMatch && statusMatch;
      });

      // 2. Ordenar
      if (sortConfig !== null) {
          resultado.sort((a, b) => {
              const key = sortConfig.key as keyof Funcionario;
              const aValue = a[key];
              const bValue = b[key];

              if (['custo_total_mensal', 'salario_base', 'id'].includes(key)) {
                  const numA = Number(aValue);
                  const numB = Number(bValue);
                  return (numA - numB) * (sortConfig.direction === 'asc' ? 1 : -1);
              } 
              
              const strA = String(aValue || '').toLowerCase();
              const strB = String(bValue || '').toLowerCase();

              if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
              if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return resultado;
  };

  const listaExibicao = dadosProcessados();

  // --- HELPER: Limpar Filtros ---
  function limparFiltros() {
      setTermoBusca('');
      setFiltroSetor('todos');
      setFiltroStatus('ativos'); // Volta para o padrão "apenas ativos"
      setSortConfig(null);
  }

  // --- HELPER: Ordenação ao Clicar ---
  const handleSort = (key: keyof Funcionario) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  // --- HELPER: Iniciais do Nome ---
  function getIniciais(nome: string) {
      const partes = nome.trim().split(' ');
      if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  // --- KPIs ---
  const custoFolhaAtiva = funcionarios
    .filter(f => f.ativo)
    .reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);

  const custoProducaoAtiva = funcionarios
    .filter(f => f.ativo && f.setor === 'producao')
    .reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);

  // --- AÇÕES DO MODAL ---
  function abrirModalNovo() { limparForm(); setModalAberto(true); }
  
  function abrirModalEditar(func: Funcionario) {
      setIdEditando(func.id); setNome(func.nome); setFuncao(func.funcao || '');
      setSalario(func.salario_base); setEpi(func.epi); setAtivo(func.ativo);
      setSetor((func.setor === 'administrativo' ? 'administrativo' : 'producao'));
      setModalAberto(true);
  }

  function fecharModal() { setModalAberto(false); limparForm(); }
  
  function limparForm() {
    setIdEditando(null); setNome(''); setFuncao(''); setSalario(''); setEpi('');
    setAtivo(true); setSetor('producao');
  }

  // --- CRUD ---
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !salario) return alert("Preencha nome e salário!");
    const corpo = { nome, funcao, salario: Number(salario), epi: Number(epi), ativo, setor };
    
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
      const cabecalho = "Nome,Funcao,Setor,Status,SalarioBase,CustoMensal\n";
      const linhas = listaExibicao.map(f => 
          `${f.nome},${f.funcao},${f.setor},${f.ativo ? 'Ativo' : 'Inativo'},"${f.salario_base}","${f.custo_total_mensal}"`
      ).join("\n");
      const blob = new Blob([cabecalho + linhas], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'funcionarios_denarius.csv'; a.click();
  }

  const BRL = (v: string | number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
                <div className="info-extra">Base para Custo Hora ou Dia</div>
            </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
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

            {/* BOTÃO LIMPAR FILTROS */}
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
                    
                    {/* Headers Ordenáveis */}
                    <th className="sortable" onClick={() => handleSort('nome')}>
                        <div className="th-content">Colaborador <ArrowUpDown size={14} color="#94a3b8"/></div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('setor')}>
                        <div className="th-content">Setor <ArrowUpDown size={14} color="#94a3b8"/></div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('salario_base')}>
                        <div className="th-content">Salário Base <ArrowUpDown size={14} color="#94a3b8"/></div>
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
                            <td><div className="skeleton skeleton-text" style={{width:'100px'}}></div></td>
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
                                <td style={{color:'#64748b'}}>{BRL(func.salario_base)}</td>
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
                            {/* Detalhes Expandidos */}
                            {idExpandido === func.id && (
                                <tr className="row-detalhes"><td colSpan={6}>
                                    <div className="detalhes-grid">
                                        <div className="detalhe-item"><span>13º Salário</span><span>{BRL(func.decimo_terceiro)}</span></div>
                                        <div className="detalhe-item"><span>Férias</span><span>{BRL(func.ferias)}</span></div>
                                        <div className="detalhe-item"><span>1/3 Férias</span><span>{BRL(func.um_terco_ferias)}</span></div>
                                        <div className="detalhe-item"><span>Encargos (INSS)</span><span>{BRL(func.inss)}</span></div>
                                        <div className="detalhe-item"><span>Multa FGTS</span><span>{BRL(func.multa_fgts)}</span></div>
                                        <div className="detalhe-item"><span>EPI/Vale</span><span>{BRL(func.epi)}</span></div>
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
                    <div className="form-row-bottom">
                        <div className="input-group"><label>Setor</label><select value={setor} onChange={e => setSetor(e.target.value as TipoSetor)}><option value="producao">🛠️ Produção (Fábrica)</option><option value="administrativo">💻 Administrativo (Escritório)</option></select></div>
                        <div className="input-group"><label>Status</label><select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}><option value="true">✅ Ativo (Trabalhando)</option><option value="false">⛔ Inativo / Afastado</option></select></div>
                    </div>
                    <div className="btn-container-modal"><button type="submit" className="btn-salvar"><Save size={18} /> {idEditando ? 'Salvar Alterações' : 'Cadastrar'}</button></div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}