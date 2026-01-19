// ARQUIVO: src/modules/financeiro/components/ModalFinanceiro.tsx

import { DollarSign, TrendingDown, PieChart, X, Save, Calendar, User, CheckCircle, Power } from 'lucide-react';
import { useState } from 'react';
import type { ItemFinanceiro, TipoModal } from '../types';
import './ModalFinanceiro.css';

interface Props {
    tipo: TipoModal;
    itemEdicao: ItemFinanceiro | null;
    valorFaturamentoAtual?: number;
    onClose: () => void;
    // Atualizamos a assinatura para receber um objeto completo
    onSalvar: (dados: {
        nome: string; 
        valor: number;
        beneficiario?: string;
        dataVencimento?: string;
        ativo?: boolean;
        pago?: boolean;
    }) => Promise<void>;
}

export function ModalFinanceiro({ tipo, itemEdicao, valorFaturamentoAtual, onClose, onSalvar }: Props) {
    // States dos campos
    const [nome, setNome] = useState(itemEdicao?.nome || '');
    const [valor, setValor] = useState(
        tipo === 'faturamento' ? String(valorFaturamentoAtual || 0) : String(itemEdicao?.valor || '')
    );
    
    // Novos States
    const [beneficiario, setBeneficiario] = useState(itemEdicao?.beneficiario || '');
    const [dataVencimento, setDataVencimento] = useState(itemEdicao?.dataVencimento || '');
    const [ativo, setAtivo] = useState(itemEdicao?.ativo ?? true); // Padrão: True
    const [pago, setPago] = useState(itemEdicao?.pago ?? false);   // Padrão: False

    const [salvando, setSalvando] = useState(false);

    const handleSubmit = async () => {
        if (!valor) return alert("Digite um valor!");
        if (tipo !== 'faturamento' && !nome) return alert("Digite um nome!");
        
        setSalvando(true);
        
        await onSalvar({
            nome,
            valor: Number(valor),
            beneficiario,
            dataVencimento,
            ativo,
            pago
        });

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
                    {/* --- FORMULÁRIO COMPLETO (Despesas/Investimentos) --- */}
                    {tipo !== 'faturamento' && (
                        <>
                            <div className="form-group">
                                <label>Descrição do Item</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Aluguel, Internet..." 
                                    value={nome} 
                                    onChange={e => setNome(e.target.value)} 
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label><User size={14} style={{marginRight:4, verticalAlign:'middle'}}/> Beneficiário / Fornecedor</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Imobiliária Silva, Cemig..." 
                                    value={beneficiario} 
                                    onChange={e => setBeneficiario(e.target.value)} 
                                />
                            </div>

                            {/* Grid 2 Colunas */}
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Valor (R$)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={valor} 
                                        onChange={e => setValor(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label><Calendar size={14} style={{marginRight:4, verticalAlign:'middle'}}/> Vencimento</label>
                                    <input 
                                        type="date" 
                                        value={dataVencimento} 
                                        onChange={e => setDataVencimento(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Área de Switches (Ativo / Pago) */}
                            <div className="switches-container">
                                <div 
                                    className={`switch-card ${ativo ? 'active' : ''}`} 
                                    onClick={() => setAtivo(!ativo)}
                                >
                                    <div className="switch-icon">
                                        <Power size={18} />
                                    </div>
                                    <div className="switch-info">
                                        <span>Considerar no Custo Fixo?</span>
                                        <small>{ativo ? 'Sim, ativo' : 'Não, ignorar'}</small>
                                    </div>
                                    <div className="switch-toggle"></div>
                                </div>

                                <div 
                                    className={`switch-card ${pago ? 'paid' : ''}`} 
                                    onClick={() => setPago(!pago)}
                                >
                                    <div className="switch-icon">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="switch-info">
                                        <span>Status do Pagamento</span>
                                        <small>{pago ? 'Pago' : 'Pendente'}</small>
                                    </div>
                                    <div className="switch-toggle"></div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- FORMULÁRIO SIMPLES (Faturamento) --- */}
                    {tipo === 'faturamento' && (
                        <div className="form-group">
                            <label>Valor Mensal Médio (R$)</label>
                            <input 
                                type="number" 
                                value={valor} 
                                onChange={e => setValor(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <button 
                        className="btn-save-modal" 
                        onClick={handleSubmit} 
                        disabled={salvando}
                        style={{ backgroundColor: corHeader }}
                    >
                        <Save size={18}/> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
}