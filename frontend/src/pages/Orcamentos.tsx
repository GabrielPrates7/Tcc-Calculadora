import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Package, Percent, FileText, Trash2, Save, TrendingUp, Hammer, Building2 } from 'lucide-react';
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
  lucro_real?: number; 
}

export function Orcamentos() {
  // --- INPUTS ---
  const [produto, setProduto] = useState('');
  const [materiais, setMateriais] = useState(0);
  const [tempo, setTempo] = useState(0); 
  const [lucro, setLucro] = useState(30);   
  const [imposto, setImposto] = useState(5); 

  // --- DADOS DO SISTEMA ---
  const [valorHora, setValorHora] = useState(0);
  const [taxaFixa, setTaxaFixa] = useState(0);
  
  const [listaOrcamentos, setListaOrcamentos] = useState<Orcamento[]>([]);
  const [versaoDados, setVersaoDados] = useState(0);

  // --- CÁLCULO ---
  const custoMaoObra = tempo * valorHora;
  const custoProducao = Number(materiais) + custoMaoObra; 
  
  const taxaFixaReal = Number(taxaFixa) || 0;
  const somaPorcentagens = taxaFixaReal + Number(lucro) + Number(imposto);
  const divisor = 1 - (somaPorcentagens / 100);
  const precoFinal = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;
  const lucroReal = precoFinal * (Number(lucro) / 100);

  // --- EFEITO: CARREGAR CONFIGURAÇÕES ---
  useEffect(() => {
    async function carregarSistema() {
      try {
        // 1. Valor da Hora
        try {
            const resObra = await fetch('http://localhost:3000/calculo-obra'); 
            const dataObra = await resObra.json();
            setValorHora(Number(dataObra.calculo?.valorUnitario || 0));
        } catch (e) { 
            console.warn("Erro ao buscar valor hora:", e); // <--- CORRIGIDO AQUI
        }

        // 2. Taxa Financeira
        try {
            const resFin = await fetch('http://localhost:3000/financeiro/dashboard');
            const dataFin = await resFin.json();
            setTaxaFixa(Number(dataFin.taxaCustoFixo || 0));
        } catch (e) { 
            console.warn("Erro ao buscar taxa financeira:", e); // <--- CORRIGIDO AQUI
        }

      } catch (error) {
        console.error("Erro geral:", error);
      }
    }
    carregarSistema();
  }, []);

  // --- CARREGAR LISTA ---
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
  async function handleSalvar() {
    if (!produto) return alert("Digite o nome do produto!");
    if (precoFinal <= 0) return alert("Preço zerado.");

    const novo = {
        cliente: "Cliente Padrão",
        nome_produto: produto,
        custo_materiais: Number(materiais),
        horas_trabalhadas: Number(tempo),
        lucro_desejado: Number(lucro),
        imposto: Number(imposto),
        preco_venda: precoFinal,
        lucro_real: lucroReal
    };

    try {
        await fetch('http://localhost:3000/orcamentos', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(novo)
        });
        alert(`Salvo!`);
        setVersaoDados(v => v + 1);
        setProduto(''); setMateriais(0); setTempo(0);
    } catch (error) { console.error(error); alert("Erro ao salvar."); }
  }

  async function handleExcluir(id: number) {
      if(!confirm("Apagar?")) return;
      await fetch(`http://localhost:3000/orcamentos/${id}`, { method: 'DELETE' });
      setVersaoDados(v => v + 1);
  }

  return (
    <div className="orcamentos-container">
      <h1>Calculadora de Preços 🏛️</h1>
      
      <div className="orcamento-grid">
        <div className="card-calculadora">
            <h2><Calculator size={22} color="#f97316"/> Novo Orçamento</h2>

            <div className="form-group">
                <label>Produto</label>
                <div className="input-icon-wrapper">
                    <Package size={18} className="input-icon"/>
                    <input type="text" placeholder="Ex: Mesa de Jantar" value={produto} onChange={e => setProduto(e.target.value)} />
                </div>
            </div>

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

            <div className="custos-breakdown">
                <div className="custo-linha"><span><Package size={14}/> Materiais:</span><span className="custo-valor">R$ {materiais.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                <div className="custo-linha"><span><Hammer size={14}/> Mão de Obra ({tempo}h):</span><span className="custo-valor">R$ {custoMaoObra.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
                <div className="custo-linha destaque"><span>Total Produção:</span><span className="custo-valor">R$ {custoProducao.toLocaleString('pt-BR', {minimumFractionDigits:2})}</span></div>
            </div>

            <div className="row-inputs" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Custo Fixo (cf%)</label>
                    <div className="input-icon-wrapper">
                        <Building2 size={16} className="input-icon" style={{color:'#f97316'}}/>
                        <input type="number" value={taxaFixaReal.toFixed(2)} disabled style={{backgroundColor:'#f1f5f9', color:'#64748b', fontWeight:'bold', cursor: 'not-allowed'}} />
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
                <div className="resultado-valor">R$ {precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                <span className="resultado-lucro">Lucro Líq: R$ {lucroReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <button className="btn-salvar" onClick={handleSalvar}><Save size={18} /> Salvar Orçamento</button>
        </div>

        <div className="card-lista">
            <table>
                <thead><tr><th>Produto</th><th>Custo Mat.</th><th>Lucro</th><th>Preço Final</th><th>Ações</th></tr></thead>
                <tbody>
                    {listaOrcamentos.length === 0 ? (<tr><td colSpan={5} style={{textAlign:'center', padding:'40px'}}>Nenhum orçamento.</td></tr>) : (
                        listaOrcamentos.map(orc => (
                            <tr key={orc.id}>
                                <td style={{fontWeight:'600'}}>{orc.nome_produto}</td>
                                <td>R$ {Number(orc.custo_materiais).toFixed(2)}</td>
                                <td><span className="badge-lucro">{orc.lucro_desejado}%</span></td>
                                <td style={{fontWeight:'bold', color:'#0f172a'}}>R$ {Number(orc.preco_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td><div className="acoes-td"><button className="btn-icon btn-del" onClick={() => orc.id && handleExcluir(orc.id)}><Trash2 size={16}/></button></div></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}