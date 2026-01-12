import { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, Plus, Trash2, Edit2, Save, PieChart, 
    X, DollarSign, Search, ArrowUpAZ, ArrowDownZA, ArrowUp10, ArrowDown01, Filter, RotateCcw 
} from 'lucide-react';
import './Financeiro.css';

interface ItemFinanceiro {
  id: number;
  nome: string;
  valor: string | number;
}

type TipoModal = 'despesa' | 'investimento' | 'faturamento';
type ViewMode = 'despesas' | 'investimentos';

// Tipos para os filtros
type SortField = 'nome' | 'valor';
type SortDirection = 'asc' | 'desc';

export function Financeiro() {
  // --- DADOS ---
  const [faturamento, setFaturamento] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalInvestimentos, setTotalInvestimentos] = useState(0);
  const [taxaFixa, setTaxaFixa] = useState(0);

  const [listaDespesas, setListaDespesas] = useState<ItemFinanceiro[]>([]);
  const [listaInvestimentos, setListaInvestimentos] = useState<ItemFinanceiro[]>([]);

  // --- ESTADOS DE VISUALIZAÇÃO ---
  const [view, setView] = useState<ViewMode>('despesas');
  const [termoBusca, setTermoBusca] = useState('');
  
  // --- ESTADOS DE ORDENAÇÃO ---
  const [campoOrdenacao, setCampoOrdenacao] = useState<SortField>('nome');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<SortDirection>('asc');

  // --- ESTADOS DE CONTROLE (MODAL) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoModal, setTipoModal] = useState<TipoModal>('despesa');
  const [idEditando, setIdEditando] = useState<number | null>(null);
  
  const [nomeInput, setNomeInput] = useState('');
  const [valorInput, setValorInput] = useState('');
  const [versaoDados, setVersaoDados] = useState(0);

  // --- CARREGAMENTO ---
  useEffect(() => {
    async function carregar() {
      try {
        const resDash = await fetch('http://localhost:3000/financeiro/dashboard');
        const d = await resDash.json();
        setFaturamento(Number(d.faturamento || 0));
        setTotalDespesas(Number(d.totalDespesas || 0));
        setTotalInvestimentos(Number(d.totalInvestimentos || 0));
        setTaxaFixa(Number(d.taxaCustoFixo || 0));

        const resDesp = await fetch('http://localhost:3000/financeiro/despesas');
        setListaDespesas(await resDesp.json());

        const resInv = await fetch('http://localhost:3000/financeiro/investimentos');
        setListaInvestimentos(await resInv.json());
      } catch (error) { console.error("Erro Financeiro:", error); }
    }
    carregar();
  }, [versaoDados]);

  // --- LÓGICA DE FILTRO E ORDENAÇÃO ---
  const getDadosProcessados = () => {
      // 1. Seleciona a lista base
      const listaBase = view === 'despesas' ? listaDespesas : listaInvestimentos;

      // 2. Filtra por busca
      const filtrados = listaBase.filter(item => 
          item.nome.toLowerCase().includes(termoBusca.toLowerCase())
      );

      // 3. Ordena
      return filtrados.sort((a, b) => {
          const rawA = a[campoOrdenacao];
          const rawB = b[campoOrdenacao];

          if (campoOrdenacao === 'valor') {
              const valA = Number(rawA);
              const valB = Number(rawB);
              return (valA - valB) * (direcaoOrdenacao === 'asc' ? 1 : -1);
          } 
          
          const strA = String(rawA).toLowerCase();
          const strB = String(rawB).toLowerCase();

          if (strA < strB) return direcaoOrdenacao === 'asc' ? -1 : 1;
          if (strA > strB) return direcaoOrdenacao === 'asc' ? 1 : -1;
          return 0;
      });
  };

  const listaExibicao = getDadosProcessados();
  const totalExibido = listaExibicao.reduce((acc, item) => acc + Number(item.valor), 0);

  // --- NOVA FUNÇÃO: LIMPAR FILTROS ---
  function limparFiltros() {
      setTermoBusca('');
      setCampoOrdenacao('nome');
      setDirecaoOrdenacao('asc');
  }

  // --- AÇÕES ---
  function abrirModalNovo(tipo: TipoModal) {
      setTipoModal(tipo);
      setIdEditando(null);
      setNomeInput('');
      setValorInput(tipo === 'faturamento' ? String(faturamento) : '');
      setModalOpen(true);
  }

  function abrirModalEditar(item: ItemFinanceiro) {
      const tipo = view === 'despesas' ? 'despesa' : 'investimento';
      setTipoModal(tipo);
      setIdEditando(item.id);
      setNomeInput(item.nome);
      setValorInput(String(item.valor));
      setModalOpen(true);
  }

  function fecharModal() { setModalOpen(false); setIdEditando(null); }

  async function handleSalvar() {
      if (!valorInput) return alert("Digite um valor!");
      try {
          if (tipoModal === 'faturamento') {
              await fetch('http://localhost:3000/financeiro/config', {
                  method: 'PUT', headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ faturamento: Number(valorInput) })
              });
          } else {
              if (!nomeInput) return alert("Digite um nome!");
              const rota = tipoModal === 'despesa' ? 'despesas' : 'investimentos';
              const metodo = idEditando ? 'PUT' : 'POST';
              const url = idEditando 
                  ? `http://localhost:3000/financeiro/${rota}/${idEditando}`
                  : `http://localhost:3000/financeiro/${rota}`;

              await fetch(url, {
                  method: metodo, headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ nome: nomeInput, valor: Number(valorInput) })
              });
          }
          setVersaoDados(v => v + 1);
          fecharModal();
      } catch (error) { console.error("Erro ao salvar:", error); }
  }

  async function excluir(id: number) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const rota = view === 'despesas' ? 'despesas' : 'investimentos';
    await fetch(`http://localhost:3000/financeiro/${rota}/${id}`, { method: 'DELETE' });
    setVersaoDados(v => v + 1);
  }

  // --- HELPERS VISUAIS ---
  const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const corTema = view === 'despesas' ? '#ef4444' : '#8b5cf6';
  const getCorTaxa = () => {
      if (taxaFixa > 30) return '#ef4444'; 
      if (taxaFixa > 15) return '#f59e0b'; 
      return '#22c55e';
  };

  return (
    <div className="financeiro-container">
      <h1>Gestão Financeira 💰</h1>

      {/* --- DASHBOARD --- */}
      <div className="resumo-grid">
        <div className="resumo-card card-azul" onClick={() => abrirModalNovo('faturamento')}>
            <div className="card-info">
                <h3>Faturamento Mensal</h3>
                <p style={{color:'#1e293b'}}>{BRL(faturamento)}</p>
                <small>Clique para editar</small>
            </div>
            <button className="card-edit-btn"><Edit2 size={20}/></button>
        </div>

        <div className="resumo-card card-vermelho" onClick={() => setView('despesas')} style={{opacity: view === 'despesas' ? 1 : 0.7}}>
            <div className="card-info">
                <h3>Despesas Fixas</h3>
                <p style={{color:'#ef4444'}}>{BRL(totalDespesas)}</p>
                <small>{listaDespesas.length} registros</small>
            </div>
            <TrendingDown size={28} color="#ef4444"/>
        </div>

        <div className="resumo-card card-roxo" onClick={() => setView('investimentos')} style={{opacity: view === 'investimentos' ? 1 : 0.7}}>
            <div className="card-info">
                <h3>Investimentos</h3>
                <p style={{color:'#8b5cf6'}}>{BRL(totalInvestimentos)}</p>
                <small>{listaInvestimentos.length} registros</small>
            </div>
            <PieChart size={28} color="#8b5cf6"/>
        </div>

        <div className="resumo-card card-laranja">
            <div className="card-info" style={{width:'100%'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h3>Taxa Custo Fixo</h3>
                    <TrendingUp size={20} color={getCorTaxa()}/>
                </div>
                <p style={{color: getCorTaxa()}}>{taxaFixa.toFixed(2)}%</p>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${Math.min(taxaFixa, 100)}%`, backgroundColor: getCorTaxa() }} />
                </div>
            </div>
        </div>
      </div>

      {/* --- ÁREA DE CONTEÚDO --- */}
      <div className="content-area">
          
          {/* 1. Abas */}
          <div className="tabs-header">
              <button 
                className={`tab-btn ${view === 'despesas' ? 'active' : ''}`}
                onClick={() => setView('despesas')}
                style={{color: view === 'despesas' ? '#ef4444' : ''}}
              >
                  <TrendingDown size={18}/> Despesas Fixas
              </button>
              <button 
                className={`tab-btn ${view === 'investimentos' ? 'active' : ''}`}
                onClick={() => setView('investimentos')}
                style={{color: view === 'investimentos' ? '#8b5cf6' : ''}}
              >
                  <PieChart size={18}/> Investimentos
              </button>
          </div>

          {/* 2. Toolbar */}
          <div className="toolbar-financeiro">
              <div className="search-box">
                  <Search size={18} color="#94a3b8"/>
                  <input placeholder={`Buscar em ${view}...`} value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
              </div>

              <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                  
                  {/* Filtros */}
                  <div className="filter-wrapper">
                      <Filter size={16} color="#64748b"/>
                      <select className="filter-select-mini" value={campoOrdenacao} onChange={e => setCampoOrdenacao(e.target.value as SortField)}>
                          <option value="nome">Por Nome</option>
                          <option value="valor">Por Valor</option>
                      </select>
                  </div>

                  <div className="filter-wrapper">
                      {campoOrdenacao === 'nome' 
                        ? (direcaoOrdenacao === 'asc' ? <ArrowUpAZ size={16} color="#64748b"/> : <ArrowDownZA size={16} color="#64748b"/>)
                        : (direcaoOrdenacao === 'asc' ? <ArrowUp10 size={16} color="#64748b"/> : <ArrowDown01 size={16} color="#64748b"/>)
                      }
                      <select className="filter-select-mini" value={direcaoOrdenacao} onChange={e => setDirecaoOrdenacao(e.target.value as SortDirection)}>
                          <option value="asc">{campoOrdenacao === 'nome' ? 'A → Z' : 'Menor → Maior'}</option>
                          <option value="desc">{campoOrdenacao === 'nome' ? 'Z → A' : 'Maior → Menor'}</option>
                      </select>
                  </div>

                  {/* NOVO: Botão Limpar Filtros */}
                  <button className="btn-reset" onClick={limparFiltros} title="Limpar Filtros (Resetar)">
                      <RotateCcw size={18}/>
                  </button>

                  <div className="separator-vertical"></div>

                  <button 
                    className="btn-add-main" 
                    style={{backgroundColor: corTema}}
                    onClick={() => abrirModalNovo(view === 'despesas' ? 'despesa' : 'investimento')}
                  >
                      <Plus size={18}/> Novo
                  </button>
              </div>
          </div>

          {/* 3. Lista */}
          <div className="lista-scroll">
              {listaExibicao.length === 0 ? (
                  <div style={{textAlign:'center', padding:'50px', color:'#cbd5e1'}}>
                      {termoBusca ? 'Nenhum item encontrado para esta busca.' : 'Nenhum item cadastrado.'}
                  </div>
              ) : (
                  listaExibicao.map(item => (
                      <div key={item.id} className="lista-item">
                          <div className="item-left">
                              <span className="item-nome">{item.nome}</span>
                              <span className="item-sub">ID: #{item.id}</span>
                          </div>
                          <div className="item-right">
                              <span className="item-valor" style={{color: corTema}}>{BRL(Number(item.valor))}</span>
                              <div className="acoes-item">
                                  <button className="btn-icon-sm btn-edit" onClick={() => abrirModalEditar(item)}><Edit2 size={16}/></button>
                                  <button className="btn-icon-sm btn-del" onClick={() => excluir(item.id)}><Trash2 size={16}/></button>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>

          {/* 4. Rodapé */}
          <div className="lista-footer">
              <span className="footer-label">Total Listado</span>
              <span className="footer-valor" style={{color: corTema}}>{BRL(totalExibido)}</span>
          </div>

      </div>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div className="modal-overlay" onClick={fecharModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {tipoModal === 'faturamento' ? <DollarSign size={20} style={{marginRight:8}}/> : 
                         tipoModal === 'despesa' ? <TrendingDown size={20} style={{marginRight:8}}/> : 
                         <PieChart size={20} style={{marginRight:8}}/>}
                        
                        {tipoModal === 'faturamento' ? 'Faturamento Mensal' : 
                         (idEditando ? 'Editar Item' : `Nova ${tipoModal === 'despesa' ? 'Despesa' : 'Aquisição'}`)}
                    </h2>
                    <button className="btn-close" onClick={fecharModal}><X size={24}/></button>
                </div>

                <div className="modal-body">
                    {tipoModal !== 'faturamento' && (
                        <div className="form-group">
                            <label>Descrição</label>
                            <input 
                                type="text" placeholder="Nome do item..." 
                                value={nomeInput} onChange={e => setNomeInput(e.target.value)} autoFocus
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Valor (R$)</label>
                        <input 
                            type="number" placeholder="0.00" 
                            value={valorInput} onChange={e => setValorInput(e.target.value)}
                        />
                    </div>
                    <button className="btn-save-modal" onClick={handleSalvar} style={{
                        backgroundColor: tipoModal === 'despesa' ? '#ef4444' : tipoModal === 'investimento' ? '#8b5cf6' : '#3b82f6'
                    }}>
                        <Save size={18}/> Salvar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}