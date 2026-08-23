import { FileText, Calendar, Trash2, Edit2, Upload } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioPDF } from './RelatorioPDF';
import { formatarBRL } from '../../../utils/formatters'; // <--- Importamos o formatador
import type { HistoricoItem } from '../types';
import './HistoricoCenarios.css';

const HORAS_PADRAO_DIA = 8;

interface Props {
    itens: HistoricoItem[];
    custoMensalAtual: number;
    onExcluir: (id: number) => void;
    onRenomear: (id: number, novoTitulo: string) => void;
    onRestaurar: (item: HistoricoItem) => void;
}

export function HistoricoCenarios({ itens, custoMensalAtual, onExcluir, onRenomear, onRestaurar }: Props) {
    if (itens.length === 0) return null;

    const handleEditClick = (id: number, tituloAtual: string) => {
        const novo = prompt("Novo nome para o cenário:", tituloAtual);
        if (novo && novo !== tituloAtual) {
            onRenomear(id, novo);
        }
    };

    return (
        <div className="historico-container">
            <h3>📜 Histórico de Cenários Salvos</h3>
            <div className="lista-historico">
                {itens.map((item) => {
                    const isDia = item.configuracao_usada.tipo === 'dias';
                    const qtdProfissionais = item.configuracao_usada.organizacao === 'grupo'
                        ? item.configuracao_usada.equipes * (item.configuracao_usada.tamanhoGrupo || 1)
                        : item.configuracao_usada.equipes;
                    const horasEstimadas = isDia
                        ? item.configuracao_usada.tempo * HORAS_PADRAO_DIA * qtdProfissionais
                        : item.configuracao_usada.tempo * qtdProfissionais;
                    const custoTotalMaoDeObra = item.custo_total_folha ? Number(item.custo_total_folha) : custoMensalAtual;
                    const custoHoraAplicado = horasEstimadas > 0 ? custoTotalMaoDeObra / horasEstimadas : 0;

                    return (
                    <div key={item.id} className="item-historico">
                        <div className="item-info">
                            <div style={{display:'flex', alignItems:'center', gap: 8}}>
                                <h4>{item.titulo || 'Sem título'}</h4>
                                <button className="btn-icon-text" onClick={() => handleEditClick(item.id, item.titulo)}>
                                    <Edit2 size={14}/>
                                </button>
                            </div>
                            
                            <span className="data">
                                <Calendar size={12} /> {new Date(item.data_alteracao).toLocaleDateString()}
                            </span>
                            <div className="detalhes-tecnicos">
                                {item.configuracao_usada.equipes}x Equipes • {item.configuracao_usada.tempo} {item.configuracao_usada.tipo}
                            </div>
                        </div>

                        {/* AQUI: Usando o formatarBRL */}
                        <div className="item-valor">
                            <strong className="valor">{formatarBRL(item.valor_unitario_final)}</strong>
                        </div>

                        <div className="item-acao-group">
                            {/* Botão Restaurar */}
                            <button 
                                className="btn-mini-action restore" 
                                title="Carregar este cálculo para editar"
                                onClick={() => onRestaurar(item)}
                            >
                                <Upload size={16} />
                            </button>

                            {/* Botão PDF */}
                            <PDFDownloadLink
                                document={
                                    <RelatorioPDF dados={{
                                        titulo: item.titulo,
                                        cliente: 'Cálculo de Cenário',
                                        dataCriacao: new Date(item.data_alteracao).toLocaleDateString(),
                                        recursos: [{
                                            funcao_id: 0,
                                            funcao_nome: item.configuracao_usada.organizacao === 'grupo'
                                                ? `Equipe (${item.configuracao_usada.tamanhoGrupo || 1} pessoas)`
                                                : 'Mão de obra',
                                            qtd_profissionais: qtdProfissionais,
                                            horas_estimadas: horasEstimadas,
                                            custo_hora_aplicado: custoHoraAplicado,
                                            unidade_tempo: item.configuracao_usada.tipo
                                        }],
                                        custoTotalMaoDeObra
                                    }} />
                                }
                                fileName={`Cenario_${item.titulo ? item.titulo.replace(/\s/g, '_') : 'Relatorio'}.pdf`}
                            >
                                {({ loading }) => (
                                    <button className="btn-mini-action pdf" disabled={loading} title="Baixar PDF">
                                        <FileText size={16} />
                                    </button>
                                )}
                            </PDFDownloadLink>

                            {/* Botão Excluir */}
                            <button 
                                className="btn-mini-action delete" 
                                title="Excluir do histórico"
                                onClick={() => onExcluir(item.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}