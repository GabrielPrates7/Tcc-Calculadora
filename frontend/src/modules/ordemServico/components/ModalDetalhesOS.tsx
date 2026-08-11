import { useState } from 'react';
import { X, Edit3, Trash2, CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import type { OrdemServico } from '../types';
import { formatarBRL } from '../../../utils/formatters';
import { FormEdicaoOS } from './FormEdicaoOS';
import { VisaoLeituraOS } from './VisaoLeituraOS';
import { FichaProducaoPrint } from './FichaProducaoPrint';

interface Props {
    osSelecionada: OrdemServico;
    tituloColunaAtual: string;
    onClose: () => void;
    onSalvarEdicao: (id: number, dados: Partial<OrdemServico>) => Promise<void>;
    onExcluir: (id: number) => Promise<void>;
    onRegistrarPagamento: (osId: number, dados: { valor: number; forma_pagamento: string; data_pagamento: string }) => Promise<void>;
    onExcluirPagamento: (osId: number, pagamentoId: number) => Promise<void>;
}

export function ModalDetalhesOS({ 
    osSelecionada, 
    tituloColunaAtual, 
    onClose, 
    onSalvarEdicao,
    onExcluir,
    onRegistrarPagamento,
    onExcluirPagamento
}: Props) {
    const [modoEdicao, setModoEdicao] = useState(false);
    const [mostrarConfirmacaoExclusao, setMostrarConfirmacaoExclusao] = useState(false);

    const formatarData = (data?: string) => {
        if (!data) return 'Sem prazo';
        const [ano, mes, dia] = data.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const executarExclusaoDefinitiva = async () => {
        await onExcluir(osSelecionada.os_id);
        setMostrarConfirmacaoExclusao(false);
        onClose();
    };

    const equipeListRead = osSelecionada.responsaveis_execucao
        ? osSelecionada.responsaveis_execucao.split(',').map(item => item.trim()).filter(Boolean)
        : [];

    const estaFinalizado = osSelecionada.status_producao === 'pronto' || osSelecionada.status_producao === 'entregue';
    const estaEntregue = osSelecionada.status_producao === 'entregue';
    const dataFimReal = osSelecionada.data_finalizacao || osSelecionada.atualizado_em;
    const dataEntregueReal = osSelecionada.data_entregue || osSelecionada.atualizado_em;

    return (
        <div className="modal-overlay">
            <div className="modal-os">
                <div className="modal-os-header">
                    <div>
                        <h2>Ordem de Serviço #{osSelecionada.os_id}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                            <span className="modal-coluna-atual no-print">
                                Status de Produção: <strong>{tituloColunaAtual}</strong>
                            </span>
                            
                            {estaFinalizado && dataFimReal && (
                                <span className="no-print" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#16a34a',
                                    backgroundColor: '#f0fdf4',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbf7d0'
                                }}>
                                    <CheckCircle2 size={14} />
                                    Concluído em: {formatarData(dataFimReal)}
                                </span>
                            )}

                            {estaEntregue && dataEntregueReal && (
                                <span className="no-print" style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    color: '#475569',
                                    backgroundColor: '#f8fafc',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1'
                                }}>
                                    <Package size={14} />
                                    Entregue em: {formatarData(dataEntregueReal)}
                                </span>
                            )}
                        </div>
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
                                    onClick={() => setMostrarConfirmacaoExclusao(true)}
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
                        <FormEdicaoOS 
                            osSelecionada={osSelecionada}
                            onSalvarEdicao={onSalvarEdicao}
                            onCancelar={() => setModoEdicao(false)}
                        />
                    ) : (
                        <VisaoLeituraOS 
                            osSelecionada={osSelecionada}
                            equipeListRead={equipeListRead}
                            formatarData={formatarData}
                            formatarBRL={formatarBRL}
                            onRegistrarPagamento={onRegistrarPagamento}
                            onExcluirPagamento={onExcluirPagamento}
                        />
                    )}

                    <FichaProducaoPrint 
                        osSelecionada={osSelecionada}
                        equipeListRead={equipeListRead}
                        formatarData={formatarData}
                        formatarBRL={formatarBRL}
                    />
                </div>
            </div>

            {mostrarConfirmacaoExclusao && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.80)', 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 99999,
                    backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '450px',
                        padding: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        color: '#f8fafc',
                        fontFamily: 'inherit'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                backgroundColor: '#450a0a',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #7f1d1d'
                            }}>
                                <AlertTriangle size={24} color="#ef4444" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Excluir Ordem de Serviço?</h3>
                        </div>
                        
                        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            Tem certeza que deseja excluir a ordem de serviço de <strong>{osSelecionada.os_id}-{osSelecionada.cliente || 'Consumidor Final'}</strong> {osSelecionada.nome_produto && `(${osSelecionada.nome_produto})`}? Esta ação não poderá ser desfeita.
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                            <button 
                                onClick={() => setMostrarConfirmacaoExclusao(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#cbd5e1',
                                    border: '1px solid #475569',
                                    padding: '9px 18px',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#f8fafc'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={executarExclusaoDefinitiva}
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '9px 18px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                            >
                                <Trash2 size={16} /> Sim, excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}