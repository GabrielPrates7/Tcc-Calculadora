import React, { useState } from 'react';
import { Save, Plus, User, X } from 'lucide-react';
import type { OrdemServico } from '../types';

interface Props {
    osSelecionada: OrdemServico;
    onSalvarEdicao: (id: number, dados: Partial<OrdemServico>) => Promise<void>;
    onCancelar: () => void;
}

export function FormEdicaoOS({ osSelecionada, onSalvarEdicao, onCancelar }: Props) {
    const [salvando, setSalvando] = useState(false);

    const [equipeList, setEquipeList] = useState<string[]>(
        osSelecionada.responsaveis_execucao 
            ? osSelecionada.responsaveis_execucao.split(',').map(item => item.trim()).filter(Boolean)
            : []
    );
    const [novoMembro, setNovoMembro] = useState('');

    const [formData, setFormData] = useState({
        data_entrega: osSelecionada.data_entrega ? osSelecionada.data_entrega.split('T')[0] : '',
        observacoes: osSelecionada.observacoes || '',
        laudo_tecnico: osSelecionada.laudo_tecnico || '',
        custo_extra_materiais: osSelecionada.custo_extra_materiais || 0,
        descricao_materiais_extras: osSelecionada.descricao_materiais_extras || ''
    });

    const adicionarMembro = () => {
        const nome = novoMembro.trim();
        if (nome && !equipeList.includes(nome)) {
            setEquipeList([...equipeList, nome]);
            setNovoMembro('');
        }
    };

    const removerMembro = (index: number) => {
        setEquipeList(equipeList.filter((_, idx) => idx !== index));
    };

    const handleKeyDownMembro = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarMembro();
        }
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        try {
            const payload = {
                ...formData,
                responsaveis_execucao: equipeList.join(', ')
            };
            await onSalvarEdicao(osSelecionada.os_id, payload);
            onCancelar();
        } finally {
            setSalvando(false);
        }
    };

    return (
        <form onSubmit={handleSalvar} className="form-edicao-os no-print">
            <div className="form-grid-2">
                <div className="form-group">
                    <label>Responsáveis pela Execução (Equipe)</label>
                    <div className="equipe-input-container">
                        <input 
                            type="text" 
                            placeholder="Digite o nome e pressione Enter..." 
                            value={novoMembro}
                            onChange={(e) => setNovoMembro(e.target.value)}
                            onKeyDown={handleKeyDownMembro}
                        />
                        <button 
                            type="button" 
                            className="btn-add-membro" 
                            onClick={adicionarMembro}
                            title="Adicionar à lista"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {equipeList.length > 0 && (
                        <div className="equipe-list-edit">
                            {equipeList.map((membro, idx) => (
                                <div key={idx} className="equipe-item-edit">
                                    <span><User size={15} color="#3b82f6" /> {membro}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => removerMembro(idx)}
                                        title="Remover profissional"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Prazo de Entrega Acordado</label>
                    <input 
                        type="date" 
                        value={formData.data_entrega}
                        onChange={(e) => setFormData({...formData, data_entrega: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Laudo Técnico / Diagnóstico da Oficina</label>
                <textarea 
                    rows={3} 
                    placeholder="Ex: Identificado desgaste na folha central de MDF; necessária aplicação de fita de borda dupla."
                    value={formData.laudo_tecnico}
                    onChange={(e) => setFormData({...formData, laudo_tecnico: e.target.value})}
                />
            </div>

            <div className="form-group">
                <label>Observações Gerais / Instruções de Montagem</label>
                <textarea 
                    rows={3} 
                    placeholder="Ex: Entregar após as 14h. Falar direto com a recepção."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
            </div>

            <div className="form-section-divider">
                <h4>Despesas e Materiais Adicionais (Pós-Orçamento)</h4>
            </div>

            <div className="form-grid-2">
                <div className="form-group">
                    <label>Custo Extra Manual (R$)</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        placeholder="0,00"
                        value={formData.custo_extra_materiais}
                        onChange={(e) => setFormData({...formData, custo_extra_materiais: parseFloat(e.target.value) || 0})}
                    />
                </div>

                <div className="form-group">
                    <label>Descrição do Material Gasto</label>
                    <input 
                        type="text" 
                        placeholder="Ex: 2 dobradiças extras + cola instantânea"
                        value={formData.descricao_materiais_extras}
                        onChange={(e) => setFormData({...formData, descricao_materiais_extras: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-actions-footer">
                <button type="button" className="btn-cancelar" onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="submit" className="btn-salvar-os" disabled={salvando}>
                    <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    );
}