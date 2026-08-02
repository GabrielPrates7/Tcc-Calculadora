import { useState } from 'react';
import { X, Printer, FileText, CheckCircle, TrendingUp, DollarSign, Hammer, Package, Receipt, ArrowRightCircle, AlertCircle, Calendar } from 'lucide-react';
import type { Orcamento } from '../types';
import { useNavigate } from 'react-router-dom';
import { OrdemServicoService } from '../../ordemServico/services/ordemServico.service';
import { formatarBRL } from '../../../utils/formatters';
import './ModalDemonstrativo.css';

interface Props {
    orcamento: Orcamento;
    onClose: () => void;
}

export function ModalDemonstrativo({ orcamento, onClose }: Props) {
    const navigate = useNavigate();

    // Verificação de segurança para O.S. já existente
    const idOS = (orcamento as Record<string, unknown>).os_id as number | undefined;
    const jaTemOS = Boolean(idOS);

    // --- ESTADOS PARA OS MODAIS EM TEMA ESCURO ---
    const [modalPrazoAberto, setModalPrazoAberto] = useState(false);
    const [diasEntrega, setDiasEntrega] = useState<string>('');
    const [loadingOS, setLoadingOS] = useState(false);
    
    // Feedback técnico na UI
    const [mensagemAlerta, setMensagemAlerta] = useState<string | null>(null);
    const [tipoAlerta, setTipoAlerta] = useState<'erro' | 'sucesso'>('erro');

    // Formatações
    const PCT = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    const DATA = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

    // Cálculos Reversos Exatos
    const PV = Number(orcamento.preco_venda);
    const taxaFixo = Number(orcamento.taxa_fixa_snapshot || 0);
    const taxaLucro = Number(orcamento.lucro_desejado || 0);
    const taxaImposto = Number(orcamento.imposto || 0);

    const valorCustoFixo = PV * (taxaFixo / 100);
    const valorImposto = PV * (taxaImposto / 100);
    const valorLucro = PV * (taxaLucro / 100);
    const valorMateriais = Number(orcamento.custo_materiais || 0);
    const valorMaoObra = PV - valorCustoFixo - valorImposto - valorLucro - valorMateriais;

    const handlePrint = () => window.print();

    // 1. Abre o modal escuro para pedir o prazo em dias
    const abrirModalAprovacao = () => {
        if (!orcamento.id) {
            setTipoAlerta('erro');
            setMensagemAlerta('Erro: Salve o orçamento antes de gerar a Ordem de Serviço.');
            return;
        }

        // CORREÇÃO: Bloqueia a abertura do modal se o orçamento já estiver em produção
        if (jaTemOS) {
            setTipoAlerta('erro');
            setMensagemAlerta(`Ação Bloqueada: Este orçamento já foi transformado na Ordem de Serviço #${idOS}. Não é possível emitir duplicidade.`);
            return;
        }

        setModalPrazoAberto(true);
    };

    // 2. Executa a requisição após o usuário confirmar o modal
    const handleConfirmarOS = async () => {
        if (!orcamento.id) return;
        
        setLoadingOS(true);
        try {
            let dataEntrega = undefined;
            
            if (diasEntrega && !isNaN(Number(diasEntrega)) && Number(diasEntrega) > 0) {
                const data = new Date();
                data.setDate(data.getDate() + Number(diasEntrega));
                dataEntrega = data.toISOString();
            }

            await OrdemServicoService.criarDeOrcamento(orcamento.id, dataEntrega);
            
            setModalPrazoAberto(false);
            setTipoAlerta('sucesso');
            setMensagemAlerta('Ordem de Serviço gerada com sucesso! Redirecionando para o painel Kanban...');

            setTimeout(() => {
                onClose();
                navigate('/ordens-servico');
            }, 1200);
            
        } catch (error: unknown) {
            const err = error as Error;
            setTipoAlerta('erro');
            setMensagemAlerta(err.message || 'Erro ao gerar O.S. Verifique se ela já existe ou se a rota está acessível.');
            setModalPrazoAberto(false);
        } finally {
            setLoadingOS(false);
        }
    };

    return (
        <>
            <div className="modal-overlay-print">
                <div className="modal-demonstrativo">
                    <button className="btn-fechar-modal no-print" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="doc-header">
                        <div className="doc-logo-area">
                            <TrendingUp size={36} color="#2563eb" />
                            <div>
                                <h2>Sistema Denarius</h2>
                                <span>Inteligência em Precificação</span>
                            </div>
                        </div>
                        <div className="doc-info">
                            <h3>Demonstrativo de Custos</h3>
                            <p><strong>Emissão:</strong> {DATA(orcamento.criado_em)}</p>
                            <p><strong>Ref:</strong> #{orcamento.id || 'Novo'}</p>
                        </div>
                    </div>

                    <div className="doc-client-info">
                        <div className="info-box">
                            <span className="info-label">Cliente / Solicitante</span>
                            <span className="info-value">{orcamento.cliente || 'Consumidor Final'}</span>
                        </div>
                        <div className="info-box">
                            <span className="info-label">Produto / Serviço</span>
                            <span className="info-value">{orcamento.nome_produto}</span>
                        </div>
                    </div>

                    <div className="lista-financeira">
                        <div className="linha-lista header-lista">
                            <div className="coluna-desc">Descrição do Item</div>
                            <div className="coluna-valores">
                                <span className="col-peso">Peso (%)</span>
                                <span className="col-rs">Valor Final (R$)</span>
                            </div>
                        </div>

                        <div className="linha-lista destaque-topo">
                            <div className="coluna-desc">
                                <strong className="flex items-center gap-2"><FileText size={18}/> Preço de Venda Sugerido</strong>
                            </div>
                            <div className="coluna-valores">
                                <span className="col-peso font-bold">100,00%</span>
                                <span className="col-rs font-bold destaque-azul">{formatarBRL(PV)}</span>
                            </div>
                        </div>

                        <div className="linha-lista">
                            <div className="coluna-desc">
                                <span className="titulo-item"><Receipt size={16}/> Custo Fixo Operacional</span>
                                <span className="badge-base">Base informada: {PCT(taxaFixo)}</span>
                            </div>
                            <div className="coluna-valores">
                                <span className="col-peso">{PCT((valorCustoFixo / PV) * 100)}</span>
                                <span className="col-rs">{formatarBRL(valorCustoFixo)}</span>
                            </div>
                        </div>

                        <div className="linha-lista">
                            <div className="coluna-desc">
                                <span className="titulo-item"><DollarSign size={16}/> Impostos Gerais (NFe/Simples)</span>
                                <span className="badge-base">Base informada: {PCT(taxaImposto)}</span>
                            </div>
                            <div className="coluna-valores">
                                <span className="col-peso">{PCT((valorImposto / PV) * 100)}</span>
                                <span className="col-rs">{formatarBRL(valorImposto)}</span>
                            </div>
                        </div>

                        <div className="linha-lista">
                            <div className="coluna-desc">
                                <span className="titulo-item"><Package size={16}/> Materiais / Insumos</span>
                                <span className="badge-base text-gray">Custo Direto</span>
                            </div>
                            <div className="coluna-valores">
                                <span className="col-peso">{PCT((valorMateriais / PV) * 100)}</span>
                                <span className="col-rs">{formatarBRL(valorMateriais)}</span>
                            </div>
                        </div>

                        <div className="linha-lista">
                            <div className="coluna-desc">
                                <span className="titulo-item"><Hammer size={16}/> Mão de Obra Aplicada</span>
                                <span className="badge-base text-gray">Tempo x Valor Hora/Dia</span>
                            </div>
                            <div className="coluna-valores">
                                <span className="col-peso">{PCT(valorMaoObra > 0 ? (valorMaoObra / PV) * 100 : 0)}</span>
                                <span className="col-rs">{formatarBRL(valorMaoObra > 0 ? valorMaoObra : 0)}</span>
                            </div>
                        </div>

                        <div className="linha-lista destaque-lucro">
                            <div className="coluna-desc">
                                <strong className="flex items-center gap-2 text-success"><CheckCircle size={20}/> Lucro Líquido Real</strong>
                                <span className="badge-base badge-success">Margem Garantida: {PCT(taxaLucro)}</span>
                            </div>
                            <div className="coluna-valores">
                                <span className="col-peso font-bold text-success">{PCT((valorLucro / PV) * 100)}</span>
                                <span className="col-rs font-bold text-success text-lg">{formatarBRL(valorLucro)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="doc-footer">
                        <p>Documento gerado automaticamente com base na metodologia de Markup Divisor.</p>
                    </div>

                    {/* CORREÇÃO: Botão alterado visualmente caso a O.S. já tenha sido gerada */}
                    <div className="modal-actions no-print">
                        <button 
                            className="btn-aprovar-os" 
                            onClick={abrirModalAprovacao}
                            disabled={jaTemOS}
                            style={jaTemOS ? { backgroundColor: '#475569', cursor: 'not-allowed', opacity: 0.85 } : undefined}
                        >
                            <ArrowRightCircle size={20} /> 
                            {jaTemOS ? `O.S. #${idOS} em Produção` : 'Aprovar & Gerar O.S.'}
                        </button>
                        
                        <button className="btn-imprimir-doc" onClick={handlePrint}>
                            <Printer size={20} /> Imprimir Relatório Oficial
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL FLUTUANTE ESCURO PARA DEFINIR O PRAZO --- */}
            {modalPrazoAberto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: '#1e293b',
                        border: '2px solid #f97316',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '420px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <Calendar size={22} color="#f97316" />
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem' }}>Prazo de Entrega (Opcional)</h3>
                        </div>

                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Quantos dias úteis ou corridos são necessários para entregar esta obra?
                        </p>

                        <input 
                            type="number"
                            placeholder="Ex: 15 (Deixe em branco se indefinido)"
                            value={diasEntrega}
                            onChange={e => setDiasEntrega(e.target.value)}
                            style={{
                                width: '100%',
                                height: '44px',
                                boxSizing: 'border-box',
                                padding: '0 14px',
                                background: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f8fafc',
                                fontSize: '0.95rem',
                                marginBottom: '20px',
                                outline: 'none'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setModalPrazoAberto(false)}
                                style={{
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    color: '#94a3b8',
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmarOS}
                                disabled={loadingOS}
                                style={{
                                    background: '#f97316',
                                    border: 'none',
                                    color: '#ffffff',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 700
                                }}
                            >
                                {loadingOS ? 'Gerando...' : 'Confirmar O.S.'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ESCURO PARA AVISO DE ERRO OU SUCESSO --- */}
            {mensagemAlerta && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10001
                }}>
                    <div style={{
                        background: '#1e293b',
                        border: `2px solid ${tipoAlerta === 'erro' ? '#ef4444' : '#22c55e'}`,
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            {tipoAlerta === 'erro' ? (
                                <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto' }} />
                            ) : (
                                <CheckCircle size={36} color="#22c55e" style={{ margin: '0 auto' }} />
                            )}
                        </div>
                        
                        <p style={{ color: '#f8fafc', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.4' }}>
                            {mensagemAlerta}
                        </p>

                        <button
                            type="button"
                            onClick={() => setMensagemAlerta(null)}
                            style={{
                                background: tipoAlerta === 'erro' ? '#ef4444' : '#22c55e',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700
                            }}
                        >
                            OK, Entendi
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}