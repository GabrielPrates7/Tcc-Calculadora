import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Users, Ban, Check, UserCog, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { AdminService, type CadastroPendente, type AlteracaoPendente } from '../../services/admin.service';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

type AbaVisualizacao = 'pendentes' | 'todos' | 'alteracoes';

export function PainelAdmin() {
    const { usuario } = useAuth();
    const [abaAtiva, setAbaAtiva] = useState<AbaVisualizacao>('pendentes');
    const [pendentes, setPendentes] = useState<CadastroPendente[]>([]);
    const [todosUsuarios, setTodosUsuarios] = useState<CadastroPendente[]>([]);
    const [alteracoesPendentes, setAlteracoesPendentes] = useState<AlteracaoPendente[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [atualizarLista, setAtualizarLista] = useState(0);

    // Estado unificado para controlar o ConfirmModal
    const [modalConfirmacao, setModalConfirmacao] = useState({
        isOpen: false,
        title: '',
        message: '',
        textoConfirmar: '',
        onConfirm: async () => {}
    });

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const [dadosPendentes, dadosTodos, dadosAlteracoes] = await Promise.all([
                    AdminService.listarPendentes(),
                    AdminService.listarTodos(),
                    AdminService.listarAlteracoesPendentes()
                ]);
                
                setPendentes(dadosPendentes);
                setTodosUsuarios(dadosTodos);
                setAlteracoesPendentes(dadosAlteracoes); 
            } catch (error) {
                console.error(error);
                toast.error('Erro ao buscar dados do servidor.');
            } finally {
                setLoading(false);
            }
        };

        buscarDados();
    }, [atualizarLista]);

    const recarregar = () => setAtualizarLista(prev => prev + 1);

    const handleAprovar = (usuario_id: number, nome_empresa: string) => {
        setModalConfirmacao({
            isOpen: true,
            title: "Aprovar Acesso",
            message: `Deseja aprovar o acesso para a empresa "${nome_empresa}"?`,
            textoConfirmar: "Aprovar",
            onConfirm: async () => {
                try {
                    await AdminService.ativarUsuario(usuario_id);
                    toast.success(`Acesso liberado para ${nome_empresa}!`);
                    recarregar(); 
                } catch (error) {
                    console.error(error);
                    toast.error('Erro ao aprovar usuário.');
                } finally {
                    setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleBloquear = (usuario_id: number, nome_empresa: string) => {
        setModalConfirmacao({
            isOpen: true,
            title: "Bloquear Acesso",
            message: `Deseja bloquear o acesso da empresa "${nome_empresa}"? O bloqueio impede novos logins; quem já estiver com a sessão aberta continua até ela expirar.`,
            textoConfirmar: "Bloquear",
            onConfirm: async () => {
                try {
                    await AdminService.bloquearUsuario(usuario_id);
                    toast.warning(`Acesso bloqueado para ${nome_empresa}.`);
                    recarregar(); 
                } catch (error) {
                    console.error(error);
                    toast.error('Erro ao bloquear usuário.');
                } finally {
                    setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleAprovarAlteracao = (id: number) => {
        setModalConfirmacao({
            isOpen: true,
            title: "Aprovar Alteração",
            message: "Confirmar e aplicar as alterações para esta empresa no banco de dados?",
            textoConfirmar: "Aprovar Mudança",
            onConfirm: async () => {
                try {
                    await AdminService.aprovarAlteracao(id);
                    toast.success("Alteração aprovada e aplicada no banco de dados!");
                    recarregar();
                } catch (error: unknown) {
                    const err = error as { response?: { data?: { error?: string } } };
                    toast.error(err.response?.data?.error || "Erro ao aprovar alteração.");
                } finally {
                    setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleRejeitarAlteracao = (id: number) => {
        setModalConfirmacao({
            isOpen: true,
            title: "Rejeitar Solicitação",
            message: "Deseja realmente REJEITAR e excluir esta solicitação?",
            textoConfirmar: "Rejeitar",
            onConfirm: async () => {
                try {
                    await AdminService.rejeitarAlteracao(id);
                    toast.info("Solicitação rejeitada e arquivada.");
                    recarregar();
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao rejeitar solicitação.");
                } finally {
                    setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    if (loading) return <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Carregando painel de administração...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <ShieldCheck size={28} color="#f97316" />
                    Administração do Sistema
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '8px' }}>
                    Gerencie aprovações de novos cadastros e solicitações de mudança de conta.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
                <button 
                    onClick={() => setAbaAtiva('pendentes')}
                    style={{ 
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 16px', 
                        fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        color: abaAtiva === 'pendentes' ? '#10b981' : '#94a3b8',
                        borderBottom: abaAtiva === 'pendentes' ? '2px solid #10b981' : '2px solid transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    <ShieldCheck size={18} />
                    Novos Cadastros
                    {pendentes.length > 0 && (
                        <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>
                            {pendentes.length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setAbaAtiva('alteracoes')}
                    style={{ 
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 16px', 
                        fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        color: abaAtiva === 'alteracoes' ? '#f97316' : '#94a3b8',
                        borderBottom: abaAtiva === 'alteracoes' ? '2px solid #f97316' : '2px solid transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    <UserCog size={18} />
                    Alterações de Conta
                    {alteracoesPendentes.length > 0 && (
                        <span style={{ background: '#f97316', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px' }}>
                            {alteracoesPendentes.length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setAbaAtiva('todos')}
                    style={{ 
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 16px', 
                        fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
                        color: abaAtiva === 'todos' ? '#3b82f6' : '#94a3b8',
                        borderBottom: abaAtiva === 'todos' ? '2px solid #3b82f6' : '2px solid transparent',
                        transition: 'all 0.2s'
                    }}
                >
                    <Users size={18} />
                    Gestão de Clientes
                </button>
            </div>

            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
                
                {/* ABA 1: NOVOS CADASTROS */}
                {abaAtiva === 'pendentes' && (
                    pendentes.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                            <p>Não há nenhum cadastro novo pendente de aprovação.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Empresa</th>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Credenciais</th>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Data</th>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155', textAlign: 'right' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendentes.map(req => (
                                    <tr key={req.usuario_id} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{req.nome_empresa}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CNPJ: {req.cnpj || 'Não informado'}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div>Login: {req.nome_usuario}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{req.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                                            {new Date(req.criado_em).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleAprovar(req.usuario_id, req.nome_empresa)}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                <Check size={16} /> Aprovar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {/* ABA 2: ALTERAÇÕES DE CONTA */}
                {abaAtiva === 'alteracoes' && (
                    alteracoesPendentes.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                            <p>Não há solicitações de alteração de dados pendentes.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Empresa</th>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Dados Atuais</th>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Solicitação de Mudança</th>
                                    <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155', textAlign: 'right' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alteracoesPendentes.map((alt) => (
                                    <tr key={alt.id} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{alt.nome_empresa}</td>
                                        
                                        {/* Coluna Dados Antigos */}
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                            <div><strong>Empresa:</strong> {alt.dados_antigos.nome_empresa}</div>
                                            <div><strong>CNPJ:</strong> {alt.dados_antigos.cnpj || 'N/A'}</div>
                                            <div><strong>Usuário:</strong> {alt.dados_antigos.nome_usuario}</div>
                                            <div><strong>Email:</strong> {alt.dados_antigos.email}</div>
                                        </td>

                                        {/* Coluna Dados Novos */}
                                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                                            <div style={{ color: alt.dados_novos.nome_empresa !== alt.dados_antigos.nome_empresa ? '#3b82f6' : 'inherit' }}>
                                                <strong>Empresa:</strong> {alt.dados_novos.nome_empresa}
                                            </div>
                                            <div style={{ color: alt.dados_novos.cnpj !== alt.dados_antigos.cnpj ? '#3b82f6' : 'inherit' }}>
                                                <strong>CNPJ:</strong> {alt.dados_novos.cnpj || 'N/A'}
                                            </div>
                                            <div style={{ color: alt.dados_novos.nome_usuario !== alt.dados_antigos.nome_usuario ? '#3b82f6' : 'inherit' }}>
                                                <strong>Usuário:</strong> {alt.dados_novos.nome_usuario}
                                            </div>
                                            <div style={{ color: alt.dados_novos.email !== alt.dados_antigos.email ? '#3b82f6' : 'inherit' }}>
                                                <strong>Email:</strong> {alt.dados_novos.email}
                                            </div>
                                            {alt.dados_novos.senha_hash && (
                                                <div style={{ color: '#f97316', fontWeight: 'bold', marginTop: '4px' }}>
                                                    * Solicitou troca de senha
                                                </div>
                                            )}
                                        </td>

                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleRejeitarAlteracao(alt.id)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    <X size={16} /> Rejeitar
                                                </button>
                                                <button 
                                                    onClick={() => handleAprovarAlteracao(alt.id)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f97316', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    <Check size={16} /> Aprovar Mudança
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {/* ABA 3: GESTÃO DE CLIENTES */}
                {abaAtiva === 'todos' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Status</th>
                                <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Empresa</th>
                                <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Credenciais</th>
                                <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155' }}>Data do Cadastro</th>
                                <th style={{ padding: '16px 24px', borderBottom: '1px solid #334155', textAlign: 'right' }}>Controle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todosUsuarios.map(req => (
                                <tr key={req.usuario_id} style={{ borderBottom: '1px solid #334155', color: '#f8fafc', opacity: req.ativo ? 1 : 0.6 }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        {req.ativo ? (
                                            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>ATIVO</span>
                                        ) : (
                                            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>BLOQUEADO</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{req.nome_empresa}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CNPJ: {req.cnpj || 'Não informado'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div>{req.nome_usuario}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{req.email}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>
                                        {new Date(req.criado_em).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        {req.ativo ? (
                                            req.usuario_id === usuario?.id ? (
                                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                    <button
                                                        disabled
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#1e293b', color: '#64748b', border: '1px solid #334155', padding: '8px 16px', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 'bold' }}
                                                        title="Não é possível bloquear sua própria conta"
                                                    >
                                                        <Ban size={16} /> Bloquear
                                                    </button>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Sua própria conta</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleBloquear(req.usuario_id, req.nome_empresa)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    title="Bloquear usuário temporariamente"
                                                >
                                                    <Ban size={16} /> Bloquear
                                                </button>
                                            )
                                        ) : (
                                            <button 
                                                onClick={() => handleAprovar(req.usuario_id, req.nome_empresa)}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                <Check size={16} /> Ativar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Injeção do ConfirmModal padronizado */}
            <ConfirmModal 
                isOpen={modalConfirmacao.isOpen}
                title={modalConfirmacao.title}
                message={modalConfirmacao.message}
                textoConfirmar={modalConfirmacao.textoConfirmar}
                onConfirm={modalConfirmacao.onConfirm}
                onCancel={() => setModalConfirmacao(prev => ({ ...prev, isOpen: false }))}
            />

        </div>
    );
}