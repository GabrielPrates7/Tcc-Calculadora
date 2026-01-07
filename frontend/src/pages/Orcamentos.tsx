import React, { useState, useEffect } from 'react';
import { Trash2, Edit, FileText, X } from 'lucide-react';
import './Orcamentos.css';

// --- Tipos (Interfaces) ---
interface Orcamento {
  id: number;
  nome_produto: string;
  custo_mercadoria: string;
  custo_mao_obra_total: string;
  preco_venda: string;
  custo_fixo_pct_snapshot: string;
  imposto_pct: string;
  lucro_desejado_pct: string;
  tempo_gasto: string;
}

export function Orcamentos() {
  // --- Estados ---
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Orcamento | null>(null);

  // Formulário
  const [form, setForm] = useState({
    id: 0,
    nomeProduto: '',
    custoMercadoria: '',
    tempoGasto: '',
    lucroPct: '30',
    impostoPct: '5'
  });

  const API_URL = 'http://localhost:3000/orcamentos';

  // --- Funções ---

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  async function carregarOrcamentos() {
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      setOrcamentos(dados);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error); // <--- CORREÇÃO AQUI
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const dadosEnvio = {
      nomeProduto: form.nomeProduto,
      custoMercadoria: Number(form.custoMercadoria),
      tempoGasto: Number(form.tempoGasto),
      lucroPct: Number(form.lucroPct),
      impostoPct: Number(form.impostoPct)
    };

    try {
      const method = form.id === 0 ? 'POST' : 'PUT';
      const url = form.id === 0 ? API_URL : `${API_URL}/${form.id}`;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosEnvio)
      });

      if (!res.ok) throw new Error('Erro ao salvar');
      
      alert(form.id === 0 ? 'Orçamento criado!' : 'Orçamento atualizado!');
      limparForm();
      carregarOrcamentos();
    } catch (error) {
      console.error("Erro ao salvar:", error); // <--- CORREÇÃO AQUI
      alert('Erro ao processar. Verifique se o servidor (backend) está rodando.');
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(item: Orcamento) {
    setForm({
      id: item.id,
      nomeProduto: item.nome_produto,
      custoMercadoria: item.custo_mercadoria,
      tempoGasto: item.tempo_gasto,
      lucroPct: item.lucro_desejado_pct,
      impostoPct: item.imposto_pct
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleExcluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      carregarOrcamentos();
    } catch (error) {
      console.error("Erro ao excluir:", error); // <--- CORREÇÃO AQUI
      alert('Erro ao excluir');
    }
  }

  function abrirDemonstrativo(item: Orcamento) {
    setSelectedItem(item);
    setModalOpen(true);
  }

  function limparForm() {
    setForm({ id: 0, nomeProduto: '', custoMercadoria: '', tempoGasto: '', lucroPct: '30', impostoPct: '5' });
  }

  return (
    <div className="page-container">
      <h1>Calculadora de Preços 🏛️</h1>

      <div className="card">
        <h2>{form.id === 0 ? 'Novo Orçamento' : 'Editando Orçamento'}</h2>
        
        <form onSubmit={handleSalvar} className="form-grid">
          <div className="full-width">
            <label>Nome do Produto / Serviço</label>
            <input 
              type="text" 
              placeholder="Ex: Guarda-Roupa MDF" 
              value={form.nomeProduto}
              onChange={e => setForm({...form, nomeProduto: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Custo Materiais (R$)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={form.custoMercadoria}
              onChange={e => setForm({...form, custoMercadoria: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Tempo Gasto (Dias)</label>
            <input 
              type="number" 
              placeholder="Ex: 5" 
              value={form.tempoGasto}
              onChange={e => setForm({...form, tempoGasto: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Lucro Desejado (%)</label>
            <input 
              type="number" 
              value={form.lucroPct}
              onChange={e => setForm({...form, lucroPct: e.target.value})}
              required
            />
          </div>

          <div>
            <label>Imposto (%)</label>
            <input 
              type="number" 
              value={form.impostoPct}
              onChange={e => setForm({...form, impostoPct: e.target.value})}
              required
            />
          </div>

          <div className="full-width">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Calculando...' : (form.id === 0 ? '💲 Calcular Preço Final' : '💾 Salvar Alterações')}
            </button>
            {form.id !== 0 && (
              <button type="button" className="btn btn-secondary" onClick={limparForm}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Orçamentos Realizados</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Custo Mat.</th>
              <th>Preço Venda</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orcamentos.map((item) => (
              <tr key={item.id}>
                <td>{item.nome_produto}</td>
                <td>R$ {Number(item.custo_mercadoria).toFixed(2)}</td>
                <td className="text-destaque">R$ {Number(item.preco_venda).toFixed(2)}</td>
                <td>
                  <button className="action-btn btn-info" title="Ver Detalhes" onClick={() => abrirDemonstrativo(item)}>
                    <FileText size={18} />
                  </button>
                  <button className="action-btn btn-edit" title="Editar" onClick={() => handleEditar(item)}>
                    <Edit size={18} />
                  </button>
                  <button className="action-btn btn-delete" title="Excluir" onClick={() => handleExcluir(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setModalOpen(false)}><X /></button>
            <h2>Demonstrativo: {selectedItem.nome_produto}</h2>
            
            {(() => {
              const PV = Number(selectedItem.preco_venda);
              const Mercadoria = Number(selectedItem.custo_mercadoria);
              const MO = Number(selectedItem.custo_mao_obra_total);
              
              const pctFixo = Number(selectedItem.custo_fixo_pct_snapshot);
              const valFixo = PV * (pctFixo / 100);

              const pctImp = Number(selectedItem.imposto_pct);
              const valImp = PV * (pctImp / 100);

              const pctLucro = Number(selectedItem.lucro_desejado_pct);
              const valLucro = PV * (pctLucro / 100);
              
              return (
                <div style={{ marginTop: '20px' }}>
                  <div className="demo-row total">
                    <span>Preço de Venda</span>
                    <span>R$ {PV.toFixed(2)} (100%)</span>
                  </div>
                  <div className="demo-row">
                    <span>(-) Custo Fixo</span>
                    <span>R$ {valFixo.toFixed(2)} ({pctFixo.toFixed(2)}%)</span>
                  </div>
                  <div className="demo-row">
                    <span>(-) Impostos</span>
                    <span>R$ {valImp.toFixed(2)} ({pctImp.toFixed(2)}%)</span>
                  </div>
                  <div className="demo-row">
                    <span>(-) Mercadoria</span>
                    <span>R$ {Mercadoria.toFixed(2)} ({((Mercadoria/PV)*100).toFixed(2)}%)</span>
                  </div>
                  <div className="demo-row">
                    <span>(-) Mão de Obra</span>
                    <span>R$ {MO.toFixed(2)} ({((MO/PV)*100).toFixed(2)}%)</span>
                  </div>
                  <div className="demo-row lucro">
                    <span>(=) LUCRO LÍQUIDO</span>
                    <span>R$ {valLucro.toFixed(2)} ({pctLucro.toFixed(2)}%)</span>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}
    </div>
  );
}