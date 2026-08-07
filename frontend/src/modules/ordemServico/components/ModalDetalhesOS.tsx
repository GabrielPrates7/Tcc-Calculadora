import { useState } from 'react';
import { X, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import type { OrdemServico } from '../types';
import { formatarBRL } from '../../../utils/formatters';
import { FormEdicaoOS } from './FormEdicaoOS';
import { VisaoLeituraOS } from './VisaoLeituraOS';
import { FichaProducaoPrint } from './FichaProducaoPrint';

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

    const formatarData = (data?: string) => {
        if (!data) return 'Sem prazo';
        const [ano, mes, dia] = data.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleConfirmarExclusao = async () => {
        const confirma = window.confirm(`ATENÇÃO: Deseja realmente excluir a Ordem de Serviço #${osSelecionada.os_id}? Esta ação não poderá ser desfeita.`);
        if (confirma) {
            await onExcluir(osSelecionada.os_id);
            onClose();
        }
    };

    const equipeListRead = osSelecionada.responsaveis_execucao
        ? osSelecionada.responsaveis_execucao.split(',').map(item => item.trim()).filter(Boolean)
        : [];

    const estaFinalizado = osSelecionada.status_producao === 'pronto' || osSelecionada.status_producao === 'entregue';
    const dataFimReal = osSelecionada.data_finalizacao || osSelecionada.atualizado_em;

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
                            
                            {/* INDICADOR VISUAL DO TÉRMINO DA PRODUÇÃO NO CABEÇALHO */}
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
                            onAtualizarFinanceiro={onAtualizarFinanceiro}
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
        </div>
    );
}