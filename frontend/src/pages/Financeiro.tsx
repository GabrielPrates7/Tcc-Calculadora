import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, Edit2, Save, PieChart } from 'lucide-react';
import './Financeiro.css';

interface ItemFinanceiro {
  id: number;
  nome: string;
  valor: string | number;
}

export function Financeiro() {
  // Estados do Dashboard
  const [faturamento, setFaturamento] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalInvestimentos, setTotalInvestimentos] = useState(0);
  const [taxaFixa, setTaxaFixa] = useState(0);

  // Listas
  const [listaDespesas, setListaDespesas] = useState<ItemFinanceiro[]>([]);
  const [listaInvestimentos, setListaInvestimentos] = useState<ItemFinanceiro[]>([]);

  // Inputs dos Formulários
  const [novaDespesa, setNovaDespesa] = useState('');
  const [valorDespesa, setValorDespesa] = useState('');
  const [novoInvestimento, setNovoInvestimento] = useState('');
  const [valorInvestimento, setValorInvestimento] = useState('');

  // Controle de Edição
  const [editandoFat, setEditandoFat] = useState(false);
  const [fatTemp, setFatTemp] = useState('');
  const [versaoDados, setVersaoDados] = useState(0);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    async function carregar() {
      try {
        // 1. Dashboard
        const resDash = await fetch('http://localhost:3000/financeiro/dashboard');
        const d = await resDash.json();

        // BLINDAGEM CONTRA NaN (|| 0)
        setFaturamento(Number(d.faturamento || 0));
        setTotalDespesas(Number(d.totalDespesas || 0));
        setTotalInvestimentos(Number(d.totalInvestimentos || 0));
        setTaxaFixa(Number(d.taxaCustoFixo || 0));
        setFatTemp(String(d.faturamento || 0));

        // 2. Despesas
        const resDesp = await fetch('http://localhost:3000/financeiro/despesas');
        setListaDespesas(await resDesp.json());

        // 3. Investimentos
        const resInv = await fetch('http://localhost:3000/financeiro/investimentos');
        setListaInvestimentos(await resInv.json());

      } catch (error) {
        console.error("Erro ao carregar Financeiro:", error);
      }
    }
    carregar();
  }, [versaoDados]);

  // --- AÇÕES ---
  async function salvarFaturamento() {
    await fetch('http://localhost:3000/financeiro/config', {
        method: 'PUT', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ faturamento: Number(fatTemp) })
    });
    setEditandoFat(false);
    setVersaoDados(v => v + 1);
  }

  // Função Genérica para Adicionar (Despesa ou Investimento)
  async function adicionar(tipo: 'despesas' | 'investimentos') {
    const url = `http://localhost:3000/financeiro/${tipo}`;
    const payload = tipo === 'despesas' 
        ? { nome: novaDespesa, valor: Number(valorDespesa) }
        : { nome: novoInvestimento, valor: Number(valorInvestimento) };

    if (!payload.nome || !payload.valor) return;

    await fetch(url, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    // Limpa os campos certos
    if (tipo === 'despesas') { setNovaDespesa(''); setValorDespesa(''); }
    else { setNovoInvestimento(''); setValorInvestimento(''); }
    
    setVersaoDados(v => v + 1);
  }

  async function excluir(id: number, tipo: 'despesas' | 'investimentos') {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    await fetch(`http://localhost:3000/financeiro/${tipo}/${id}`, { method: 'DELETE' });
    setVersaoDados(v => v + 1);
  }

  return (
    <div className="financeiro-container">
      <h1>Gestão Financeira 💰</h1>

      {/* --- CARDS RESUMO --- */}
      <div className="resumo-grid">
        {/* Faturamento */}
        <div className="resumo-card card-azul">
            <div className="card-info">
                <h3>Faturamento Mensal</h3>
                {editandoFat ? (
                    <div>
                        <input type="number" value={fatTemp} onChange={e=>setFatTemp(e.target.value)} style={{width:'120px'}} autoFocus/>
                        <button onClick={salvarFaturamento}><Save size={16}/></button>
                    </div>
                ) : (
                    <p style={{color:'#1e293b'}}>R$ {faturamento.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                )}
            </div>
            <button className="card-edit-btn" onClick={()=>setEditandoFat(!editandoFat)}><Edit2 size={20}/></button>
        </div>

        {/* Despesas */}
        <div className="resumo-card card-vermelho">
            <div className="card-info">
                <h3>Despesas Fixas</h3>
                <p style={{color:'#ef4444'}}>R$ {totalDespesas.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
            </div>
            <TrendingDown size={24} color="#ef4444"/>
        </div>

        {/* Investimentos */}
        <div className="resumo-card" style={{borderLeftColor:'#8b5cf6'}}>
            <div className="card-info">
                <h3>Investimentos</h3>
                <p style={{color:'#8b5cf6'}}>R$ {totalInvestimentos.toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
            </div>
            <PieChart size={24} color="#8b5cf6"/>
        </div>

        {/* Taxa */}
        <div className="resumo-card card-laranja">
            <div className="card-info">
                <h3>Taxa Custo Fixo</h3>
                <p style={{color:'#f97316'}}>{taxaFixa.toFixed(2)}%</p>
                <small style={{color:'#94a3b8'}}>Baseada no faturamento</small>
            </div>
            <TrendingUp size={24} color="#f97316"/>
        </div>
      </div>

      {/* --- LISTAS --- */}
      <div className="listas-grid">
        
        {/* COLUNA 1: DESPESAS */}
        <div className="lista-card">
            <div className="lista-header"><h2>📉 Despesas Fixas</h2></div>
            <div className="quick-form">
                <input placeholder="Nome" value={novaDespesa} onChange={e=>setNovaDespesa(e.target.value)}/>
                <input type="number" placeholder="R$" value={valorDespesa} onChange={e=>setValorDespesa(e.target.value)}/>
                <button className="btn-add" onClick={()=>adicionar('despesas')}><Plus size={20}/></button>
            </div>
            <div className="lista-items">
                {listaDespesas.map(i => (
                    <div key={i.id} className="lista-item">
                        <span className="item-nome">{i.nome}</span>
                        <div>
                            <span className="item-valor">R$ {Number(i.valor).toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                            <button className="btn-remove-sm" onClick={()=>excluir(i.id, 'despesas')}><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* COLUNA 2: INVESTIMENTOS */}
        <div className="lista-card">
            <div className="lista-header"><h2>🚀 Investimentos</h2></div>
            <div className="quick-form">
                <input placeholder="Nome" value={novoInvestimento} onChange={e=>setNovoInvestimento(e.target.value)}/>
                <input type="number" placeholder="R$" value={valorInvestimento} onChange={e=>setValorInvestimento(e.target.value)}/>
                <button className="btn-add" style={{backgroundColor:'#8b5cf6'}} onClick={()=>adicionar('investimentos')}><Plus size={20}/></button>
            </div>
            <div className="lista-items">
                {listaInvestimentos.map(i => (
                    <div key={i.id} className="lista-item">
                        <span className="item-nome">{i.nome}</span>
                        <div>
                            <span className="item-valor" style={{color:'#8b5cf6'}}>R$ {Number(i.valor).toLocaleString('pt-BR', {minimumFractionDigits:2})}</span>
                            <button className="btn-remove-sm" onClick={()=>excluir(i.id, 'investimentos')}><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}