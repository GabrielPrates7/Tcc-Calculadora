// ARQUIVO: src/modules/financeiro/components/ModalFinanceiro.tsx

import { DollarSign, TrendingDown, PieChart, X, Save, Calendar, User, CheckCircle, Power, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { ItemFinanceiro, TipoModal } from '../types';
import './ModalFinanceiro.css';

interface Props {
    tipo: TipoModal;
    itemEdicao: ItemFinanceiro | null;
    valorFaturamentoAtual?: number;
    onClose: () => void;
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
    // ESTADOS
    const [nome, setNome] = useState(itemEdicao?.nome || '');
    
    const [valor, setValor] = useState(() => {
        if (tipo === 'faturamento') {
            return valorFaturamentoAtual ? Number(valorFaturamentoAtual).toFixed(2) : '';
        }
        return itemEdicao?.valor ? Number(itemEdicao?.valor).toFixed(2) : '';
    });
    
    const [beneficiario, setBeneficiario] = useState(itemEdicao?.beneficiario || '');
    const [dataVencimento, setDataVencimento] = useState(itemEdicao?.dataVencimento || '');
    const [ativo, setAtivo] = useState(itemEdicao?.ativo ?? true);
    const [pago, setPago] = useState(itemEdicao?.pago ?? false);

    const [erro, setErro] = useState<string | null>(null); // NOVO ESTADO DE ERRO
    const [salvando, setSalvando] = useState(false);

    const handleSubmit = async () => {
        setErro(null); // Limpa o erro ao tentar de novo
        
        if (!valor) return setErro("Digite o valor do registro!");
        
        // Validação estrita de campos obrigatórios para Despesas e Investimentos
        if (tipo !== 'faturamento') {
            if (!nome) return setErro("A descrição do item é obrigatória!");
            if (!dataVencimento) return setErro("A data de vencimento é obrigatória!");
        }
        
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
        if (tipo === 'faturamento') return 'Definir Faturamento';
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
                    {/* --- FORMULÁRIO DE DESPESAS/INVESTIMENTOS --- */}
                    {tipo !== 'faturamento' && (
                        <>
                            <div className="form-group">
                                <label>Descrição do Item <span style={{color: '#ef4444'}}>*</span></label>
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

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Valor (R$) <span style={{color: '#ef4444'}}>*</span></label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="0.00" 
                                        value={valor} 
                                        onChange={e => setValor(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>
                                        <Calendar size={14} style={{marginRight:4, verticalAlign:'middle'}}/> 
                                        Vencimento <span style={{color: '#ef4444'}}>*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        value={dataVencimento} 
                                        onChange={e => setDataVencimento(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

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

                    {/* --- FORMULÁRIO DE FATURAMENTO --- */}
                    {tipo === 'faturamento' && (
                        <div className="form-group">
                            <label>Valor do Faturamento (R$) <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={valor} 
                                onChange={e => setValor(e.target.value)}
                                autoFocus
                                placeholder="0.00"
                            />
                            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '8px'}}>
                                Este valor será usado para calcular a Taxa de Custo Fixo do período selecionado.
                            </p>
                        </div>
                    )}

                    {/* NOVA MENSAGEM DE ERRO BONITA */}
                    {erro && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                            <AlertCircle size={18} /> {erro}
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