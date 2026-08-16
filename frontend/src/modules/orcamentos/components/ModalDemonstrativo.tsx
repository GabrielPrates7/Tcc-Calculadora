import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, CheckCircle, DollarSign, Hammer, Package, Receipt, ArrowRightCircle, AlertCircle, Calendar } from 'lucide-react';
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

    const idOS = (orcamento as unknown as { os_id?: number }).os_id;
    const jaTemOS = Boolean(idOS);

    const [modalPrazoAberto, setModalPrazoAberto] = useState(false);
    const [diasEntrega, setDiasEntrega] = useState<string>('');
    const [loadingOS, setLoadingOS] = useState(false);
    
    const [mensagemAlerta, setMensagemAlerta] = useState<string | null>(null);
    const [tipoAlerta, setTipoAlerta] = useState<'erro' | 'sucesso'>('erro');

    const PCT = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    const DATA = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

    const PV = Number(orcamento.preco_venda);
    const taxaFixo = Number(orcamento.taxa_fixa_snapshot || 0);
    const taxaLucro = Number(orcamento.lucro_desejado || 0);
    const taxaImposto = Number(orcamento.imposto || 0);

    const valorCustoFixo = PV * (taxaFixo / 100);
    const valorImposto = PV * (taxaImposto / 100);
    const valorLucro = PV * (taxaLucro / 100);
    const valorMateriais = Number(orcamento.custo_materiais || 0);
    const valorMaoObra = PV - valorCustoFixo - valorImposto - valorLucro - valorMateriais;

    // ============================================================================
    // IMPRESSÃO ISOLADA VIA IFRAME INVISÍVEL (COM TROCA INTELIGENTE DE LOGO)
    // ============================================================================
    const handlePrint = () => {
        const conteudo = document.getElementById('documento-para-imprimir');
        if (!conteudo) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm'; 
        iframe.style.height = '297mm';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframeWindow?.document;
        
        if (!iframeDocument || !iframeWindow) return;

        // A MÁGICA: Pega o HTML original (que tem a logo azul) e troca pela branca dinamicamente
        const conteudoDoDocumento = conteudo.innerHTML.replace(
            'logo-denarius-azul.png', 
            'logo-denarius-branca.png'
        );

        const htmlParaImpressao = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Orçamento #${orcamento.id || 'Novo'} - Denarius</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Inter', sans-serif;
                        background: #ffffff;
                        color: #0f172a;
                        padding: 0;
                        margin: 0;
                        font-size: 12pt;
                    }

                    .no-print, .btn-fechar-modal, .modal-actions {
                        display: none !important;
                    }

                    .doc-header {
                        display: flex; justify-content: space-between; align-items: center;
                        background-color: #ffffff !important; 
                        padding: 10px 0 !important;
                        border-bottom: 2px solid #e2e8f0;
                        margin-bottom: 20px !important;
                    }
                    .doc-logo-area { display: flex; align-items: center; gap: 15px; }
                    
                    /* O tamanho perfeito para a logo na folha A4 */
                    .doc-logo-img { width: 110px !important; max-width: 110px !important; height: auto !important; }
                    
                    .doc-logo-area h2 { margin: 0; color: #0f172a !important; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px;}
                    .doc-logo-area span { color: #64748b !important; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; }
                    .doc-info { text-align: right; }
                    .doc-info h3 { margin: 0 0 5px 0; color: #0f172a !important; font-size: 1.2rem; }
                    .doc-info p { margin: 2px 0; color: #475569 !important; font-size: 1rem; }

                    .doc-client-info {
                        display: flex; gap: 40px; background-color: #f8fafc !important;
                        padding: 20px 25px !important; border-radius: 8px !important; 
                        border-left: 6px solid #3b82f6 !important; margin-bottom: 25px !important;
                    }
                    .info-box { display: flex; flex-direction: column; }
                    .info-label { font-size: 0.85rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
                    .info-value { font-size: 1.3rem; color: #0f172a; font-weight: 700; }

                    .lista-financeira { display: flex; flex-direction: column; margin-bottom: 20px; }
                    
                    .linha-lista { 
                        display: flex; justify-content: space-between; align-items: center; 
                        padding: 14px 20px; border-bottom: 1px solid #e2e8f0; 
                    }
                    
                    .header-lista {
                        background-color: #f1f5f9 !important; border-bottom: 2px solid #cbd5e1 !important;
                        border-radius: 8px 8px 0 0 !important; color: #475569 !important; font-size: 0.95rem;
                        text-transform: uppercase; font-weight: 700; padding: 14px 20px !important;
                    }
                    
                    .coluna-desc { display: flex; flex-direction: column; gap: 6px; flex: 1; }
                    .coluna-valores { display: flex; gap: 30px; justify-content: flex-end; align-items: center; min-width: 250px; }
                    
                    .col-peso { width: 90px; text-align: right; color: #64748b; font-size: 1.05rem; }
                    .col-rs { width: 160px; text-align: right; color: #1e293b; font-size: 1.2rem; font-weight: 700; }

                    .titulo-item { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #334155; font-size: 1.05rem; }
                    .titulo-item svg { width: 20px; height: 20px; }
                    
                    .badge-base { align-self: flex-start; background-color: #e2e8f0 !important; color: #475569 !important; font-size: 0.8rem; padding: 4px 10px; border-radius: 4px; font-weight: 700; }
                    
                    .destaque-azul { color: #2563eb !important; font-size: 1.3rem; }
                    .font-bold { font-weight: 800; }
                    
                    .destaque-topo { background-color: #f8fafc !important; border-bottom: 2px solid #cbd5e1 !important; }
                    .destaque-topo .coluna-desc strong { color: #0f172a; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; }
                    
                    .destaque-lucro { 
                        background-color: #f0fdf4 !important; border-bottom: none !important; 
                        border-top: 2px solid #bbf7d0 !important; border-radius: 0 0 8px 8px !important; 
                        padding: 20px 20px; 
                    }
                    .destaque-lucro strong, .destaque-lucro .col-peso, .destaque-lucro .col-rs { color: #15803d !important; font-size: 1.3rem; }
                    .destaque-lucro .badge-base { background-color: #dcfce7 !important; color: #15803d !important;}

                    .doc-footer { 
                        text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 15px; 
                        color: #64748b; font-size: 0.95rem; margin-top: 20px; 
                    }

                    @page { size: A4 portrait; margin: 15mm; }
                </style>
            </head>
            <body>
                ${conteudoDoDocumento}
            </body>
            </html>
        `;

        iframeDocument.open();
        iframeDocument.write(htmlParaImpressao);
        iframeDocument.close();

        iframe.onload = () => {
            iframeWindow.focus();
            iframeWindow.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        };
    };

    const abrirModalAprovacao = () => {
        if (!orcamento.id) {
            setTipoAlerta('erro');
            setMensagemAlerta('Erro: Salve o orçamento antes de gerar a Ordem de Serviço.');
            return;
        }

        if (jaTemOS) {
            setTipoAlerta('erro');
            setMensagemAlerta(`Ação Bloqueada: Este orçamento já foi transformado na Ordem de Serviço #${idOS}. Não é possível emitir duplicidade.`);
            return;
        }

        setModalPrazoAberto(true);
    };

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

    return createPortal(
        <>
            <div className="modal-overlay-print">
                <div className="modal-demonstrativo" id="documento-para-imprimir">
                    <button className="btn-fechar-modal no-print" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="doc-header">
                        <div className="doc-logo-area">
                            {/* EXISTE APENAS 1 LOGO NO DOM AGORA. Nunca vão aparecer duas. */}
                            <img src="/logo-denarius-azul.png" alt="Logo" className="doc-logo-img" />
                            
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

            {/* MODAIS MANTIDOS */}
            {modalPrazoAberto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10000, backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: '#1e293b', border: '2px solid #f97316', borderRadius: '12px',
                        padding: '24px', width: '90%', maxWidth: '420px',
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
                            type="number" placeholder="Ex: 15"
                            value={diasEntrega} onChange={e => setDiasEntrega(e.target.value)}
                            style={{
                                width: '100%', height: '44px', boxSizing: 'border-box', padding: '0 14px',
                                background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
                                color: '#f8fafc', fontSize: '0.95rem', marginBottom: '20px', outline: 'none'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button" onClick={() => setModalPrazoAberto(false)}
                                style={{
                                    background: '#0f172a', border: '1px solid #334155', color: '#94a3b8',
                                    padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button" onClick={handleConfirmarOS} disabled={loadingOS}
                                style={{
                                    background: '#f97316', border: 'none', color: '#ffffff',
                                    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700
                                }}
                            >
                                {loadingOS ? 'Gerando...' : 'Confirmar O.S.'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', textAlign: 'center'
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
                            type="button" onClick={() => setMensagemAlerta(null)}
                            style={{
                                background: tipoAlerta === 'erro' ? '#ef4444' : '#22c55e', color: '#ffffff',
                                border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700
                            }}
                        >
                            OK, Entendi
                        </button>
                    </div>
                </div>
            )}
        </>,
        document.body
    );
}