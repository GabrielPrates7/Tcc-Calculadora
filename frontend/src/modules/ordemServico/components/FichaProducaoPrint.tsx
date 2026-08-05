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
    return (
        <div className="print-layout">
            <div className="print-header-banner">
                <div className="print-brand">
                    <strong>DENARIUS</strong>
                    <span>Gestão Industrial & Controle de Oficina</span>
                </div>
                <div className="print-title-box">
                    <h1>FICHA DE PRODUÇÃO</h1>
                    <h2>ORDEM DE SERVIÇO #{osSelecionada.os_id}</h2>
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
                <div className="print-box">
                    <span className="print-box-label">Data de Emissão (Criação)</span>
                    <strong>{formatarData(osSelecionada.criado_em)}</strong>
                </div>
                <div className="print-box">
                    <span className="print-box-label">Prazo de Entrega Acordado</span>
                    <strong>{formatarData(osSelecionada.data_entrega)}</strong>
                </div>
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