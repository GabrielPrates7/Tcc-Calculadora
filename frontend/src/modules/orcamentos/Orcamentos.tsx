import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useOrcamentos } from './hooks/useOrcamentos';
import { CalculadoraOrcamento } from './components/CalculadoraOrcamento';
import { ListaOrcamentos } from './components/ListaOrcamentos';
import { ModalDemonstrativo } from './components/ModalDemonstrativo';
import type { Orcamento, IOrcamentoPayload } from './types';
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
    const [ordenacao, setOrdenacao] = useState('data_desc');

    // Helpers de Interface
    const handleEditar = (orc: Orcamento) => {
        setIdEditando(orc.id || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelarEdicao = () => {
        setIdEditando(null);
    };

    // Adaptador de tipagem estrita
    const handleSalvarOrcamento = async (payload: IOrcamentoPayload): Promise<boolean> => {
        const dadosNormalizados: Orcamento = {
            ...(payload as unknown as Orcamento),
            preco_venda: Number(payload.preco_venda) || 0
        };
        return await salvarOrcamento(dadosNormalizados);
    };

    // Filtra o objeto completo para edição
    const orcamentoEdicao = listaOrcamentos.find(o => o.id === idEditando) || null;

    // --- MOTOR DE FILTRAGEM E ORDENAÇÃO ---
    const orcamentosProcessados = listaOrcamentos.filter(orc => {
        const termo = busca.toLowerCase();
        const matchCliente = (orc.cliente || '').toLowerCase().includes(termo);
        const matchProduto = (orc.nome_produto || '').toLowerCase().includes(termo);
        return matchCliente || matchProduto;
    });

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

    if (loading) return <div style={{ padding: 40, color: 'white' }}>Carregando sistema...</div>;

    return (
        <div className="orcamentos-container">
            <div className="orcamento-grid">
                
                {/* ESQUERDA: Form + Cálculo */}
                <aside style={{ width: '100%' }}>
                    <div className="header-secao-coluna">
                        <h2>Calculadora de Preços 🏛️</h2>
                    </div>

                    <CalculadoraOrcamento 
                        key={orcamentoEdicao?.id || 'novo_orcamento'} 
                        listaCenarios={listaCenarios}
                        taxaFixa={taxaFixa}
                        orcamentoEdicao={orcamentoEdicao}
                        onSalvar={handleSalvarOrcamento}
                        onCancelarEdicao={handleCancelarEdicao}
                    />
                </aside>

                {/* DIREITA: Tabela com Barra de Pesquisa e Filtros */}
                <main style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: 0 }}>
                    
                    <div className="header-secao-coluna">
                        <h2>Orçamentos Salvos 📋</h2>
                    </div>

                    {/* --- BARRA DE FERRAMENTAS --- */}
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
                                    color: '#0f172a',
                                    backgroundColor: 'transparent'
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
                </main>
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