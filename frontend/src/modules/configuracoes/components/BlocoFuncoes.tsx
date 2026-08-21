import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import type { Funcao } from '../types';

interface Props {
    funcoes: Funcao[];
    novaFuncao: string;
    setNovaFuncao: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    onAdd: () => void;
    onDelete: (id: number) => void;
}
export function BlocoFuncoes({ funcoes, novaFuncao, setNovaFuncao, loading, onAdd, onDelete }: Props) {
    return (
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '24px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#8b5cf6"/> Departamentos / Funções
            </h2>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    value={novaFuncao} 
                    onChange={e => setNovaFuncao(e.target.value)} 
                    placeholder="Ex: Projetista" 
                    style={{ flex: 1, padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc' }}
                    onKeyDown={e => e.key === 'Enter' && onAdd()}
                />
                <button 
                    onClick={onAdd} 
                    disabled={loading}
                    style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
                >
                    <Plus size={18} />
                </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, height: '220px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '6px', backgroundColor: '#0f172a' }}>
                {funcoes.map(f => (
                    <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #334155' }}>
                        <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{f.nome}</span>
                        <button 
                            onClick={() => onDelete(f.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            title="Excluir"
                        >
                            <Trash2 size={18} />
                        </button>
                    </li>
                ))}
                {funcoes.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Nenhuma função cadastrada.</p>}
            </ul>
        </div>
    );
}