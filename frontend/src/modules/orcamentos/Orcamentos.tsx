import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useOrcamentos } from './hooks/useOrcamentos';
import { CalculadoraOrcamento } from './components/CalculadoraOrcamento';
import { ListaOrcamentos } from './components/ListaOrcamentos';
import { ModalDemonstrativo } from './components/ModalDemonstrativo';
import type { Orcamento } from './types';
import './Orcamentos.css';

export function Orcamentos() {
    // 1. Hook (Lógica)
    const { 
        loading, 
        listaOrcamentos, 
        listaCenarios, 
        taxaFixa, 
        salvarOrcamento, 
        excluirOrcamento 
    } = useOrcamentos();

    // 2. States de UI
    const [idEditando, setIdEditando] = useState<number | null>(null);
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
    
    // Estados para Filtro e Ordenação
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacao] = useState('data_desc'); // Padrão: Mais recentes primeiro

    // Helpers
    const handleEditar = (orc: Orcamento) => {
        setIdEditando(orc.id || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelarEdicao = () => {
        setIdEditando(null);
    };

    // Filtra o objeto completo para edição
    const orcamentoEdicao = listaOrcamentos.find(o => o.id === idEditando) || null;

    // --- MOTOR DE FILTRAGEM E ORDENAÇÃO ---
    
    // 1. Primeiro filtramos pelo que foi digitado
    const orcamentosProcessados = listaOrcamentos.filter(orc => {
        const termo = busca.toLowerCase();
        const matchCliente = (orc.cliente || '').toLowerCase().includes(termo);
        const matchProduto = (orc.nome_produto || '').toLowerCase().includes(termo);
        return matchCliente || matchProduto;
    });

    // 2. Depois ordenamos o resultado conforme o select
    orcamentosProcessados.sort((a, b) => {
        switch (ordenacao) {
            case 'data_desc': return (b.id || 0) - (a.id || 0);
            case 'data_asc': return (a.id || 0) - (b.id || 0);
            case 'az': return (a.cliente || 'Sem Nome').localeCompare(b.cliente || 'Sem Nome');
            case 'za': return (b.cliente || 'Sem Nome').localeCompare(a.cliente || 'Sem Nome');
            case 'valor_desc': return Number(b.preco_venda) - Number(a.preco_venda);
            case 'valor_asc': return Number(a.preco_venda) - Number(b.preco_venda);
            default: return 0;
        }
    });

    if (loading) return <div style={{padding: 40, color:'white'}}>Carregando sistema...</div>;

    return (
        <div className="orcamentos-container">
            <h1>Calculadora de Preços 🏛️</h1>
            
            <div className="orcamento-grid">
                
                {/* ESQUERDA: Form + Cálculo */}
                <CalculadoraOrcamento 
                    key={orcamentoEdicao?.id || 'novo_orcamento'} 
                    listaCenarios={listaCenarios}
                    taxaFixa={taxaFixa}
                    orcamentoEdicao={orcamentoEdicao}
                    onSalvar={salvarOrcamento}
                    onCancelarEdicao={handleCancelarEdicao}
                />

                {/* DIREITA: Tabela com Barra de Pesquisa e Filtros */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* --- BARRA DE FERRAMENTAS MELHORADA --- */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        
                        {/* Campo de Busca */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            backgroundColor: '#ffffff', padding: '12px 15px',
                            borderRadius: '8px', border: '1px solid #cbd5e1',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            flex: '1', minWidth: '200px'
                        }}>
                            <Search size={18} color="#64748b" />
                            <input 
                                type="text" 
                                placeholder="Buscar por cliente ou produto..." 
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                style={{ 
                                    border: 'none', 
                                    outline: 'none', 
                                    width: '100%', 
                                    fontSize: '0.95rem', 
                                    color: '#0f172a', /* <-- Letra escura garantida */
                                    backgroundColor: 'transparent' /* <-- Remove o fundo preto do input */
                                }}
                            />
                        </div>

                        {/* Campo de Ordenação */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            backgroundColor: '#ffffff', padding: '0 15px',
                            borderRadius: '8px', border: '1px solid #cbd5e1',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <SlidersHorizontal size={18} color="#64748b" />
                            <select 
                                value={ordenacao}
                                onChange={(e) => setOrdenacao(e.target.value)}
                                style={{ 
                                    border: 'none', outline: 'none', padding: '12px 0', 
                                    backgroundColor: 'transparent', color: '#0f172a', 
                                    fontSize: '0.95rem', cursor: 'pointer', fontWeight: '500'
                                }}
                            >
                                <option value="data_desc">📅 Mais Recentes</option>
                                <option value="data_asc">📅 Mais Antigos</option>
                                <option value="az">🔤 Cliente (A-Z)</option>
                                <option value="za">🔤 Cliente (Z-A)</option>
                                <option value="valor_desc">💰 Maior Valor</option>
                                <option value="valor_asc">💰 Menor Valor</option>
                            </select>
                        </div>

                    </div>

                    <ListaOrcamentos 
                        lista={orcamentosProcessados}
                        idEditando={idEditando}
                        onEditar={handleEditar}
                        onExcluir={excluirOrcamento}
                        onVerDemonstrativo={setOrcamentoSelecionado}
                    />
                </div>
            </div>

            {/* MODAL */}
            {orcamentoSelecionado && (
                <ModalDemonstrativo 
                    orcamento={orcamentoSelecionado}
                    onClose={() => setOrcamentoSelecionado(null)}
                />
            )}
        </div>
    );
}