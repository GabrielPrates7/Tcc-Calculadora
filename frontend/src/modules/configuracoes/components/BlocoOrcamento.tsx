import React from 'react';
import { FileText } from 'lucide-react';
import type { FormOrcamentoState } from '../types';

interface Props {
    formOrcamento: FormOrcamentoState;
    setFormOrcamento: React.Dispatch<React.SetStateAction<FormOrcamentoState>>;
    onSubmit: (e: React.FormEvent) => void;
}

export function BlocoOrcamento({ formOrcamento, setFormOrcamento, onSubmit }: Props) {
    return (
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '24px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#3b82f6"/> Padrões de Orçamento
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
                Taxas preenchidas automaticamente como sugestão na Calculadora de Orçamentos.
            </p>
            
            <form onSubmit={onSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Margem Lucro Padrão (%)</label>
                        <input 
                            type="number" 
                            value={formOrcamento.margemLucroPadrao}
                            onChange={e => setFormOrcamento(prev => ({...prev, margemLucroPadrao: e.target.value === '' ? '' : Number(e.target.value)}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Impostos Gerais (%)</label>
                        <input 
                            type="number" 
                            value={formOrcamento.impostoPadrao}
                            onChange={e => setFormOrcamento(prev => ({...prev, impostoPadrao: e.target.value === '' ? '' : Number(e.target.value)}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Salvar Regras de Orçamento
                </button>
            </form>
        </div>
    );
}