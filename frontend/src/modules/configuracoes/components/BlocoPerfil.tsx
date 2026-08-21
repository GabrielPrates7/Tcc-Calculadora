import React, { useState } from 'react';
import { User, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import type { FormPerfilState } from '../types';

interface Props {
    formPerfil: FormPerfilState;
    setFormPerfil: React.Dispatch<React.SetStateAction<FormPerfilState>>;
    onSubmit: (e: React.FormEvent) => void;
}

export function BlocoPerfil({ formPerfil, setFormPerfil, onSubmit }: Props) {
    const [mostrarSenhaAntiga, setMostrarSenhaAntiga] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

    return (
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '24px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#f97316"/> Perfil e Conta
            </h2>
            
            <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', padding: '12px', borderRadius: '6px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <ShieldAlert size={18} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Por segurança, alterações em dados sensíveis exigem a aprovação do Administrador do Sistema.
                </p>
            </div>

            <form onSubmit={onSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Nome da Empresa</label>
                        <input 
                            type="text" 
                            value={formPerfil.nomeEmpresa}
                            onChange={e => setFormPerfil(prev => ({...prev, nomeEmpresa: e.target.value}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>CNPJ</label>
                        <input 
                            type="text" 
                            placeholder="00.000.000/0000-00"
                            value={formPerfil.cnpj}
                            onChange={e => setFormPerfil(prev => ({...prev, cnpj: e.target.value}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Usuário de Login</label>
                        <input 
                            type="text" 
                            value={formPerfil.nomeUsuario}
                            onChange={e => setFormPerfil(prev => ({...prev, nomeUsuario: e.target.value}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>E-mail de Acesso</label>
                        <input 
                            type="email" 
                            value={formPerfil.email}
                            onChange={e => setFormPerfil(prev => ({...prev, email: e.target.value}))}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Senha Atual</label>
                        <input 
                            type={mostrarSenhaAntiga ? "text" : "password"} 
                            placeholder="••••••••"
                            value={formPerfil.senhaAntiga}
                            onChange={e => setFormPerfil(prev => ({...prev, senhaAntiga: e.target.value}))}
                            style={{ width: '100%', padding: '10px', paddingRight: '40px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                        <button type="button" onClick={() => setMostrarSenhaAntiga(!mostrarSenhaAntiga)} style={{ position: 'absolute', right: '10px', top: '32px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            {mostrarSenhaAntiga ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>Nova Senha</label>
                        <input 
                            type={mostrarNovaSenha ? "text" : "password"} 
                            placeholder="••••••••"
                            value={formPerfil.novaSenha}
                            onChange={e => setFormPerfil(prev => ({...prev, novaSenha: e.target.value}))}
                            style={{ width: '100%', padding: '10px', paddingRight: '40px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', boxSizing: 'border-box' }}
                        />
                        <button type="button" onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)} style={{ position: 'absolute', right: '10px', top: '32px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    style={{ width: '100%', background: '#f97316', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}
                >
                    Solicitar Alteração de Conta
                </button>
            </form>
        </div>
    );
}