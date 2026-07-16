import { X, User, Tag, DollarSign, Calendar, Printer } from 'lucide-react';
import type { OrdemServico } from '../types';
import { formatarBRL } from '../../../utils/formatters'; // <-- Ajuste o nível de pastas se precisar (../../)

interface Props {
    osSelecionada: OrdemServico;
    tituloColunaAtual: string; // Recebe o nome da coluna (ex: "Em Produção")
    onClose: () => void;
    onAtualizarFinanceiro: (novoStatus: OrdemServico['status_financeiro']) => void;
}

export function ModalDetalhesOS({ osSelecionada, tituloColunaAtual, onClose, onAtualizarFinanceiro }: Props) {
    // Formatação de data local para o modal
    const formatarData = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : 'Sem prazo';

    return (
        <div className="modal-overlay">
            <div className="modal-os">
                <div className="modal-os-header">
                    <div>
                        <h2>Detalhes da Ordem #{osSelecionada.os_id}</h2>
                        <span className="modal-coluna-atual no-print">
                            Encontra-se em: <strong>{tituloColunaAtual}</strong>
                        </span>
                    </div>
                    <button className="btn-close no-print" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-os-body">
                    <div className="os-info-grid">
                        <div className="os-info-box">
                            <User size={18} color="#64748b"/>
                            <div>
                                <label>Cliente</label>
                                <p>{osSelecionada.cliente || 'Consumidor Final'}</p>
                            </div>
                        </div>
                        <div className="os-info-box">
                            <Tag size={18} color="#64748b"/>
                            <div>
                                <label>Produto / Serviço</label>
                                <p>{osSelecionada.nome_produto}</p>
                            </div>
                        </div>
                        <div className="os-info-box">
                            <DollarSign size={18} color="#64748b"/>
                            <div>
                                <label>Valor Fechado</label>
                                <p className="valor-destaque">{formatarBRL(osSelecionada.preco_venda)}</p>
                            </div>
                        </div>
                        <div className="os-info-box">
                            <Calendar size={18} color="#64748b"/>
                            <div>
                                <label>Prazo de Entrega</label>
                                <p>{formatarData(osSelecionada.data_entrega)}</p>
                            </div>
                        </div>
                    </div>

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
                    
                    {/* TEMPLATE DE IMPRESSÃO (Oculto na tela) */}
                    <div className="print-layout">
                        <div className="print-header">
                            <h1>FICHA DE PRODUÇÃO</h1>
                            <h2>Ordem de Serviço #{osSelecionada.os_id}</h2>
                        </div>

                        <div className="print-info-grid">
                            <div className="print-box">
                                <strong>Cliente:</strong><br/>
                                {osSelecionada.cliente || 'Consumidor Final'}
                            </div>
                            <div className="print-box">
                                <strong>Produto / Serviço:</strong><br/>
                                {osSelecionada.nome_produto}
                            </div>
                            <div className="print-box" style={{ gridColumn: 'span 2' }}>
                                <strong>Prazo de Entrega Acordado:</strong> {formatarData(osSelecionada.data_entrega)}
                            </div>
                        </div>

                        <div className="print-section">
                            <h3>Observações / Medidas Específicas</h3>
                            <div className="print-lines"></div>
                            <div className="print-lines"></div>
                            <div className="print-lines"></div>
                        </div>

                        <div className="print-section">
                            <h3>Checklist de Produção</h3>
                            <div className="print-check-item"><span className="box"></span> Separação de Materiais</div>
                            <div className="print-check-item"><span className="box"></span> Execução / Montagem</div>
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