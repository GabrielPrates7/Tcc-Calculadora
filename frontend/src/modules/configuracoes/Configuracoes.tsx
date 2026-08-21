import React from 'react';
import { Settings } from 'lucide-react';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';

// Importação dos blocos modulares
import { BlocoPerfil } from './components/BlocoPerfil';
import { BlocoFinanceiro } from './components/BlocoFinanceiro';
import { BlocoOrcamento } from './components/BlocoOrcamento';
import { BlocoFuncoes } from './components/BlocoFuncoes';

import './Configuracoes.css';

export function Configuracoes() {
    const {
        formPerfil, setFormPerfil,
        formFinanceiro, setFormFinanceiro,
        formOrcamento, setFormOrcamento,
        funcoes, novaFuncao, setNovaFuncao, loading,
        modalConfirmacao, fecharModal,
        handleSubmitPerfil, handleSalvarParametros, handleAdicionarFuncao, handleExcluirFuncao
    } = useConfiguracoes();

    return (
        <div className="config-container">
            <div className="header-top" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <Settings size={28} color="#f97316" /> Configurações Globais
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '8px' }}>Central de parâmetros, regras de negócio e controle de acesso.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', alignItems: 'start' }}>
                
                <BlocoPerfil 
                    formPerfil={formPerfil} 
                    setFormPerfil={setFormPerfil} 
                    onSubmit={handleSubmitPerfil} 
                />

                <BlocoFinanceiro 
                    formFinanceiro={formFinanceiro} 
                    setFormFinanceiro={setFormFinanceiro} 
                    // TIPAGEM CORRIGIDA AQUI
                    onSubmit={(e: React.FormEvent) => handleSalvarParametros(e, 'Financeiro')} 
                />

                <BlocoOrcamento 
                    formOrcamento={formOrcamento} 
                    setFormOrcamento={setFormOrcamento} 
                    // TIPAGEM CORRIGIDA AQUI
                    onSubmit={(e: React.FormEvent) => handleSalvarParametros(e, 'Orçamentos')} 
                />

                <BlocoFuncoes 
                    funcoes={funcoes} 
                    novaFuncao={novaFuncao} 
                    setNovaFuncao={setNovaFuncao} 
                    loading={loading}
                    onAdd={handleAdicionarFuncao} 
                    onDelete={handleExcluirFuncao} 
                />

            </div>

            <ConfirmModal 
                isOpen={modalConfirmacao.isOpen}
                title={modalConfirmacao.title}
                message={modalConfirmacao.message}
                textoConfirmar={modalConfirmacao.textoConfirmar}
                onConfirm={modalConfirmacao.onConfirm}
                onCancel={fecharModal}
            />
        </div>
    );
}