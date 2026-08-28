import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const MENSAGEM_RECUPERACAO_GENERICA = 'Se os dados informados forem encontrados, sua solicitação foi registrada e será avaliada pelo administrador.';

export function Login() {
    // Estado alterado para refletir a flexibilidade de login (e-mail ou usuário)
    const [credencial, setCredencial] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    // Fluxo "Esqueceu a senha?" — troca o conteúdo do mesmo cartão de login
    const [modoRecuperacao, setModoRecuperacao] = useState(false);
    const [identificadorRecuperacao, setIdentificadorRecuperacao] = useState('');
    const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
    const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    function voltarAoLogin() {
        setModoRecuperacao(false);
        setIdentificadorRecuperacao('');
        setRecuperacaoEnviada(false);
    }

    async function handleEsqueciSenha(e: React.FormEvent) {
        e.preventDefault();
        if (!identificadorRecuperacao.trim()) return;

        setEnviandoRecuperacao(true);
        try {
            await api.post('/auth/esqueci-senha', { identificador: identificadorRecuperacao.trim() });
        } catch {
            // Propositalmente ignorado: a mensagem exibida é sempre a mesma,
            // encontrando a conta ou não (e mesmo em falha de rede/servidor) —
            // divergir aqui abriria uma forma de descobrir se um identificador
            // existe no sistema só observando o comportamento da tela.
        } finally {
            setEnviandoRecuperacao(false);
            setRecuperacaoEnviada(true);
        }
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!credencial || !senha) {
            toast.warn('Preencha todos os campos.');
            return;
        }

        try {
            setCarregando(true);
            // O payload agora envia 'credencial' para dar match com o req.body do backend
            const response = await api.post('/auth/login', { credencial, senha });
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

    if (modoRecuperacao) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc' }}>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <img src="/logo-denarius-sem-fundo.png" alt="Logo Denarius" style={{ height: '72px', objectFit: 'contain' }} />
                    </div>

                    {recuperacaoEnviada ? (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <CheckCircle size={40} color="#22c55e" style={{ marginBottom: '0.75rem' }} />
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                                    {MENSAGEM_RECUPERACAO_GENERICA}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={voltarAoLogin}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                                Voltar ao login
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleEsqueciSenha}>
                            <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.25rem' }}>Recuperar Senha</h2>
                            <p style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                                Informe um dado da sua conta. Se encontrarmos uma conta correspondente, um administrador irá avaliar sua solicitação.
                            </p>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>E-mail, usuário ou CNPJ</label>
                                <input
                                    type="text"
                                    value={identificadorRecuperacao}
                                    onChange={e => setIdentificadorRecuperacao(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={enviandoRecuperacao}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.75rem' }}
                            >
                                {enviandoRecuperacao ? 'Enviando...' : 'Enviar Solicitação'}
                            </button>

                            <button
                                type="button"
                                onClick={voltarAoLogin}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Voltar ao login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
            <form onSubmit={handleLogin} style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc' }}>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo-denarius-sem-fundo.png" alt="Logo Denarius" style={{ height: '72px', objectFit: 'contain' }} />
                </div>

                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}>Entrar no Sistema</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>E-mail ou Usuário</label>
                    <input
                        type="text"
                        value={credencial}
                        onChange={e => setCredencial(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Senha</label>
                    <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                        required
                    />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: 'absolute', right: '0.75rem', top: '2.6rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
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

                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <button
                        type="button"
                        onClick={() => setModoRecuperacao(true)}
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.875rem', padding: 0, textDecoration: 'none' }}
                    >
                        Esqueceu a senha?
                    </button>
                </p>

                <p style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Não tem uma conta? <Link to="/registro" style={{ color: '#60a5fa', textDecoration: 'none' }}>Cadastre-se</Link>
                </p>
            </form>
        </div>
    );
}