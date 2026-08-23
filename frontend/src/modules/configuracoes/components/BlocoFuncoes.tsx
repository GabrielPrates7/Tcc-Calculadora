import React, { useState } from 'react';
import { Briefcase, Plus, Trash2, Pencil, X } from 'lucide-react';
import type { Funcao } from '../types';

interface Props {
    funcoes: Funcao[];
    novaFuncao: string;
    setNovaFuncao: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    onAdd: () => void;
    onEdit: (id: number, dados: { nome: string }) => Promise<void>;
    onDelete: (id: number) => void;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' };

export function BlocoFuncoes({ funcoes, novaFuncao, setNovaFuncao, loading, onAdd, onEdit, onDelete }: Props) {
    const [funcaoEmEdicao, setFuncaoEmEdicao] = useState<Funcao | null>(null);
    const [editNome, setEditNome] = useState('');
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    const abrirEdicao = (f: Funcao) => {
        setFuncaoEmEdicao(f);
        setEditNome(f.nome);
    };

    const fecharEdicao = () => setFuncaoEmEdicao(null);

    const salvarEdicao = async () => {
        if (!funcaoEmEdicao || !editNome.trim()) return;
        setSalvandoEdicao(true);
        try {
            await onEdit(funcaoEmEdicao.id, { nome: editNome.trim() });
            fecharEdicao();
        } catch {
            // erro já é mostrado via toast pelo hook; mantém o modal aberto para o usuário corrigir
        } finally {
            setSalvandoEdicao(false);
        }
    };

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
                    <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #334155', gap: '10px' }}>
                        <span style={{ color: '#e2e8f0', fontWeight: '500', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f.nome}
                        </span>

                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button
                                onClick={() => abrirEdicao(f)}
                                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                title="Editar nome"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={() => onDelete(f.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                title="Excluir"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </li>
                ))}
                {funcoes.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Nenhuma função cadastrada.</p>}
            </ul>

            {funcaoEmEdicao && (
                <div
                    onClick={fecharEdicao}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#1e293b', borderRadius: '8px', padding: '24px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '360px', maxWidth: '90vw' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Pencil size={18} color="#8b5cf6"/> Editar Função
                            </h2>
                            <button onClick={fecharEdicao} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Nome</label>
                            <input
                                type="text"
                                value={editNome}
                                onChange={e => setEditNome(e.target.value)}
                                style={inputStyle}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={fecharEdicao}
                                disabled={salvandoEdicao}
                                style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarEdicao}
                                disabled={salvandoEdicao || !editNome.trim()}
                                style={{ flex: 1, background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                {salvandoEdicao ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
