import { useState, useEffect } from 'react';
import { Settings, Briefcase, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../services/api'; // <-- Injeção do Interceptador Axios
import './Configuracoes.css';

interface Funcao {
    id: number;
    nome: string;
}

export function Configuracoes() {
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [novaFuncao, setNovaFuncao] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Gatilho para forçar o recarregamento da lista sem causar loops
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // useEffect 100% isolado (sem depender de funções externas, calando o linter)
    useEffect(() => {
        const fetchFuncoes = async () => {
            try {
                // CORREÇÃO: Usando a api do Axios (GET)
                const res = await api.get('/funcoes');
                setFuncoes(res.data);
            } catch (error) {
                console.error("Erro na API:", error);
                toast.error("Erro ao carregar funções do servidor.");
            }
        };

        void fetchFuncoes();
    }, [refreshTrigger]); // Só roda na montagem ou quando o gatilho for alterado

    const handleAdicionarFuncao = async () => {
        if (!novaFuncao.trim()) return toast.warning("Digite o nome da função.");
        
        setLoading(true);
        try {
            // CORREÇÃO: Usando a api do Axios (POST)
            await api.post('/funcoes', { nome: novaFuncao.trim() });
            
            toast.success("Função cadastrada com sucesso!");
            setNovaFuncao('');
            
            // Aciona o gatilho para o useEffect rodar novamente e atualizar a lista
            setRefreshTrigger(prev => prev + 1);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error(error);
            toast.error(err.response?.data?.error || "Falha ao cadastrar função.");
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirFuncao = async (id: number) => {
        if (!window.confirm("Excluir este departamento? Funcionários vinculados podem perder a referência.")) return;
        
        try {
            // CORREÇÃO: Usando a api do Axios (DELETE)
            await api.delete(`/funcoes/${id}`);
            
            toast.success("Função removida.");
            
            // Aciona o gatilho para o useEffect rodar novamente e atualizar a lista
            setRefreshTrigger(prev => prev + 1);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error(error);
            toast.error(err.response?.data?.error || "Erro ao excluir. Verifique se há funcionários usando este cargo.");
        }
    };

    return (
        <div className="config-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-top" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={28} color="var(--cor-primaria)" />
                    Configurações Globais
                </h1>
                <p style={{ color: '#64748b', margin: 0 }}>Gerencie parâmetros do sistema e departamentos.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                
                {/* BLOCO: CARGOS E DEPARTAMENTOS */}
                <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={20} color="#3b82f6"/> Departamentos / Funções
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            value={novaFuncao} 
                            onChange={e => setNovaFuncao(e.target.value)} 
                            placeholder="Ex: Marceneiro" 
                            style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                            onKeyDown={e => e.key === 'Enter' && handleAdicionarFuncao()}
                        />
                        <button 
                            onClick={handleAdicionarFuncao} 
                            disabled={loading}
                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
                        >
                            <Plus size={18} /> Adicionar
                        </button>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                        {funcoes.map(f => (
                            <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#334155', fontWeight: '500' }}>{f.nome}</span>
                                <button 
                                    onClick={() => handleExcluirFuncao(f.id)}
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

            </div>
        </div>
    );
}