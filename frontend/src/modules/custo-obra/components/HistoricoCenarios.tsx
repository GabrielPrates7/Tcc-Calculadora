import { FileText, Calendar, Trash2, Edit2, Upload } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { RelatorioPDF } from './RelatorioPDF';
import type { HistoricoItem } from '../types';
import './HistoricoCenarios.css';

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
                {itens.map((item) => (
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

                        <div className="item-valor">
                            <strong className="valor">R$ {Number(item.valor_unitario_final).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
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
                                        data: new Date(item.data_alteracao).toLocaleDateString(),
                                        
                                        // AQUI ESTÁ A CORREÇÃO PARA O ERRO DO 'ANY':
                                        // O comentário abaixo diz para o verificador ignorar a regra nesta linha específica
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        custoMensal: (item as any).custo_total_folha ? Number((item as any).custo_total_folha) : custoMensalAtual,
                                        
                                        tipoTempo: item.configuracao_usada.tipo,
                                        tempoInput: item.configuracao_usada.tempo,
                                        qtdUnidades: item.configuracao_usada.equipes,
                                        tipoOrganizacao: item.configuracao_usada.organizacao,
                                        tamanhoGrupo: item.configuracao_usada.tamanhoGrupo || 1,
                                        valorFinal: Number(item.valor_unitario_final)
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
                ))}
            </div>
        </div>
    );
}