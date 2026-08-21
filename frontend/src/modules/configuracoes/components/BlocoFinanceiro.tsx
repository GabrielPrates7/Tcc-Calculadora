import React from 'react';
import { DollarSign } from 'lucide-react';
import type { FormFinanceiroState } from '../types';

interface Props {
    formFinanceiro: FormFinanceiroState;
    setFormFinanceiro: React.Dispatch<React.SetStateAction<FormFinanceiroState>>;
    onSubmit: (e: React.FormEvent) => void;
}

export function BlocoFinanceiro({ formFinanceiro, setFormFinanceiro, onSubmit }: Props) {
    return (
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '24px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} color="#10b981"/> Parâmetros Financeiros
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
                Bases operacionais utilizadas para o rateio do Custo Hora e Custo Dia da Mão de Obra.
            </p>

            <form onSubmit={onSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Base de Horas (Mês)</label>
                        <input 
                            type="number" 
                            value={formFinanceiro.baseHorasProdutivas}
                            onChange={e => setFormFinanceiro(prev => ({...prev, baseHorasProdutivas: e.target.value === '' ? '' : Number(e.target.value)}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Base de Dias (Mês)</label>
                        <input 
                            type="number" 
                            value={formFinanceiro.baseDiasProdutivos}
                            onChange={e => setFormFinanceiro(prev => ({...prev, baseDiasProdutivos: e.target.value === '' ? '' : Number(e.target.value)}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Atualizar Índices Operacionais
                </button>
            </form>
        </div>
    );
}