import React, { useState } from 'react';
import { X, User, Tag, DollarSign, Calendar, Printer, Edit3, Trash2, Save, FileText, Wrench, AlertTriangle } from 'lucide-react';
import type { OrdemServico } from '../types';
import { formatarBRL } from '../../../utils/formatters';

interface Props {
    osSelecionada: OrdemServico;
    tituloColunaAtual: string;
    onClose: () => void;
    onAtualizarFinanceiro: (novoStatus: OrdemServico['status_financeiro']) => void;
    onSalvarEdicao: (id: number, dados: Partial<OrdemServico>) => Promise<void>;
    onExcluir: (id: number) => Promise<void>;
}

export function ModalDetalhesOS({ 
    osSelecionada, 
    tituloColunaAtual, 
    onClose, 
    onAtualizarFinanceiro,
    onSalvarEdicao,
    onExcluir 
}: Props) {
    const [modoEdicao, setModoEdicao] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Estados locais do formulário de edição
    const [formData, setFormData] = useState({
        solicitante: osSelecionada.solicitante || '',
        data_entrega: osSelecionada.data_entrega ? osSelecionada.data_entrega.split('T')[0] : '',
        observacoes: osSelecionada.observacoes || '',
        laudo_tecnico: osSelecionada.laudo_tecnico || '',
        custo_extra_materiais: osSelecionada.custo_extra_materiais || 0,
        descricao_materiais_extras: osSelecionada.descricao_materiais_extras || ''
    });

    const formatarData = (data?: string) => {
        if (!data) return 'Sem prazo';
        const [ano, mes, dia] = data.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        try {
            await onSalvarEdicao(osSelecionada.os_id, formData);
            setModoEdicao(false);
        } finally {
            setSalvando(false);
        }
    };

    const handleConfirmarExclusao = async () => {
        const confirma = window.confirm(`ATENÇÃO: Deseja realmente excluir a Ordem de Serviço #${osSelecionada.os_id}? Esta ação não poderá ser desfeita.`);
        if (confirma) {
            await onExcluir(osSelecionada.os_id);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-os">
                <div className="modal-os-header">
                    <div>
                        <h2>Ordem de Serviço #{osSelecionada.os_id}</h2>
                        <span className="modal-coluna-atual no-print">
                            Status de Produção: <strong>{tituloColunaAtual}</strong>
                        </span>
                    </div>
                    <div className="modal-header-actions no-print">
                        {!modoEdicao && (
                            <>
                                <button 
                                    className="btn-action btn-edit" 
                                    onClick={() => setModoEdicao(true)}
                                    title="Editar informações operacionais e técnicas"
                                >
                                    <Edit3 size={18} /> Editar O.S.
                                </button>
                                <button 
                                    className="btn-action btn-delete" 
                                    onClick={handleConfirmarExclusao}
                                    title="Excluir Ordem de Serviço"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
                        <button className="btn-close" onClick={onClose}><X size={24} /></button>
                    </div>
                </div>

                <div className="modal-os-body">
                    {modoEdicao ? (
                        /* ================== MODO DE EDIÇÃO ================== */
                        <form onSubmit={handleSalvar} className="form-edicao-os no-print">
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Responsável / Solicitante</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Carlos (Encarregado)" 
                                        value={formData.solicitante}
                                        onChange={(e) => setFormData({...formData, solicitante: e.target.value})}
                                    />
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
                                    rows={2} 
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
                                <button type="button" className="btn-cancelar" onClick={() => setModoEdicao(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar-os" disabled={salvando}>
                                    <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* ================== MODO DE LEITURA ================== */
                        <>
                            <div className="os-info-grid">
                                <div className="os-info-box">
                                    <User size={18} color="#f97316"/>
                                    <div>
                                        <label>Cliente</label>
                                        <p>{osSelecionada.cliente || 'Consumidor Final'}</p>
                                        {osSelecionada.solicitante && (
                                            <span className="os-subinfo">Solicitante: {osSelecionada.solicitante}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="os-info-box">
                                    <Tag size={18} color="#f97316"/>
                                    <div>
                                        <label>Produto / Serviço</label>
                                        <p>{osSelecionada.nome_produto}</p>
                                    </div>
                                </div>

                                <div className="os-info-box">
                                    <DollarSign size={18} color="#16a34a"/>
                                    <div>
                                        <label>Valor Fechado</label>
                                        <p className="valor-destaque">{formatarBRL(osSelecionada.preco_venda)}</p>
                                    </div>
                                </div>

                                <div className="os-info-box">
                                    <Calendar size={18} color="#3b82f6"/>
                                    <div>
                                        <label>Prazo de Entrega</label>
                                        <p>{formatarData(osSelecionada.data_entrega)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* CAMPOS PROFISSIONAIS DE DIAGNÓSTICO E OFICINA */}
                            {(osSelecionada.laudo_tecnico || osSelecionada.observacoes || Number(osSelecionada.custo_extra_materiais) > 0) && (
                                <div className="os-secao-tecnica">
                                    {osSelecionada.laudo_tecnico && (
                                        <div className="box-tecnica">
                                            <div className="box-header">
                                                <Wrench size={16} color="#f97316" />
                                                <strong>Laudo Técnico / Diagnóstico</strong>
                                            </div>
                                            <p>{osSelecionada.laudo_tecnico}</p>
                                        </div>
                                    )}

                                    {osSelecionada.observacoes && (
                                        <div className="box-tecnica">
                                            <div className="box-header">
                                                <FileText size={16} color="#64748b" />
                                                <strong>Observações Operacionais</strong>
                                            </div>
                                            <p>{osSelecionada.observacoes}</p>
                                        </div>
                                    )}

                                    {Number(osSelecionada.custo_extra_materiais) > 0 && (
                                        <div className="box-tecnica extra-custo">
                                            <div className="box-header">
                                                <AlertTriangle size={16} color="#dc2626" />
                                                <strong>Adicional de Materiais (Consumo Extra)</strong>
                                            </div>
                                            <p>
                                                <strong>{formatarBRL(osSelecionada.custo_extra_materiais)}</strong> 
                                                {osSelecionada.descricao_materiais_extras && ` — ${osSelecionada.descricao_materiais_extras}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="os-financeiro-panel">
                                <h3 className="no-print">Status de Pagamento</h3>
                                <p className="no-print">Atualize a situação financeira desta ordem de serviço:</p>
                                <div className="botoes-financeiro no-print">
                                    <button 
                                        className={`btn-fin btn-pendente ${osSelecionada.status_financeiro === 'pendente' ? 'ativo' : ''}`}
                                        onClick={() => onAtualizarFinanceiro('pendente')}
                                    >
                                        🔴 Pendente
                                    </button>
                                    <button 
                                        className={`btn-fin btn-sinal ${osSelecionada.status_financeiro === 'sinal_pago' ? 'ativo' : ''}`}
                                        onClick={() => onAtualizarFinanceiro('sinal_pago')}
                                    >
                                        🟡 Sinal Pago (50%)
                                    </button>
                                    <button 
                                        className={`btn-fin btn-pago ${osSelecionada.status_financeiro === 'pago' ? 'ativo' : ''}`}
                                        onClick={() => onAtualizarFinanceiro('pago')}
                                    >
                                        🟢 Totalmente Pago
                                    </button>
                                </div>

                                <div className="os-acoes-finais no-print" style={{marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px'}}>
                                    <button className="btn-print-os" onClick={() => window.print()}>
                                        <Printer size={18} /> Imprimir Ficha de Produção
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================== TEMPLATE DE IMPRESSÃO A4 ================== */}
                    <div className="print-layout">
                        <div className="print-header">
                            <h1>FICHA DE PRODUÇÃO</h1>
                            <h2>Ordem de Serviço #{osSelecionada.os_id}</h2>
                        </div>

                        <div className="print-info-grid">
                            <div className="print-box">
                                <strong>Cliente:</strong><br/>
                                {osSelecionada.cliente || 'Consumidor Final'}
                                {osSelecionada.solicitante && ` (Sol.: ${osSelecionada.solicitante})`}
                            </div>
                            <div className="print-box">
                                <strong>Produto / Serviço:</strong><br/>
                                {osSelecionada.nome_produto}
                            </div>
                            <div className="print-box" style={{ gridColumn: 'span 2' }}>
                                <strong>Prazo de Entrega Acordado:</strong> {formatarData(osSelecionada.data_entrega)}
                            </div>
                        </div>

                        {osSelecionada.laudo_tecnico && (
                            <div className="print-section">
                                <h3>Laudo Técnico e Diagnóstico</h3>
                                <div className="print-text-block">{osSelecionada.laudo_tecnico}</div>
                            </div>
                        )}

                        {osSelecionada.observacoes && (
                            <div className="print-section">
                                <h3>Observações / Medidas</h3>
                                <div className="print-text-block">{osSelecionada.observacoes}</div>
                            </div>
                        )}

                        {Number(osSelecionada.custo_extra_materiais) > 0 && (
                            <div className="print-section">
                                <h3>Consumo Extra de Materiais</h3>
                                <div className="print-text-block">
                                    <strong>Valor Adicional:</strong> {formatarBRL(osSelecionada.custo_extra_materiais)}<br/>
                                    <strong>Descrição:</strong> {osSelecionada.descricao_materiais_extras || 'Não especificado'}
                                </div>
                            </div>
                        )}

                        <div className="print-section">
                            <h3>Checklist de Produção</h3>
                            <div className="print-check-item"><span className="box"></span> Separação de Materiais</div>
                            <div className="print-check-item"><span className="box"></span> Execução / Usinagem</div>
                            <div className="print-check-item"><span className="box"></span> Acabamento / Revisão Final</div>
                            <div className="print-check-item"><span className="box"></span> Embalagem / Pronto para Entrega</div>
                        </div>

                        <div className="print-signatures">
                            <div className="sig-line">
                                <hr/>
                                <span>Responsável pela Produção</span>
                            </div>
                            <div className="sig-line">
                                <hr/>
                                <span>Controle de Qualidade</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}