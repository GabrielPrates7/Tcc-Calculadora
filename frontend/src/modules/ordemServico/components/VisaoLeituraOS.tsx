import { User, Tag, DollarSign, Calendar, Printer, Wrench, FileText, AlertTriangle, Users } from 'lucide-react';
import type { OrdemServico } from '../types';

interface Props {
    osSelecionada: OrdemServico;
    equipeListRead: string[];
    formatarData: (data?: string) => string;
    formatarBRL: (valor: number | string) => string;
    onAtualizarFinanceiro: (novoStatus: OrdemServico['status_financeiro']) => void;
}

export function VisaoLeituraOS({
    osSelecionada,
    equipeListRead,
    formatarData,
    formatarBRL,
    onAtualizarFinanceiro
}: Props) {
    return (
        <>
            <div className="os-info-grid">
                <div className="os-info-box">
                    <User size={18} color="#f97316"/>
                    <div>
                        <label>Cliente</label>
                        <p>{osSelecionada.cliente || 'Consumidor Final'}</p>
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
                    <Calendar size={18} color="#64748b"/>
                    <div>
                        <label>Data de Emissão</label>
                        <p>{formatarData(osSelecionada.criado_em)}</p>
                    </div>
                </div>

                <div className="os-info-box">
                    <Calendar size={18} color="#3b82f6"/>
                    <div>
                        <label>Prazo de Entrega Acordado</label>
                        <p>{formatarData(osSelecionada.data_entrega)}</p>
                    </div>
                </div>
            </div>

            {(equipeListRead.length > 0 || osSelecionada.laudo_tecnico || osSelecionada.observacoes || Number(osSelecionada.custo_extra_materiais) > 0) && (
                <div className="os-secao-tecnica">
                    {equipeListRead.length > 0 && (
                        <div className="box-tecnica" style={{ borderLeftColor: '#3b82f6' }}>
                            <div className="box-header">
                                <Users size={16} color="#3b82f6" />
                                <strong>Equipe / Responsáveis pela Execução</strong>
                            </div>
                            <div className="equipe-list-read">
                                {equipeListRead.map((membro, idx) => (
                                    <div key={idx} className="equipe-item-read">
                                        <User size={15} color="#3b82f6" />
                                        <span>{membro}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                <strong>{formatarBRL(osSelecionada.custo_extra_materiais || 0)}</strong> 
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
    );
}