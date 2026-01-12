import { DollarSign, TrendingDown, PieChart, X, Save } from 'lucide-react';
import { useState } from 'react';
import type { ItemFinanceiro, TipoModal } from '../types';
import './ModalFinanceiro.css';

interface Props {
    tipo: TipoModal;
    itemEdicao: ItemFinanceiro | null; // Se for null, é novo
    valorFaturamentoAtual?: number;    // Usado só quando tipo === 'faturamento'
    onClose: () => void;
    onSalvar: (nome: string, valor: number) => Promise<void>;
}

export function ModalFinanceiro({ tipo, itemEdicao, valorFaturamentoAtual, onClose, onSalvar }: Props) {
    const [nome, setNome] = useState(itemEdicao?.nome || '');
    const [valor, setValor] = useState(
        tipo === 'faturamento' 
        ? String(valorFaturamentoAtual || 0) 
        : String(itemEdicao?.valor || '')
    );
    const [salvando, setSalvando] = useState(false);

    const handleSubmit = async () => {
        if (!valor) return alert("Digite um valor!");
        if (tipo !== 'faturamento' && !nome) return alert("Digite um nome!");
        
        setSalvando(true);
        await onSalvar(nome, Number(valor));
        setSalvando(false);
        onClose();
    };

    const getTitulo = () => {
        if (tipo === 'faturamento') return 'Faturamento Mensal';
        if (itemEdicao) return 'Editar Item';
        return tipo === 'despesa' ? 'Nova Despesa' : 'Novo Investimento';
    };

    const getIcone = () => {
        if (tipo === 'faturamento') return <DollarSign size={20}/>;
        if (tipo === 'despesa') return <TrendingDown size={20}/>;
        return <PieChart size={20}/>;
    };

    const corHeader = tipo === 'despesa' ? '#ef4444' : tipo === 'investimento' ? '#8b5cf6' : '#3b82f6';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{color: corHeader}}>{getIcone()}</span> {getTitulo()}
                    </h2>
                    <button className="btn-close" onClick={onClose}><X size={24}/></button>
                </div>

                <div className="modal-body">
                    {tipo !== 'faturamento' && (
                        <div className="form-group">
                            <label>Descrição</label>
                            <input 
                                type="text" placeholder="Nome do item..." 
                                value={nome} onChange={e => setNome(e.target.value)} autoFocus
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Valor (R$)</label>
                        <input 
                            type="number" placeholder="0.00" 
                            value={valor} onChange={e => setValor(e.target.value)}
                        />
                    </div>
                    <button 
                        className="btn-save-modal" 
                        onClick={handleSubmit} 
                        disabled={salvando}
                        style={{ backgroundColor: corHeader }}
                    >
                        <Save size={18}/> {salvando ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
}