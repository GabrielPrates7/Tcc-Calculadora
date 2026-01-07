import { useState, useEffect } from 'react';
import { Trash2, Edit2, TrendingUp, TrendingDown, Plus, Save, XCircle } from 'lucide-react'; // Novos ícones
import './Financeiro.css';

interface ItemFinanceiro {
  id: number;
  nome: string;
  valor: string;
}

// Tipo para controlar o que estamos editando
interface EstadoEdicao {
  id: number;
  tipo: 'despesas' | 'investimentos';
}

export function Financeiro() {
  // --- Estados de Dados ---
  const [faturamento, setFaturamento] = useState(0);
  const [despesas, setDespesas] = useState<ItemFinanceiro[]>([]);
  const [investimentos, setInvestimentos] = useState<ItemFinanceiro[]>([]);
  const [versaoDados, setVersaoDados] = useState(0);

  // --- Estados de Interface ---
  const [editandoFaturamento, setEditandoFaturamento] = useState(false);
  const [novoFaturamento, setNovoFaturamento] = useState('');

  // Estados dos Formulários
  const [novaDespesa, setNovaDespesa] = useState({ nome: '', valor: '' });
  const [novoInvestimento, setNovoInvestimento] = useState({ nome: '', valor: '' });

  // Controle de Edição (Qual item está sendo editado agora?)
  const [itemEmEdicao, setItemEmEdicao] = useState<EstadoEdicao | null>(null);

  const API_URL = 'http://localhost:3000';

  // --- EFEITO: Carrega dados ---
  useEffect(() => {
    async function buscarTudo() {
      try {
        const resFat = await fetch(`${API_URL}/faturamento`);
        const dataFat = await resFat.json();
        setFaturamento(Number(dataFat.valor_mensal));

        const resDesp = await fetch(`${API_URL}/despesas`);
        setDespesas(await resDesp.json());

        const resInv = await fetch(`${API_URL}/investimentos`);
        setInvestimentos(await resInv.json());
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    buscarTudo();
  }, [versaoDados]);

  // --- AÇÕES ---

  async function salvarFaturamento() {
    try {
      await fetch(`${API_URL}/faturamento`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ valor: Number(novoFaturamento) })
      });
      setVersaoDados(v => v + 1);
      setEditandoFaturamento(false);
    } catch (error) {
      console.error(error);
    }
  }

  // Função Unificada: Serve para CRIAR e para ATUALIZAR
  async function salvarItem(tipo: 'despesas' | 'investimentos') {
    const dados = tipo === 'despesas' ? novaDespesa : novoInvestimento;
    
    if (!dados.nome || !dados.valor) return;

    try {
      // Se estiver editando este tipo, usa PUT. Se não, usa POST.
      if (itemEmEdicao && itemEmEdicao.tipo === tipo) {
        // MODO EDIÇÃO (PUT)
        await fetch(`${API_URL}/${tipo}/${itemEmEdicao.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ nome: dados.nome, valor: Number(dados.valor) })
        });
        cancelarEdicao(); // Sai do modo edição
      } else {
        // MODO CRIAÇÃO (POST)
        await fetch(`${API_URL}/${tipo}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ nome: dados.nome, valor: Number(dados.valor) })
        });
      }

      // Limpa inputs
      if (tipo === 'despesas') setNovaDespesa({ nome: '', valor: '' });
      else setNovoInvestimento({ nome: '', valor: '' });
      
      setVersaoDados(v => v + 1);
    } catch (error) {
      console.error(error);
    }
  }

  async function removerItem(id: number, tipo: 'despesas' | 'investimentos') {
    if (!confirm('Excluir este item?')) return;
    try {
      await fetch(`${API_URL}/${tipo}/${id}`, { method: 'DELETE' });
      setVersaoDados(v => v + 1);
    } catch (error) {
      console.error(error);
    }
  }

  // --- LÓGICA DE EDIÇÃO ---
  
  function iniciarEdicao(item: ItemFinanceiro, tipo: 'despesas' | 'investimentos') {
    setItemEmEdicao({ id: item.id, tipo });
    
    // Joga os dados do item para o input lá de cima
    if (tipo === 'despesas') {
      setNovaDespesa({ nome: item.nome, valor: item.valor });
    } else {
      setNovoInvestimento({ nome: item.nome, valor: item.valor });
    }
  }

  function cancelarEdicao() {
    setItemEmEdicao(null);
    setNovaDespesa({ nome: '', valor: '' });
    setNovoInvestimento({ nome: '', valor: '' });
  }

  // --- CÁLCULOS ---
  const totalDespesas = despesas.reduce((acc, item) => acc + Number(item.valor), 0);
  const totalInvestimentos = investimentos.reduce((acc, item) => acc + Number(item.valor), 0);
  
  const pctCustoFixo = faturamento > 0 ? (totalDespesas / faturamento) * 100 : 0;
  
  // Cálculo da % de Investimentos (NOVO)
  const pctInvestimentos = faturamento > 0 ? (totalInvestimentos / faturamento) * 100 : 0;

  return (
    <div className="financeiro-container">
      <h1>Gestão Financeira 💰</h1>

      {/* BLOCO DE RESUMO */}
      <div className="resumo-grid">
        <div className="resumo-card card-azul">
          <div className="card-info">
            <h3>Faturamento Mensal</h3>
            {editandoFaturamento ? (
              <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                <input 
                  type="number" 
                  value={novoFaturamento} 
                  onChange={e => setNovoFaturamento(e.target.value)}
                  style={{width: '120px', padding: '5px'}}
                />
                <button onClick={salvarFaturamento} style={{cursor:'pointer'}}>💾</button>
              </div>
            ) : (
              <p>R$ {faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            )}
          </div>
          <button className="card-edit-btn" onClick={() => {
              setNovoFaturamento(String(faturamento));
              setEditandoFaturamento(!editandoFaturamento);
          }}>
            <Edit2 size={24} />
          </button>
        </div>

        <div className="resumo-card card-vermelho">
          <div className="card-info">
            <h3>Total Despesas Fixas</h3>
            <p>R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div style={{ color: '#ef4444' }}><TrendingDown size={32} /></div>
        </div>

        <div className="resumo-card card-laranja">
          <div className="card-info">
            <h3>Taxa de Custo Fixo</h3>
            <p>{pctCustoFixo.toFixed(2)}%</p>
            <small>Baseada no faturamento</small>
          </div>
          <div style={{ color: '#f97316' }}><TrendingUp size={32} /></div>
        </div>
      </div>

      {/* BLOCO DE LISTAS */}
      <div className="listas-grid">
        
        {/* DESPESAS */}
        <div className="lista-card">
          <div className="lista-header">
            <h2>📉 Despesas Fixas</h2>
          </div>
          
          {/* Formulário Inteligente (Cria ou Edita) */}
          <div className="quick-form" style={itemEmEdicao?.tipo === 'despesas' ? {border: '2px solid #3b82f6'} : {}}>
            <input 
              type="text" placeholder="Nome" 
              value={novaDespesa.nome}
              onChange={e => setNovaDespesa({...novaDespesa, nome: e.target.value})}
            />
            <input 
              type="number" placeholder="R$" 
              value={novaDespesa.valor}
              onChange={e => setNovaDespesa({...novaDespesa, valor: e.target.value})}
            />
            
            {itemEmEdicao?.tipo === 'despesas' ? (
              <>
                <button className="btn-add" style={{backgroundColor: '#3b82f6'}} onClick={() => salvarItem('despesas')} title="Salvar Alteração">
                  <Save size={20} />
                </button>
                <button className="btn-add" style={{backgroundColor: '#94a3b8'}} onClick={cancelarEdicao} title="Cancelar">
                  <XCircle size={20} />
                </button>
              </>
            ) : (
              <button className="btn-add" onClick={() => salvarItem('despesas')} title="Adicionar">
                <Plus size={20} />
              </button>
            )}
          </div>

          <div>
            {despesas.map(item => (
              <div key={item.id} className="lista-item">
                <span className="item-nome">{item.nome}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <span className="item-valor">R$ {Number(item.valor).toFixed(2)}</span>
                  
                  {/* Botão Editar */}
                  <button className="btn-remove-sm" style={{backgroundColor: '#e0f2fe', color: '#0284c7'}} onClick={() => iniciarEdicao(item, 'despesas')}>
                    <Edit2 size={16} />
                  </button>
                  
                  {/* Botão Excluir */}
                  <button className="btn-remove-sm" onClick={() => removerItem(item.id, 'despesas')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INVESTIMENTOS */}
        <div className="lista-card">
          <div className="lista-header" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
            <h2>🚀 Investimentos</h2>
            {/* MOSTRANDO TOTAL E PORCENTAGEM AQUI */}
            <small style={{fontSize: '0.9rem', color: '#64748b'}}>
              Total: <strong>R$ {totalInvestimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> 
              <span style={{marginLeft: '8px', color: '#f59e0b'}}>({pctInvestimentos.toFixed(2)}% do Fat.)</span>
            </small>
          </div>

          <div className="quick-form" style={itemEmEdicao?.tipo === 'investimentos' ? {border: '2px solid #3b82f6'} : {}}>
            <input 
              type="text" placeholder="Nome" 
              value={novoInvestimento.nome}
              onChange={e => setNovoInvestimento({...novoInvestimento, nome: e.target.value})}
            />
            <input 
              type="number" placeholder="R$" 
              value={novoInvestimento.valor}
              onChange={e => setNovoInvestimento({...novoInvestimento, valor: e.target.value})}
            />
            
            {itemEmEdicao?.tipo === 'investimentos' ? (
              <>
                <button className="btn-add" style={{backgroundColor: '#3b82f6'}} onClick={() => salvarItem('investimentos')} title="Salvar Alteração">
                  <Save size={20} />
                </button>
                <button className="btn-add" style={{backgroundColor: '#94a3b8'}} onClick={cancelarEdicao} title="Cancelar">
                  <XCircle size={20} />
                </button>
              </>
            ) : (
              <button className="btn-add" onClick={() => salvarItem('investimentos')} title="Adicionar">
                <Plus size={20} />
              </button>
            )}
          </div>

          <div>
            {investimentos.map(item => (
              <div key={item.id} className="lista-item">
                <span className="item-nome">{item.nome}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <span className="item-valor">R$ {Number(item.valor).toFixed(2)}</span>
                  
                  {/* Botão Editar */}
                  <button className="btn-remove-sm" style={{backgroundColor: '#e0f2fe', color: '#0284c7'}} onClick={() => iniciarEdicao(item, 'investimentos')}>
                    <Edit2 size={16} />
                  </button>
                  
                  {/* Botão Excluir */}
                  <button className="btn-remove-sm" onClick={() => removerItem(item.id, 'investimentos')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}