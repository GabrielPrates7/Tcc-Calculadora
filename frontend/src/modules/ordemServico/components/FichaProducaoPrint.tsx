import type { OrdemServico } from '../types';

interface Props {
    osSelecionada: OrdemServico;
    equipeListRead: string[];
    formatarData: (data?: string) => string;
    formatarBRL: (valor: number | string) => string;
}

export function FichaProducaoPrint({
    osSelecionada,
    equipeListRead,
    formatarData,
    formatarBRL
}: Props) {
    const estaFinalizado = osSelecionada.status_producao === 'pronto' || osSelecionada.status_producao === 'entregue';

    return (
        <div className="print-layout">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '12px', marginBottom: '20px' }}>
                
                {/* BLOCO DA LOGO CENTRALIZADO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <img 
                        src="/logo-denarius-branca.png" 
                        alt="Denarius" 
                        style={{ height: '55px', objectFit: 'contain' }} 
                    />
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
                        INTELIGÊNCIA EM PRECIFICAÇÃO
                    </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Ficha de Produção
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                        ORDEM DE SERVIÇO #{osSelecionada.os_id}
                    </p>
                </div>
            </div>

            <div className="print-info-grid">
                <div className="print-box">
                    <span className="print-box-label">Cliente</span>
                    <strong>{osSelecionada.cliente || 'Consumidor Final'}</strong>
                </div>

                <div className="print-box">
                    <span className="print-box-label">Produto / Serviço Usinado</span>
                    <strong>{osSelecionada.nome_produto}</strong>
                </div>

                {estaFinalizado && (
                    <div className="print-box" style={{ gridColumn: 'span 2', borderColor: '#16a34a', backgroundColor: '#f0fdf4' }}>
                        <span className="print-box-label" style={{ color: '#16a34a' }}>Data de Finalização</span>
                        <strong style={{ color: '#15803d' }}>
                            ✓ Produção Concluída em: {formatarData(osSelecionada.data_finalizacao || osSelecionada.atualizado_em)}
                        </strong>
                    </div>
                )}

                <div className="print-box" style={{ gridColumn: 'span 2' }}>
                    <span className="print-box-label">Equipe Executora Alocada</span>
                    {equipeListRead.length > 0 ? (
                        <div className="print-equipe-stack">
                            {equipeListRead.map((membro, index) => (
                                <div key={index} className="print-equipe-row">• {membro}</div>
                            ))}
                        </div>
                    ) : 'Não informado'}
                </div>
            </div>

            {osSelecionada.laudo_tecnico && (
                <div className="print-section">
                    <div className="print-section-header">Laudo Técnico & Diagnóstico da Oficina</div>
                    <div className="print-section-body">{osSelecionada.laudo_tecnico}</div>
                </div>
            )}

            {osSelecionada.observacoes && (
                <div className="print-section">
                    <div className="print-section-header">Observações Operacionais & Montagem</div>
                    <div className="print-section-body">{osSelecionada.observacoes}</div>
                </div>
            )}

            {Number(osSelecionada.custo_extra_materiais) > 0 && (
                <div className="print-section">
                    <div className="print-section-header">Consumo Extra de Materiais (Pós-Orçamento)</div>
                    <div className="print-section-body">
                        <strong>Custo Adicional Registrado:</strong> {formatarBRL(osSelecionada.custo_extra_materiais || 0)}<br/>
                        <strong>Descrição:</strong> {osSelecionada.descricao_materiais_extras || 'Não especificado'}
                    </div>
                </div>
            )}

            <div className="print-signatures">
                <div className="sig-line-single">
                    <hr />
                    <span>Responsável pela Produção</span>
                </div>
            </div>
        </div>
    );
}