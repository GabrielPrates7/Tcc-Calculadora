import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export function Login() {
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!nomeUsuario || !senha) {
            toast.warn('Preencha todos os campos.');
            return;
        }

        try {
            setCarregando(true);
            const response = await api.post('/auth/login', { nome_usuario: nomeUsuario, senha });
            const { token, usuario } = response.data;

            login(token, usuario);
            toast.success('Login realizado com sucesso!');
            navigate('/'); 
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const mensagem = err.response?.data?.error || 'Erro ao realizar login.';
            toast.error(mensagem);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
            <form onSubmit={handleLogin} style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo-denarius-sem-fundo.png" alt="Logo Denarius" style={{ height: '72px', objectFit: 'contain' }} />
                </div>

                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}>Entrar no Sistema</h2>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nome de Usuário</label>
                    <input 
                        type="text" 
                        value={nomeUsuario} 
                        onChange={e => setNomeUsuario(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required 
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Senha</label>
                    <input 
                        type="password" 
                        value={senha} 
                        onChange={e => setSenha(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
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
                    {carregando ? 'Autenticando...' : 'Entrar'}
                </button>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Não tem uma conta? <Link to="/registro" style={{ color: '#60a5fa', textDecoration: 'none' }}>Cadastre-se</Link>
                </p>
            </form>
        </div>
    );
}