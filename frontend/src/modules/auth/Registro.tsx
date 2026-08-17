import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

export function Registro() {
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    async function handleRegistro(e: React.FormEvent) {
        e.preventDefault();
        if (!nomeEmpresa || !nomeUsuario || !email || !senha) {
            toast.warn('Preencha os campos obrigatórios.');
            return;
        }

        try {
            setCarregando(true);
            await api.post('/auth/registro', {
                nome_empresa: nomeEmpresa,
                cnpj: cnpj || null,
                nome_usuario: nomeUsuario,
                email,
                senha
            });

            toast.success('Cadastro realizado! Aguarde a ativação da conta pelo administrador.');
            navigate('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const mensagem = err.response?.data?.error || 'Erro ao realizar cadastro.';
            toast.error(mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
            <form onSubmit={handleRegistro} style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo-denarius-sem-fundo.png" alt="Logo Denarius" style={{ height: '72px', objectFit: 'contain' }} />
                </div>

                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}>Nova Empresa & Conta</h2>
                
                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>Nome da Empresa</label>
                    <input 
                        type="text" 
                        value={nomeEmpresa} 
                        onChange={e => setNomeEmpresa(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>CNPJ (Opcional)</label>
                    <input 
                        type="text" 
                        value={cnpj} 
                        onChange={e => setCnpj(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>Nome de Usuário (Login)</label>
                    <input 
                        type="text" 
                        placeholder="Ex: cliente_teste"
                        value={nomeUsuario} 
                        onChange={e => setNomeUsuario(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>E-mail</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8125rem' }}>Senha</label>
                    <input 
                        type="password" 
                        value={senha} 
                        onChange={e => setSenha(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={carregando}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                    {carregando ? 'Cadastrando...' : 'Registrar Empresa'}
                </button>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Já possui cadastro? <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Fazer login</Link>
                </p>
            </form>
        </div>
    );
}