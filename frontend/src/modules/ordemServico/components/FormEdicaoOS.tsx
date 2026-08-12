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

    const estaFinalizado = ['pronto', 'entregue'].includes(osSelecionada.status_producao);
    const estaEntregue = osSelecionada.status_producao === 'entregue';

   // CORREÇÃO: O fallback para O.S. antigas (sem data_entregue no banco) 
    // deve puxar a última vez que o cartão foi movido (atualizado_em), e não a finalização.
    const fallbackDataEntregue = estaEntregue 
        ? (osSelecionada.atualizado_em || '').split('T')[0] 
        : '';

    const [formData, setFormData] = useState({
        data_entrega: osSelecionada.data_entrega ? osSelecionada.data_entrega.split('T')[0] : '',
        data_finalizacao: osSelecionada.data_finalizacao ? osSelecionada.data_finalizacao.split('T')[0] : '',
        data_entregue: osSelecionada.data_entregue ? osSelecionada.data_entregue.split('T')[0] : fallbackDataEntregue,
        laudo_tecnico: osSelecionada.laudo_tecnico || '',
        observacoes: osSelecionada.observacoes || '',
        observacoes_cliente: osSelecionada.observacoes_cliente || '',
        custo_extra_materiais: osSelecionada.custo_extra_materiais || '',
        descricao_materiais_extras: osSelecionada.descricao_materiais_extras || ''
    });

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

        const payload: Partial<OrdemServico> = {
            laudo_tecnico: formData.laudo_tecnico.trim() || undefined,
            observacoes: formData.observacoes.trim() || undefined,
            observacoes_cliente: formData.observacoes_cliente.trim() || undefined,
            responsaveis_execucao: responsaveis_execucao || undefined,
            custo_extra_materiais: custoNumero,
            descricao_materiais_extras: formData.descricao_materiais_extras.trim() || undefined,
            data_entrega: formData.data_entrega || undefined,
            data_finalizacao: formData.data_finalizacao || undefined,
            data_entregue: formData.data_entregue || undefined
        };

        await onSalvarEdicao(osSelecionada.os_id, payload);
        onCancelar();
    };

    return (
        <form onSubmit={handleSalvar} className="form-edicao-os">
            
            {/* LINHA 1: EQUIPE E PRAZO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
                            style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {equipe.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                            {equipe.map((membro, i) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#e2e8f0', color: '#1e293b', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
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

                <div className="form-group" style={{ margin: 0 }}>
                    <label>PRAZO DE ENTREGA ACORDADO</label>
                    <input 
                        type="date" 
                        className="form-input"
                        value={formData.data_entrega}
                        onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                    />
                </div>
            </div>

            {/* LINHA 2: DATAS REAIS (SE FINALIZADO OU ENTREGUE) */}
            {estaFinalizado && (
                <div style={{ display: 'grid', gridTemplateColumns: estaEntregue ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ color: '#16a34a', fontWeight: 700 }}>DATA DE TÉRMINO DA PRODUÇÃO (REAL)</label>
                        <input 
                            type="date" 
                            className="form-input"
                            style={{ borderColor: '#22c55e', backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: 600 }}
                            value={formData.data_finalizacao}
                            onChange={(e) => setFormData({ ...formData, data_finalizacao: e.target.value })}
                        />
                    </div>
                    {estaEntregue && (
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ color: '#475569', fontWeight: 700 }}>DATA EFETIVA DE ENTREGA</label>
                            <input 
                                type="date" 
                                className="form-input"
                                style={{ borderColor: '#64748b', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 600 }}
                                value={formData.data_entregue}
                                onChange={(e) => setFormData({ ...formData, data_entregue: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="form-group">
                <label>LAUDO TÉCNICO / DIAGNÓSTICO DA OFICINA</label>
                <textarea 
                    className="form-input" 
                    rows={3}
                    placeholder="Ex: Identificado desgaste na folha central de MDF..."
                    value={formData.laudo_tecnico}
                    onChange={(e) => setFormData({ ...formData, laudo_tecnico: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>OBSERVAÇÕES OPERACIONAIS (INTERNO)</label>
                <textarea 
                    className="form-input" 
                    rows={2}
                    placeholder="Ex: Entregar após as 14h. Falar direto com a recepção."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label style={{ color: '#8b5cf6' }}>FEEDBACK DO CLIENTE / OBSERVAÇÕES DE ENTREGA</label>
                <textarea 
                    className="form-input" 
                    rows={2}
                    style={{ borderColor: '#c4b5fd' }}
                    placeholder="Ex: O cliente solicitou um reparo extra na maçaneta no ato da entrega..."
                    value={formData.observacoes_cliente}
                    onChange={(e) => setFormData({ ...formData, observacoes_cliente: e.target.value })}
                />
            </div>

            <div className="form-section-divider" style={{ marginTop: '20px' }}>
                <h4>Despesas e Materiais Adicionais (Pós-Orçamento)</h4>
            </div>
            
            <div className="form-grid-2">
                <div className="form-group">
                    <label>Custo Extra Manual (R$)</label>
                    <input 
                        type="number" 
                        step="0.01" min="0"
                        className="form-input"
                        placeholder="Ex: 150.00"
                        value={formData.custo_extra_materiais}
                        onChange={(e) => setFormData({ ...formData, custo_extra_materiais: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Descrição do Material Gasto</label>
                    <input 
                        type="text" 
                        className="form-input"
                        placeholder="Ex: 2 dobradiças extras"
                        value={formData.descricao_materiais_extras}
                        onChange={(e) => setFormData({ ...formData, descricao_materiais_extras: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-actions-footer">
                <button type="button" className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
                <button type="submit" className="btn-salvar-os">Salvar Alterações</button>
            </div>
        </form>
    );
}