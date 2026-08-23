// src/modules/configuracoes/services/configuracoes.service.ts
import { api } from '../../../services/api';
import type { Funcao, PerfilBanco, ConfiguracoesGlobaisPayload, FormPerfilState } from '../types';

export const ConfiguracoesService = {
    // Buscas Iniciais
    async buscarFuncoes(): Promise<Funcao[]> {
        const response = await api.get('/funcoes');
        return response.data;
    },

    async buscarConfiguracoesGlobais(): Promise<ConfiguracoesGlobaisPayload> {
        const response = await api.get('/configuracoes');
        return response.data;
    },

    async buscarPerfil(): Promise<PerfilBanco> {
        const response = await api.get('/perfil');
        return response.data;
    },

    // Ações de Escrita (Mutations)
    async criarFuncao(nome: string): Promise<void> {
        await api.post('/funcoes', { nome });
    },

    async excluirFuncao(id: number): Promise<void> {
        await api.delete(`/funcoes/${id}`);
    },

    async atualizarFuncao(id: number, dados: { nome: string; baseHorasMensais?: number; custoHoraMercado?: number }): Promise<Funcao> {
        const response = await api.put(`/funcoes/${id}`, dados);
        return response.data;
    },

    async solicitarAlteracaoPerfil(dados: FormPerfilState): Promise<void> {
        await api.post('/perfil/solicitar-alteracao', dados);
    },

    async salvarConfiguracoes(dados: ConfiguracoesGlobaisPayload): Promise<void> {
        await api.put('/configuracoes', dados);
    }
};