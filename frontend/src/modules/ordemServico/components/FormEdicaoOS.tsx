import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { OrdemServico } from '../types';

interface Props {
    osSelecionada: OrdemServico;
    onSalvarEdicao: (id: number, dados: Partial<OrdemServico>) => Promise<void>;
    onCancelar: () => void;
}

export function FormEdicaoOS({ osSelecionada, onSalvarEdicao, onCancelar }: Props) {
    const equipeInicial = osSelecionada.responsaveis_execucao
        ? osSelecionada.responsaveis_execucao.split(',').map(item => item.trim()).filter(Boolean)
        : [];

    const [equipe, setEquipe] = useState<string[]>(equipeInicial);
    const [novoMembro, setNovoMembro] = useState('');

    const [formData, setFormData] = useState({
        data_entrega: osSelecionada.data_entrega ? osSelecionada.data_entrega.split('T')[0] : '',
        data_finalizacao: osSelecionada.data_finalizacao ? osSelecionada.data_finalizacao.split('T')[0] : '',
        laudo_tecnico: osSelecionada.laudo_tecnico || '',
        observacoes: osSelecionada.observacoes || '',
        custo_extra_materiais: osSelecionada.custo_extra_materiais || '',
        descricao_materiais_extras: osSelecionada.descricao_materiais_extras || ''
    });

    const estaFinalizado = ['pronto', 'entregue'].includes(osSelecionada.status_producao);

    const handleAddMembro = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const nome = novoMembro.trim();
        if (nome && !equipe.includes(nome)) {
            setEquipe([...equipe, nome]);
            setNovoMembro('');
        }
    };

    const handleRemoveMembro = (nomeRemover: string) => {
        setEquipe(equipe.filter(membro => membro !== nomeRemover));
    };

    const handleKeyDownEquipe = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddMembro();
        }
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const responsaveis_execucao = equipe.join(', ');
        const custoNumero = typeof formData.custo_extra_materiais === 'string' 
            ? parseFloat(formData.custo_extra_materiais.replace(',', '.')) || 0 
            : Number(formData.custo_extra_materiais) || 0;

        // Montagem do payload limpo sem enviar strings vazias para colunas DATE do SQL
        const payload: Partial<OrdemServico> = {
            laudo_tecnico: formData.laudo_tecnico.trim() || undefined,
            observacoes: formData.observacoes.trim() || undefined,
            responsaveis_execucao: responsaveis_execucao || undefined,
            custo_extra_materiais: custoNumero,
            descricao_materiais_extras: formData.descricao_materiais_extras.trim() || undefined,
            data_entrega: formData.data_entrega || undefined,
            data_finalizacao: formData.data_finalizacao || undefined
        };

        await onSalvarEdicao(osSelecionada.os_id, payload);
        onCancelar();
    };

    return (
        <form onSubmit={handleSalvar} className="form-edicao-os">
            {/* GRID SUPERIOR RESPONSIVO: 3 COLUNAS SE PRONTO/ENTREGUE, 2 COLUNAS SE EM ANDAMENTO */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: estaFinalizado ? '1.4fr 1fr 1fr' : '1.3fr 1fr', 
                gap: '16px', 
                marginBottom: '16px' 
            }}>
                {/* 1. EQUIPE EXECUTORA */}
                <div className="form-group" style={{ margin: 0 }}>
                    <label>RESPONSÁVEIS PELA EXECUÇÃO (EQUIPE)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text"
                            className="form-input"
                            placeholder="Digite o nome e pressione Enter..."
                            value={novoMembro}
                            onChange={(e) => setNovoMembro(e.target.value)}
                            onKeyDown={handleKeyDownEquipe}
                        />
                        <button 
                            type="button" 
                            onClick={() => handleAddMembro()}
                            style={{
                                backgroundColor: '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {equipe.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {equipe.map((membro, i) => (
                                <span key={i} style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: '#e2e8f0',
                                    color: '#1e293b',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                }}>
                                    {membro}
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveMembro(membro)}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: 0, color: '#64748b' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. PRAZO ACORDADO */}
                <div className="form-group" style={{ margin: 0 }}>
                    <label>PRAZO DE ENTREGA ACORDADO</label>
                    <input 
                        type="date" 
                        className="form-input"
                        value={formData.data_entrega}
                        onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                    />
                </div>

                {/* 3. DATA DE TÉRMINO REAL (EXIBIÇÃO CONDICIONAL PARA PRONTO/ENTREGUE) */}
                {estaFinalizado && (
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ color: '#16a34a', fontWeight: 700 }}>DATA DE TÉRMINO (REAL)</label>
                        <input 
                            type="date" 
                            className="form-input"
                            style={{ 
                                borderColor: '#22c55e', 
                                backgroundColor: '#f0fdf4', 
                                color: '#15803d', 
                                fontWeight: 600 
                            }}
                            value={formData.data_finalizacao}
                            onChange={(e) => setFormData({ ...formData, data_finalizacao: e.target.value })}
                        />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label>LAUDO TÉCNICO / DIAGNÓSTICO DA OFICINA</label>
                <textarea 
                    className="form-input" 
                    rows={3}
                    placeholder="Ex: Identificado desgaste na folha central de MDF; necessária aplicação de fita de borda dupla."
                    value={formData.laudo_tecnico}
                    onChange={(e) => setFormData({ ...formData, laudo_tecnico: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>OBSERVAÇÕES GERAIS / INSTRUÇÕES DE MONTAGEM</label>
                <textarea 
                    className="form-input" 
                    rows={3}
                    placeholder="Ex: Entregar após as 14h. Falar direto com a recepção."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
                <label style={{ color: '#475569', fontSize: '0.85rem' }}>DESPESAS E MATERIAIS ADICIONAIS (PÓS-ORÇAMENTO)</label>
                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '6px 0 12px 0' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.78rem' }}>CUSTO EXTRA MANUAL (R$)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="form-input"
                            placeholder="0,00"
                            value={formData.custo_extra_materiais}
                            onChange={(e) => setFormData({ ...formData, custo_extra_materiais: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.78rem' }}>DESCRIÇÃO DO MATERIAL GASTO</label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder="Ex: 2 dobradiças extras + cola instantânea"
                            value={formData.descricao_materiais_extras}
                            onChange={(e) => setFormData({ ...formData, descricao_materiais_extras: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button 
                    type="button" 
                    onClick={onCancelar}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#475569',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    style={{
                        padding: '8px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#f97316',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    Salvar Alterações
                </button>
            </div>
        </form>
    );
}