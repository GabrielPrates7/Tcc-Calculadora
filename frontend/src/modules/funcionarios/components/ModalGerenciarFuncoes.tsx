import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, ShieldAlert } from 'lucide-react';
import './ModalGerenciarFuncoes.css';
import { ConfirmModal } from '../../../components/ConfirmModal/ConfirmModal'; // Ajuste o caminho se necessário
import { api } from '../../../services/api';

interface Funcao {
    id: number;
    nome: string;
}

interface Props {
    onClose: () => void;
}

export function ModalGerenciarFuncoes({ onClose }: Props) {
    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [novaFuncao, setNovaFuncao] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado de controle do modal de exclusão
    const [modalExclusao, setModalExclusao] = useState<{isOpen: boolean, id: number, nome: string}>({
        isOpen: false, id: 0, nome: ''
    });

    const carregarFuncoes = useCallback(async () => {
        try {
            const res = await api.get('/funcoes');
            setFuncoes(res.data);
        } catch (error) {
            console.error("Erro ao carregar funções", error);
        }
    }, []);

    useEffect(() => {
        carregarFuncoes();
    }, [carregarFuncoes]);

    const handleAdicionar = async () => {
        if (!novaFuncao.trim()) return;
        setLoading(true);
        try {
            await api.post('/funcoes', { nome: novaFuncao.trim() });
            setNovaFuncao('');
            carregarFuncoes();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            alert(err.response?.data?.error || 'Erro ao adicionar função.');
        } finally {
            setLoading(false);
        }
    };

    // Gatilho de interface: Prepara os dados e abre o modal
    const abrirModalExclusao = (id: number, nome: string) => {
        setModalExclusao({ isOpen: true, id, nome });
    };

    // Gatilho lógico: Executa a requisição DELETE confirmada
    const confirmarExclusao = async () => {
        try {
            await api.delete(`/funcoes/${modalExclusao.id}`);
            carregarFuncoes();
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { error?: string } } };
            if (err.response?.status === 422) {
                alert(`⚠️ BLOQUEIO DE SEGURANÇA:\n\n${err.response.data?.error}`);
            } else {
                alert('Erro de conexão com o servidor.');
            }
        } finally {
            setModalExclusao({ isOpen: false, id: 0, nome: '' });
        }
    };

    return (
        <div className="modal-overlay-funcoes">
            <div className="modal-content-funcoes">
                <div className="header-funcoes">
                    <div>
                        <h3>Gerenciar Cargos e Funções</h3>
                        <p>Controle os departamentos para o rateio de custos de obra.</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={20}/></button>
                </div>

                <div className="body-funcoes">
                    <div className="add-funcao-box">
                        <input 
                            type="text" 
                            placeholder="Nome da nova função..." 
                            value={novaFuncao}
                            onChange={(e) => setNovaFuncao(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdicionar()}
                        />
                        <button onClick={handleAdicionar} disabled={loading || !novaFuncao.trim()}>
                            <Plus size={18} /> Adicionar
                        </button>
                    </div>

                    <div className="lista-funcoes">
                        {funcoes.length === 0 ? (
                            <p className="empty-msg">Nenhuma função cadastrada.</p>
                        ) : (
                            funcoes.map(f => (
                                <div key={f.id} className="funcao-item">
                                    <span>{f.nome}</span>
                                    <button 
                                        className="btn-excluir-funcao" 
                                        onClick={() => abrirModalExclusao(f.id, f.nome)}
                                        title="Excluir função"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="aviso-seguranca">
                        <ShieldAlert size={14} />
                        <span>Funções vinculadas a colaboradores (ativos ou inativos) não podem ser excluídas para manter a integridade dos orçamentos.</span>
                    </div>
                </div>
            </div>

            <ConfirmModal 
                isOpen={modalExclusao.isOpen}
                title="Excluir Função"
                message={`Tem certeza que deseja excluir a função "${modalExclusao.nome}"? Esta ação não poderá ser desfeita.`}
                onConfirm={confirmarExclusao}
                onCancel={() => setModalExclusao({ isOpen: false, id: 0, nome: '' })}
            />
        </div>
    );
}