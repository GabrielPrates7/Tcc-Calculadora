import { useState } from 'react';
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
        valorHora, 
        taxaFixa, 
        salvarOrcamento, 
        excluirOrcamento 
    } = useOrcamentos();

    // 2. States de UI
    const [idEditando, setIdEditando] = useState<number | null>(null);
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);

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

    if (loading) return <div style={{padding: 40, color:'white'}}>Carregando sistema...</div>;

    return (
        <div className="orcamentos-container">
            <h1>Calculadora de Preços 🏛️</h1>
            
            <div className="orcamento-grid">
                {/* ESQUERDA: Form + Cálculo */}
                <CalculadoraOrcamento 
                    valorHora={valorHora}
                    taxaFixa={taxaFixa}
                    orcamentoEdicao={orcamentoEdicao}
                    onSalvar={salvarOrcamento}
                    onCancelarEdicao={handleCancelarEdicao}
                />

                {/* DIREITA: Tabela */}
                <ListaOrcamentos 
                    lista={listaOrcamentos}
                    idEditando={idEditando}
                    onEditar={handleEditar}
                    onExcluir={excluirOrcamento}
                    onVerDemonstrativo={setOrcamentoSelecionado}
                />
            </div>

            {/* MODAL */}
            {orcamentoSelecionado && (
                <ModalDemonstrativo 
                    orcamento={orcamentoSelecionado}
                    valorHora={valorHora}
                    onClose={() => setOrcamentoSelecionado(null)}
                />
            )}
        </div>
    );
}