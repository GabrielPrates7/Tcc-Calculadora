// src/pages/configuracoes/hooks/useConfiguracoes.ts
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { ConfiguracoesService } from '../services/configuracoes.service';
import type { Funcao, FormPerfilState, FormFinanceiroState, FormOrcamentoState, PerfilBanco } from '../types';

export function useConfiguracoes() {
    const { usuario } = useAuth();
    const user = usuario as unknown as PerfilBanco;

    const [funcoes, setFuncoes] = useState<Funcao[]>([]);
    const [novaFuncao, setNovaFuncao] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formPerfil, setFormPerfil] = useState<FormPerfilState>({
        nomeEmpresa: user?.nome_empresa || '',
        nomeUsuario: user?.nome_usuario || user?.nome || '',
        cnpj: user?.cnpj || '',
        email: user?.email || '',
        senhaAntiga: '',
        novaSenha: ''
    });

    const [formFinanceiro, setFormFinanceiro] = useState<FormFinanceiroState>({
        baseHorasProdutivas: 176,
        baseDiasProdutivos: 22 
    });

    const [formOrcamento, setFormOrcamento] = useState<FormOrcamentoState>({
        margemLucroPadrao: 30,
        impostoPadrao: 5
    });

    const [modalConfirmacao, setModalConfirmacao] = useState({
        isOpen: false,
        title: '',
        message: '',
        textoConfirmar: '',
        onConfirm: async () => {}
    });

    const recarregar = () => setRefreshTrigger(prev => prev + 1);
    const fecharModal = () => setModalConfirmacao(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const fetchDadosGlobais = async () => {
            try {
                const [resFuncoes, resConfig, resPerfil] = await Promise.all([
                    ConfiguracoesService.buscarFuncoes(),
                    ConfiguracoesService.buscarConfiguracoesGlobais(),
                    ConfiguracoesService.buscarPerfil()
                ]);
                
                setFuncoes(resFuncoes);
                
                if (resConfig) {
                    setFormFinanceiro({
                        baseHorasProdutivas: resConfig.baseHorasProdutivas,
                        baseDiasProdutivos: resConfig.baseDiasProdutivos
                    });
                    setFormOrcamento({
                        margemLucroPadrao: resConfig.margemLucroPadrao,
                        impostoPadrao: resConfig.impostoPadrao
                    });
                }

                if (resPerfil) {
                    setFormPerfil(prev => ({
                        ...prev,
                        nomeEmpresa: resPerfil.nome_empresa || '',
                        nomeUsuario: resPerfil.nome_usuario || '',
                        cnpj: resPerfil.cnpj || '',
                        email: resPerfil.email || ''
                    }));
                }
            } catch (error) {
                console.error("Erro na API:", error);
                toast.error("Erro ao carregar dados do servidor.");
            }
        };
        void fetchDadosGlobais();
    }, [refreshTrigger]);

    const handleAdicionarFuncao = async () => {
        if (!novaFuncao.trim()) return toast.warning("Digite o nome da função.");
        setLoading(true);
        try {
            await ConfiguracoesService.criarFuncao(novaFuncao.trim());
            toast.success("Função cadastrada com sucesso!");
            setNovaFuncao('');
            recarregar();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error(error);
            toast.error(err.response?.data?.error || "Falha ao cadastrar função.");
        } finally {
            setLoading(false);
        }
    };

    const handleExcluirFuncao = (id: number) => {
        setModalConfirmacao({
            isOpen: true,
            title: "Excluir Função",
            message: "Excluir este departamento? Funcionários vinculados a ele podem perder a referência.",
            textoConfirmar: "Excluir",
            onConfirm: async () => {
                try {
                    await ConfiguracoesService.excluirFuncao(id);
                    toast.success("Função removida.");
                    recarregar();
                } catch (error: unknown) {
                    const err = error as { response?: { data?: { error?: string } } };
                    toast.error(err.response?.data?.error || "Erro ao excluir.");
                } finally {
                    fecharModal();
                }
            }
        });
    };

    const handleSubmitPerfil = (e: React.FormEvent) => {
        e.preventDefault();
        if (formPerfil.novaSenha && !formPerfil.senhaAntiga) {
            return toast.warning("Digite sua senha atual para autorizar a troca de senha.");
        }

        setModalConfirmacao({
            isOpen: true,
            title: "Solicitar Alteração de Conta",
            message: "Atenção: A alteração de dados sensíveis será enviada para aprovação do Administrador. Deseja prosseguir?",
            textoConfirmar: "Sim, Solicitar",
            onConfirm: async () => {
                try {
                    await ConfiguracoesService.solicitarAlteracaoPerfil(formPerfil);
                    toast.success("Solicitação enviada com sucesso! Aguarde a aprovação do Administrador.");
                    setFormPerfil(prev => ({ ...prev, senhaAntiga: '', novaSenha: '' }));
                } catch (error: unknown) {
                    const err = error as { response?: { data?: { error?: string } } };
                    toast.error(err.response?.data?.error || "Erro ao solicitar alteração.");
                } finally {
                    fecharModal();
                }
            }
        });
    };

    const handleSalvarParametros = async (e: React.FormEvent, modulo: string) => {
        e.preventDefault();
        try {
            // Conversão segura: Converte para número ou envia 0 caso o campo esteja vazio
            const payload = {
                baseHorasProdutivas: Number(formFinanceiro.baseHorasProdutivas) || 0,
                baseDiasProdutivos: Number(formFinanceiro.baseDiasProdutivos) || 0,
                margemLucroPadrao: Number(formOrcamento.margemLucroPadrao) || 0,
                impostoPadrao: Number(formOrcamento.impostoPadrao) || 0
            };

            await ConfiguracoesService.salvarConfiguracoes(payload);
            toast.success(`Parâmetros de ${modulo} atualizados no sistema!`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error(error);
            toast.error(err.response?.data?.error || `Erro ao salvar os parâmetros de ${modulo}.`);
        }
    };

    return {
        funcoes, novaFuncao, setNovaFuncao, loading,
        formPerfil, setFormPerfil,
        formFinanceiro, setFormFinanceiro,
        formOrcamento, setFormOrcamento,
        modalConfirmacao, fecharModal,
        handleAdicionarFuncao, handleExcluirFuncao, handleSubmitPerfil, handleSalvarParametros
    };
}