import { useState } from 'react';
import type { ReactNode } from 'react';
import { User, Tag, DollarSign, Calendar, Printer, Wrench, FileText, AlertTriangle, Users, CheckCircle, Package, ChevronDown, ChevronUp, Plus, Trash2, Info } from 'lucide-react';
import type { OrdemServico } from '../types';

interface Props {
    osSelecionada: OrdemServico;
    equipeListRead: string[];
    formatarData: (data?: string) => string;
    formatarBRL: (valor: number | string) => string;
    onRegistrarPagamento: (osId: number, dados: { valor: number; forma_pagamento: string; data_pagamento: string }) => Promise<void>;
    onExcluirPagamento: (osId: number, pagamentoId: number) => Promise<void>;
}

function TextoExpansivel({ 
    texto, 
    prefixo, 
    limiteCaracteres = 120, 
    textoBotao = "Ler mais" 
}: { 
    texto?: string; 
    prefixo?: ReactNode; 
    limiteCaracteres?: number; 
    textoBotao?: string; 
}) {
    const [expandido, setExpandido] = useState(false);
    const conteudo = texto || '';
    const precisaExpandir = conteudo.length > limiteCaracteres;

    const estiloSeguro = {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        margin: 0
    } as React.CSSProperties;

    if (!precisaExpandir) {
        return <p style={estiloSeguro}>{prefixo}{conteudo}</p>;
    }

    return (
        <div className="texto-expansivel-container">
            <p style={expandido ? estiloSeguro : {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'normal',
                wordBreak: 'break-all',
                overflowWrap: 'anywhere',
                margin: 0
            }}>
                {prefixo}{conteudo}
            </p>
            <button 
                type="button" 
                onClick={() => setExpandido(!expandido)} 
                className="btn-expandir-conteudo no-print"
            >
                {expandido ? <><ChevronUp size={14} /> Mostrar menos</> : <><ChevronDown size={14} /> {textoBotao}</>}
            </button>
        </div>
    );
}

export function VisaoLeituraOS({
    osSelecionada,
    equipeListRead,
    formatarData,
    formatarBRL,
    onRegistrarPagamento,
    onExcluirPagamento
}: Props) {
    const estaFinalizado = ['pronto', 'entregue'].includes(osSelecionada.status_producao);
    const estaEntregue = osSelecionada.status_producao === 'entregue';
    const estaAtrasado = Boolean(osSelecionada.esta_atrasado);

    // Expansão de Equipe
    const [equipeExpandida, setEquipeExpandida] = useState(false);
    const limiteEquipe = 3;
    const equipeExibir = equipeExpandida ? equipeListRead : equipeListRead.slice(0, limiteEquipe);
    const temMaisMembros = equipeListRead.length > limiteEquipe;

    // Expansão de Pagamentos
    const [pagamentosExpandidos, setPagamentosExpandidos] = useState(false);
    const limitePagamentos = 3;
    const pagamentosList = osSelecionada.pagamentos || [];
    const pagamentosExibir = pagamentosExpandidos ? pagamentosList : pagamentosList.slice(0, limitePagamentos);
    const temMaisPagamentos = pagamentosList.length > limitePagamentos;

    // Estados do Formulário Financeiro
    const [valorPgto, setValorPgto] = useState('');
    const [formaPgto, setFormaPgto] = useState('PIX');
    const hoje = new Date().toISOString().split('T')[0];
    const [dataPgto, setDataPgto] = useState(hoje);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para Modais Customizados
    const [alertaCustomizado, setAlertaCustomizado] = useState<{ visivel: boolean; titulo: string; mensagem: string; tipo: 'erro' | 'aviso' } | null>(null);
    const [confirmacaoExcesso, setConfirmacaoExcesso] = useState<{ visivel: boolean; valor: number } | null>(null);
    const [confirmacaoEstorno, setConfirmacaoEstorno] = useState<{ visivel: boolean; idPagamento: number } | null>(null);

    // Cálculos Financeiros Dinâmicos
    const valorTotal = Number(osSelecionada.preco_venda) || 0;
    const valorPago = Number(osSelecionada.total_pago) || 0;
    const saldoDevedor = valorTotal - valorPago;
    
    let percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;
    if (percentualPago > 100) percentualPago = 100;

    const handleAdicionarPagamento = () => {
        if (!valorPgto) {
            return setAlertaCustomizado({ visivel: true, titulo: 'Atenção', mensagem: 'Por favor, informe o valor do pagamento antes de baixar.', tipo: 'aviso' });
        }
        
        const valorNumerico = Number(valorPgto.replace(',', '.'));
        if (isNaN(valorNumerico) || valorNumerico <= 0) {
            return setAlertaCustomizado({ visivel: true, titulo: 'Valor Inválido', mensagem: 'O valor digitado não é válido.', tipo: 'erro' });
        }

        if (valorNumerico > saldoDevedor && saldoDevedor > 0) {
            return setConfirmacaoExcesso({ visivel: true, valor: valorNumerico });
        }

        processarPagamentoServidor(valorNumerico);
    };

    const processarPagamentoServidor = async (valor: number) => {
        setIsSubmitting(true);
        setConfirmacaoExcesso(null);
        try {
            await onRegistrarPagamento(osSelecionada.os_id, {
                valor: valor,
                forma_pagamento: formaPgto,
                data_pagamento: dataPgto
            });
            setValorPgto('');
        } catch (error: unknown) {
            const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
            setAlertaCustomizado({ visivel: true, titulo: 'Falha na Comunicação', mensagem: `Erro ao salvar pagamento:\n${mensagem}`, tipo: 'erro' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const processarEstornoServidor = async () => {
        if (!confirmacaoEstorno) return;
        try {
            await onExcluirPagamento(osSelecionada.os_id, confirmacaoEstorno.idPagamento);
        } catch (error: unknown) {
            const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
            setAlertaCustomizado({ visivel: true, titulo: 'Falha no Estorno', mensagem: `Erro ao tentar excluir:\n${mensagem}`, tipo: 'erro' });
        } finally {
            setConfirmacaoEstorno(null);
        }
    };

    return (
        <div style={{ paddingBottom: '24px' }}>
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
                        <p className="valor-destaque">{formatarBRL(valorTotal)}</p>
                    </div>
                </div>

                <div className="os-info-box">
                    <Calendar size={18} color="#64748b"/>
                    <div>
                        <label>Data de Emissão</label>
                        <p>{formatarData(osSelecionada.criado_em)}</p>
                    </div>
                </div>

                <div 
                    className="os-info-box" 
                    style={estaAtrasado ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : undefined}
                >
                    <Calendar size={18} color={estaAtrasado ? '#dc2626' : '#3b82f6'}/>
                    <div>
                        <label style={estaAtrasado ? { color: '#dc2626', fontWeight: 700 } : undefined}>
                            Prazo de Entrega {estaAtrasado && '⚠️ (Atrasado)'}
                        </label>
                        <p style={estaAtrasado ? { color: '#b91c1c', fontWeight: 700 } : undefined}>
                            {formatarData(osSelecionada.data_entrega)}
                        </p>
                    </div>
                </div>

                {estaFinalizado && (
                    <div className="os-info-box" style={{ borderColor: '#22c55e', backgroundColor: '#f0fdf4' }}>
                        <CheckCircle size={18} color="#16a34a"/>
                        <div>
                            <label style={{ color: '#16a34a', fontWeight: 700 }}>Data de Finalização</label>
                            <p style={{ color: '#15803d', fontWeight: 700 }}>
                                {formatarData(osSelecionada.data_finalizacao || osSelecionada.atualizado_em)}
                            </p>
                        </div>
                    </div>
                )}

                {estaEntregue && (
                    <div className="os-info-box" style={{ borderColor: '#64748b', backgroundColor: '#f8fafc' }}>
                        <Package size={18} color="#475569"/>
                        <div>
                            <label style={{ color: '#475569', fontWeight: 700 }}>Data de Entrega (Real)</label>
                            <p style={{ color: '#334155', fontWeight: 700 }}>
                                {formatarData(osSelecionada.data_entregue || osSelecionada.atualizado_em)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {(equipeListRead.length > 0 || osSelecionada.laudo_tecnico || osSelecionada.observacoes || osSelecionada.observacoes_cliente || Number(osSelecionada.custo_extra_materiais) > 0) && (
                <div className="os-secao-tecnica">
                    {equipeListRead.length > 0 && (
                        <div className="box-tecnica" style={{ borderLeftColor: '#3b82f6' }}>
                            <div className="box-header">
                                <Users size={16} color="#3b82f6" />
                                <strong>Equipe / Responsáveis pela Execução</strong>
                            </div>
                            <div className="equipe-list-read">
                                {equipeExibir.map((membro, idx) => (
                                    <div key={idx} className="equipe-item-read">
                                        <User size={15} color="#3b82f6" />
                                        <span>{membro}</span>
                                    </div>
                                ))}
                            </div>
                            {temMaisMembros && (
                                <button 
                                    type="button" 
                                    className="btn-expandir-conteudo no-print" 
                                    onClick={() => setEquipeExpandida(!equipeExpandida)}
                                >
                                    {equipeExpandida ? <><ChevronUp size={14} /> Ocultar membros</> : <><ChevronDown size={14} /> Ver mais {equipeListRead.length - limiteEquipe} membros</>}
                                </button>
                            )}
                        </div>
                    )}

                    {osSelecionada.laudo_tecnico && (
                        <div className="box-tecnica">
                            <div className="box-header">
                                <Wrench size={16} color="#f97316" />
                                <strong>Laudo Técnico / Diagnóstico</strong>
                            </div>
                            <TextoExpansivel 
                                texto={osSelecionada.laudo_tecnico} 
                                textoBotao="Ler laudo completo" 
                            />
                        </div>
                    )}

                    {osSelecionada.observacoes && (
                        <div className="box-tecnica">
                            <div className="box-header">
                                <FileText size={16} color="#64748b" />
                                <strong>Observações Operacionais</strong>
                            </div>
                            <TextoExpansivel 
                                texto={osSelecionada.observacoes} 
                                textoBotao="Ler observação completa" 
                            />
                        </div>
                    )}

                    {osSelecionada.observacoes_cliente && (
                        <div className="box-tecnica" style={{ borderLeftColor: '#8b5cf6' }}>
                            <div className="box-header">
                                <User size={16} color="#8b5cf6" />
                                <strong style={{ color: '#6d28d9' }}>Feedback / Observações do Cliente</strong>
                            </div>
                            <TextoExpansivel 
                                texto={osSelecionada.observacoes_cliente} 
                                textoBotao="Ler feedback completo" 
                            />
                        </div>
                    )}

                    {Number(osSelecionada.custo_extra_materiais) > 0 && (
                        <div className="box-tecnica extra-custo">
                            <div className="box-header">
                                <AlertTriangle size={16} color="#dc2626" />
                                <strong>Adicional de Materiais (Consumo Extra)</strong>
                            </div>
                            <TextoExpansivel 
                                prefixo={
                                    <strong>
                                        {formatarBRL(osSelecionada.custo_extra_materiais || 0)}
                                        {osSelecionada.descricao_materiais_extras ? ' — ' : ''}
                                    </strong>
                                }
                                texto={osSelecionada.descricao_materiais_extras} 
                                textoBotao="Ler descrição completa" 
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="os-financeiro-panel">
                <div className="financeiro-panel-header no-print">
                    <div>
                        <h3>Controle Financeiro</h3>
                        <p>Histórico de transações e saldo devedor.</p>
                    </div>
                </div>

                <div className="financeiro-dashboard no-print" style={{ padding: '20px', gap: '18px' }}>
                    <div className="financeiro-progresso">
                        <div className="progresso-labels">
                            <span className="label-pago">Pago: <strong>{formatarBRL(valorPago)}</strong></span>
                            <span className="label-falta">Falta: <strong>{formatarBRL(saldoDevedor > 0 ? saldoDevedor : 0)}</strong></span>
                        </div>
                        <div className="progresso-barra-bg">
                            <div 
                                className="progresso-barra-fill" 
                                style={{ 
                                    width: `${percentualPago}%`, 
                                    backgroundColor: percentualPago === 100 ? '#16a34a' : '#f97316' 
                                }}
                            ></div>
                        </div>
                    </div>

                    {saldoDevedor > 0 && (
                        <div className="form-baixa-financeira" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr auto', gap: '12px', alignItems: 'end', marginTop: '8px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Valor (R$)</label>
                                <input 
                                    type="number" 
                                    placeholder="Ex: 500.00" 
                                    value={valorPgto}
                                    onChange={(e) => setValorPgto(e.target.value)}
                                    style={{ 
                                        width: '100%', height: '38px', padding: '0 12px', 
                                        border: '1px solid #cbd5e1', borderRadius: '6px', 
                                        backgroundColor: '#ffffff', color: '#0f172a',
                                        boxSizing: 'border-box', outlineColor: '#f97316'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Forma</label>
                                <select 
                                    value={formaPgto}
                                    onChange={(e) => setFormaPgto(e.target.value)}
                                    style={{ 
                                        width: '100%', height: '38px', padding: '0 10px', 
                                        border: '1px solid #cbd5e1', borderRadius: '6px', 
                                        backgroundColor: '#ffffff', color: '#0f172a',
                                        boxSizing: 'border-box', outlineColor: '#f97316'
                                    }}
                                >
                                    <option value="PIX">PIX</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Cartão de Débito">Cartão de Débito</option>
                                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                                    <option value="Boleto">Boleto</option>
                                    <option value="Transferência">Transferência Bancária</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Data</label>
                                <input 
                                    type="date" 
                                    value={dataPgto}
                                    onChange={(e) => setDataPgto(e.target.value)}
                                    style={{ 
                                        width: '100%', height: '38px', padding: '0 10px', 
                                        border: '1px solid #cbd5e1', borderRadius: '6px', 
                                        backgroundColor: '#ffffff', color: '#0f172a',
                                        boxSizing: 'border-box', outlineColor: '#f97316'
                                    }}
                                />
                            </div>
                            <button 
                                onClick={handleAdicionarPagamento}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: '#f97316', color: '#ffffff', border: 'none', 
                                    padding: '0 18px', borderRadius: '6px', fontWeight: 700, 
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                    height: '38px', display: 'flex', alignItems: 'center', gap: '6px',
                                    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)', transition: '0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                            >
                                <Plus size={18} /> Baixar
                            </button>
                        </div>
                    )}

                    {pagamentosList.length > 0 && (
                        <div className="lista-pagamentos" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                            {pagamentosExibir.map(pgto => (
                                <div key={pgto.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '6px'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{formatarBRL(pgto.valor)}</span>
                                        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{pgto.forma_pagamento} • {formatarData(pgto.data_pagamento)}</span>
                                    </div>
                                    <button 
                                        onClick={() => setConfirmacaoEstorno({ visivel: true, idPagamento: pgto.id })}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', transition: '0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        title="Estornar/Excluir Pagamento"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            
                            {temMaisPagamentos && (
                                <button 
                                    type="button" 
                                    className="btn-expandir-conteudo no-print" 
                                    onClick={() => setPagamentosExpandidos(!pagamentosExpandidos)}
                                    style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                                >
                                    {pagamentosExpandidos ? (
                                        <><ChevronUp size={14} /> Mostrar menos</>
                                    ) : (
                                        <><ChevronDown size={14} /> Ver histórico completo ({pagamentosList.length})</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="os-acoes-finais no-print" style={{marginTop: '24px'}}>
                    <button className="btn-print-os" onClick={() => window.print()}>
                        <Printer size={18} /> Imprimir Ficha de Produção
                    </button>
                </div>
            </div>

            {alertaCustomizado && (
                <div style={estiloOverlayModal}>
                    <div style={estiloCardModal}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ 
                                backgroundColor: alertaCustomizado.tipo === 'erro' ? '#fee2e2' : '#fef3c7', 
                                padding: '8px', borderRadius: '50%', color: alertaCustomizado.tipo === 'erro' ? '#ef4444' : '#f59e0b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {alertaCustomizado.tipo === 'erro' ? <AlertTriangle size={20} /> : <Info size={20} />}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{alertaCustomizado.titulo}</h3>
                        </div>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                            {alertaCustomizado.mensagem}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setAlertaCustomizado(null)} style={estiloBotaoSecundario}>Entendi</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmacaoExcesso && (
                <div style={estiloOverlayModal}>
                    <div style={estiloCardModal}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ backgroundColor: '#fef3c7', padding: '8px', borderRadius: '50%', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Pagamento Superior ao Saldo</h3>
                        </div>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                            O valor digitado (<strong>{formatarBRL(confirmacaoExcesso.valor)}</strong>) é maior que o saldo devedor atual (<strong>{formatarBRL(saldoDevedor)}</strong>).
                            <br/><br/>Deseja confirmar este recebimento extra mesmo assim?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setConfirmacaoExcesso(null)} style={estiloBotaoSecundario}>Cancelar</button>
                            <button onClick={() => processarPagamentoServidor(confirmacaoExcesso.valor)} style={estiloBotaoPrimarioAviso}>Confirmar Baixa</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmacaoEstorno && (
                <div style={estiloOverlayModal}>
                    <div style={estiloCardModal}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ backgroundColor: '#fee2e2', padding: '8px', borderRadius: '50%', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Trash2 size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Estornar Pagamento?</h3>
                        </div>
                        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                            Tem certeza que deseja excluir este registro de pagamento? Essa ação atualizará o saldo devedor da O.S. e não poderá ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setConfirmacaoEstorno(null)} style={estiloBotaoSecundario}>Cancelar</button>
                            <button onClick={processarEstornoServidor} style={estiloBotaoPrimarioPerigo}>Sim, Estornar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Estilos in-line protegidos para os Modais Auxiliares
const estiloOverlayModal: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 999999, backdropFilter: 'blur(2px)'
};

const estiloCardModal: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    border: '1px solid #e2e8f0', fontFamily: 'inherit'
};

const estiloBotaoSecundario: React.CSSProperties = {
    backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1',
    padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
};

const estiloBotaoPrimarioAviso: React.CSSProperties = {
    backgroundColor: '#f97316', color: '#ffffff', border: 'none',
    padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
};

const estiloBotaoPrimarioPerigo: React.CSSProperties = {
    backgroundColor: '#ef4444', color: '#ffffff', border: 'none',
    padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
};