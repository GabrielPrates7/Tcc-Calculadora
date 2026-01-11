import { useState, useEffect } from 'react';
import { 
    Calculator, DollarSign, Package, Percent, FileText, 
    Trash2, Save, TrendingUp, Hammer, Building2, Eye, X, Printer, User, Edit2, XCircle 
} from 'lucide-react';
import './Orcamentos.css';

interface Orcamento {
  id?: number;
  cliente: string;
  nome_produto: string;
  custo_materiais: number;
  horas_trabalhadas: number; 
  lucro_desejado: number;
  imposto: number;
  preco_venda: number;
}

export function Orcamentos() {
  // --- INPUTS ---
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [materiais, setMateriais] = useState(0);
  const [tempo, setTempo] = useState(0); 
  const [lucro, setLucro] = useState(30);   
  const [imposto, setImposto] = useState(5); 

  // --- CONTROLE DE EDIÇÃO ---
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // --- DADOS DO SISTEMA ---
  const [valorHora, setValorHora] = useState(0);
  const [taxaFixa, setTaxaFixa] = useState(0);
  
  const [listaOrcamentos, setListaOrcamentos] = useState<Orcamento[]>([]);
  const [versaoDados, setVersaoDados] = useState(0);

  // --- CONTROLE DO MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);

  // --- CÁLCULO EM TEMPO REAL ---
  const custoMaoObra = tempo * valorHora;
  const custoProducao = Number(materiais) + custoMaoObra; 
  
  const taxaFixaReal = Number(taxaFixa) || 0;
  const somaPorcentagens = taxaFixaReal + Number(lucro) + Number(imposto);
  const divisor = 1 - (somaPorcentagens / 100);
  const precoFinal = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;
  const lucroReal = precoFinal * (Number(lucro) / 100);

  // --- EFEITOS ---
  useEffect(() => {
    async function carregarSistema() {
      try {
        const resObra = await fetch('http://localhost:3000/calculo-obra'); 
        const dataObra = await resObra.json();
        setValorHora(Number(dataObra.calculo?.valorUnitario || 0));

        const resFin = await fetch('http://localhost:3000/financeiro/dashboard');
        const dataFin = await resFin.json();
        setTaxaFixa(Number(dataFin.taxaCustoFixo || 0));
      } catch (error) { console.error("Erro ao carregar configs:", error); }
    }
    carregarSistema();
  }, []);

  useEffect(() => {
    async function carregarLista() {
      try {
          const res = await fetch('http://localhost:3000/orcamentos');
          const data = await res.json();
          setListaOrcamentos(data);
      } catch (error) { console.error("Erro lista:", error); }
    }
    carregarLista();
  }, [versaoDados]);

  // --- AÇÕES ---
  
  // 1. Função que preenche o form para editar
  function iniciarEdicao(orc: Orcamento) {
      setIdEditando(orc.id || null);
      setCliente(orc.cliente || '');
      setProduto(orc.nome_produto);
      setMateriais(Number(orc.custo_materiais));
      setTempo(Number(orc.horas_trabalhadas));
      setLucro(Number(orc.lucro_desejado));
      setImposto(Number(orc.imposto));
      
      // Rola a tela para o topo para ver o formulário
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 2. Função para cancelar edição e limpar form
  function limparForm() {
      setIdEditando(null);
      setCliente('');
      setProduto('');
      setMateriais(0);
      setTempo(0);
      setLucro(30); // Volta ao padrão
      setImposto(5); // Volta ao padrão
  }

  // 3. Salvar (Criar ou Atualizar)
  async function handleSalvar() {
    if (!produto) return alert("Digite o nome do produto!");
    if (precoFinal <= 0) return alert("Preço zerado.");

    const payload = {
        cliente: cliente,
        nome_produto: produto,
        custo_materiais: Number(materiais),
        horas_trabalhadas: Number(tempo),
        lucro_desejado: Number(lucro),
        imposto: Number(imposto),
        preco_venda: precoFinal
    };

    try {
        let url = 'http://localhost:3000/orcamentos';
        let method = 'POST';

        // Se estiver editando, muda a rota e o método
        if (idEditando) {
            url = `http://localhost:3000/orcamentos/${idEditando}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method, 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro ao salvar');

        alert(idEditando ? 'Orçamento atualizado!' : 'Orçamento criado!');
        setVersaoDados(v => v + 1);
        limparForm(); // Limpa tudo

    } catch (error) { 
        console.error(error); 
        alert("Erro ao salvar."); 
    }
  }

  async function handleExcluir(id: number) {
      if(!confirm("Tem certeza que deseja apagar?")) return;
      await fetch(`http://localhost:3000/orcamentos/${id}`, { method: 'DELETE' });
      setVersaoDados(v => v + 1);
  }

  function abrirDemonstrativo(orc: Orcamento) {
      setOrcamentoSelecionado(orc);
      setShowModal(true);
  }

  // --- HELPERS ---
  const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const PCT = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

  const getDetalhesOrcamento = () => {
      if (!orcamentoSelecionado) return null;
      const pv = Number(orcamentoSelecionado.preco_venda);
      const mat = Number(orcamentoSelecionado.custo_materiais);
      const impPct = Number(orcamentoSelecionado.imposto);
      const lucPct = Number(orcamentoSelecionado.lucro_desejado);
      const mo = Number(orcamentoSelecionado.horas_trabalhadas) * valorHora;
      const valImposto = pv * (impPct / 100);
      const valLucro = pv * (lucPct / 100);
      const valFixo = pv - (mat + mo + valImposto + valLucro);
      const fixoPct = (valFixo / pv) * 100;
      const matPct = (mat / pv) * 100;
      const moPct = (mo / pv) * 100;
      return { pv, mat, mo, valImposto, valLucro, valFixo, impPct, lucPct, fixoPct, matPct, moPct };
  };
  const det = showModal ? getDetalhesOrcamento() : null;

  return (
    <div className="orcamentos-container">
      <h1>Calculadora de Preços 🏛️</h1>
      
      <div className="orcamento-grid">
        {/* ESQUERDA: CALCULADORA */}
        <div className="card-calculadora">
            <h2>
                {idEditando ? <Edit2 size={22} color="#f97316"/> : <Calculator size={22} color="#f97316"/>} 
                {idEditando ? ' Editar Orçamento' : ' Novo Orçamento'}
            </h2>

            {/* Novo Campo: Cliente */}
            <div className="form-group">
                <label>Cliente</label>
                <div className="input-icon-wrapper">
                    <User size={18} className="input-icon"/>
                    <input type="text" placeholder="Ex: João da Silva" value={cliente} onChange={e => setCliente(e.target.value)} />
                </div>
            </div>

            <div className="form-group">
                <label>Produto</label>
                <div className="input-icon-wrapper">
                    <Package size={18} className="input-icon"/>
                    <input type="text" placeholder="Ex: Mesa de Jantar" value={produto} onChange={e => setProduto(e.target.value)} />
                </div>
            </div>

            <div className="row-inputs">
                <div className="form-group">
                    <label>Materiais (R$)</label>
                    <div className="input-icon-wrapper">
                        <DollarSign size={18} className="input-icon"/>
                        <input type="number" placeholder="0.00" value={materiais} onChange={e => setMateriais(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Tempo (Horas)</label>
                    <div className="input-icon-wrapper">
                        <FileText size={18} className="input-icon"/>
                        <input type="number" placeholder="0" value={tempo} onChange={e => setTempo(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            {/* Breakdowns Visuais */}
            <div className="custos-breakdown">
                <div className="custo-linha"><span><Package size={14}/> Materiais:</span><span className="custo-valor">{BRL(materiais)}</span></div>
                <div className="custo-linha"><span><Hammer size={14}/> Mão de Obra ({tempo}h):</span><span className="custo-valor">{BRL(custoMaoObra)}</span></div>
                <div className="custo-linha destaque"><span>Total Produção:</span><span className="custo-valor">{BRL(custoProducao)}</span></div>
            </div>

            <div className="row-inputs" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Custo Fixo (%)</label>
                    <div className="input-icon-wrapper">
                        <Building2 size={16} className="input-icon" style={{color:'#f97316'}}/>
                        <input type="number" value={taxaFixaReal.toFixed(2)} disabled style={{backgroundColor:'#f1f5f9', color:'#64748b', fontWeight:'bold'}} />
                    </div>
                </div>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Lucro (%)</label>
                    <div className="input-icon-wrapper">
                        <TrendingUp size={16} className="input-icon"/>
                        <input type="number" value={lucro} onChange={e => setLucro(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Imposto (%)</label>
                    <div className="input-icon-wrapper">
                        <Percent size={16} className="input-icon"/>
                        <input type="number" value={imposto} onChange={e => setImposto(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="resultado-box">
                <span className="resultado-label">Preço Sugerido</span>
                <div className="resultado-valor">{BRL(precoFinal)}</div>
                <span className="resultado-lucro">Lucro Líq: {BRL(lucroReal)}</span>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
                <button className="btn-salvar" onClick={handleSalvar}>
                    <Save size={18} /> {idEditando ? 'Salvar Alterações' : 'Salvar Orçamento'}
                </button>
                {idEditando && (
                    <button className="btn-salvar" style={{backgroundColor:'#ef4444'}} onClick={limparForm}>
                        <XCircle size={18} /> Cancelar
                    </button>
                )}
            </div>
        </div>

        {/* DIREITA: LISTA */}
        <div className="card-lista">
            <table>
                <thead>
                    <tr>
                        <th>Cliente / Produto</th>
                        <th>Custo Mat.</th>
                        <th>Lucro</th>
                        <th>Preço Final</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {listaOrcamentos.length === 0 ? (<tr><td colSpan={5} style={{textAlign:'center', padding:'40px'}}>Nenhum orçamento.</td></tr>) : (
                        listaOrcamentos.map(orc => (
                            <tr key={orc.id} style={{backgroundColor: idEditando === orc.id ? '#fff7ed' : 'transparent'}}>
                                <td>
                                    <div style={{fontWeight:'bold', color:'#334155'}}>{orc.cliente || 'Sem cliente'}</div>
                                    <div style={{fontSize:'0.9rem', color:'#64748b'}}>{orc.nome_produto}</div>
                                </td>
                                <td>{BRL(Number(orc.custo_materiais))}</td>
                                <td><span className="badge-lucro">{orc.lucro_desejado}%</span></td>
                                <td style={{fontWeight:'bold', color:'#0f172a'}}>{BRL(Number(orc.preco_venda))}</td>
                                <td>
                                    <div className="acoes-td">
                                        <button className="btn-icon btn-ver" title="Ver Demonstrativo" onClick={() => abrirDemonstrativo(orc)}>
                                            <Eye size={16}/>
                                        </button>
                                        <button className="btn-icon" style={{backgroundColor:'#f59e0b'}} title="Editar" onClick={() => iniciarEdicao(orc)}>
                                            <Edit2 size={16}/>
                                        </button>
                                        <button className="btn-icon btn-del" title="Excluir" onClick={() => orc.id && handleExcluir(orc.id)}>
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL DEMONSTRATIVO --- */}
      {showModal && det && orcamentoSelecionado && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><FileText size={20} color="#3b82f6"/> Demonstrativo: {orcamentoSelecionado.nome_produto}</h3>
                    <button className="btn-close" onClick={() => setShowModal(false)}><X size={24}/></button>
                </div>
                
                <div style={{marginBottom:'15px', fontWeight:'bold', color:'#64748b'}}>Cliente: {orcamentoSelecionado.cliente}</div>

                <table className="tabela-demonstrativo">
                    <thead><tr><th>Descrição</th><th>Valor (R$)</th><th>%</th></tr></thead>
                    <tbody>
                        <tr className="row-venda"><td>Preço de Venda</td><td className="col-valor">{BRL(det.pv)}</td><td className="col-pct">100%</td></tr>
                        <tr><td>Custo Fixo (Empresa)</td><td className="col-valor">{BRL(det.valFixo)}</td><td className="col-pct">{PCT(det.fixoPct)}</td></tr>
                        <tr><td>Imposto</td><td className="col-valor">{BRL(det.valImposto)}</td><td className="col-pct">{PCT(det.impPct)}</td></tr>
                        <tr><td>Materiais (Mercadoria)</td><td className="col-valor">{BRL(det.mat)}</td><td className="col-pct">{PCT(det.matPct)}</td></tr>
                        <tr><td>Mão de Obra</td><td className="col-valor">{BRL(det.mo)}</td><td className="col-pct">{PCT(det.moPct)}</td></tr>
                        <tr className="row-lucro"><td>Lucro Líquido</td><td className="col-valor">{BRL(det.valLucro)}</td><td className="col-pct">{PCT(det.lucPct)}</td></tr>
                    </tbody>
                </table>
                <button className="btn-imprimir" onClick={() => window.print()}><Printer size={18}/> Imprimir Demonstrativo</button>
            </div>
        </div>
      )}
    </div>
  );
}