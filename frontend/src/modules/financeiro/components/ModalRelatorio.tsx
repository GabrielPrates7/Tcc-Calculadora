// ARQUIVO: src/modules/financeiro/components/ModalRelatorio.tsx

import { useState } from 'react';
import { X, FileText, Calendar, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ItemFinanceiro } from '../types';
import { analisarIntervalo } from '../utils/dateHelper';
import { formatarBRL } from '../../../utils/formatters';
import './ModalFinanceiro.css';

interface Props {
    despesas: ItemFinanceiro[];
    investimentos: ItemFinanceiro[];
    onClose: () => void;
    somarFaturamento: (meses: number[], ano: number) => Promise<number>;
}

export function ModalRelatorio({ despesas, investimentos, onClose, somarFaturamento }: Props) {
    const hoje = new Date();
    const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const fimPadrao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dataInicio, setDataInicio] = useState(inicioPadrao);
    const [dataFim, setDataFim] = useState(fimPadrao);
    const [gerando, setGerando] = useState(false);

    const formatarDataSemFuso = (dataString: string) => {
        if (!dataString) return '-';
        const limpa = dataString.substring(0, 10);
        const [ano, mes, dia] = limpa.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleGerarPDF = async () => {
        setGerando(true);
        try {
            const infoDatas = analisarIntervalo(dataInicio, dataFim);
            let faturamentoPeriodo = 0;

            if (infoDatas.ano && infoDatas.meses.length > 0) {
                const mesesBanco = infoDatas.meses.map(m => m + 1);
                faturamentoPeriodo = await somarFaturamento(mesesBanco, infoDatas.ano);
            }

            const filtrarPorData = (lista: ItemFinanceiro[]) => {
                return lista.filter(item => {
                    if (!item.ativo) return false;
                    const d = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
                    return d >= dataInicio && d <= dataFim;
                });
            };

            const despesasFiltradas = filtrarPorData(despesas);
            const investimentosFiltrados = filtrarPorData(investimentos);

            const totalDespesas = despesasFiltradas.reduce((acc, i) => acc + Number(i.valor), 0);
            const totalInvestimentos = investimentosFiltrados.reduce((acc, i) => acc + Number(i.valor), 0);
            
            const taxaCustoFixo = faturamentoPeriodo > 0 
                ? (totalDespesas / faturamentoPeriodo) * 100 
                : 0;

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            
            const AZUL_ESCURO = [30, 41, 59]; 
            const AZUL_CLARO = [59, 130, 246]; 
            const VERMELHO = [239, 68, 68];
            const ROXO = [139, 92, 246];
            const CINZA_FUNDO = [241, 245, 249];

            // CABEÇALHO
            doc.setFillColor(AZUL_ESCURO[0], AZUL_ESCURO[1], AZUL_ESCURO[2]);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Relatório Financeiro", 14, 20);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Período de Análise: ${formatarDataSemFuso(dataInicio)} até ${formatarDataSemFuso(dataFim)}`, 14, 30);
            
            doc.setFontSize(14);
            doc.text("Denarius", pageWidth - 35, 25);

            // CARDS
            const startY = 50;
            const cardWidth = 45;
            const cardHeight = 25;
            const gap = 10;
            const margin = 14;

            const drawCard = (x: number, title: string, value: string, colorRGB: number[]) => {
                doc.setFillColor(CINZA_FUNDO[0], CINZA_FUNDO[1], CINZA_FUNDO[2]);
                doc.setDrawColor(200);
                doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD');
                doc.setFillColor(colorRGB[0], colorRGB[1], colorRGB[2]);
                doc.rect(x, startY, 2, cardHeight, 'F');
                doc.setTextColor(100);
                doc.setFontSize(8);
                doc.text(title.toUpperCase(), x + 5, startY + 8);
                doc.setTextColor(30);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text(value, x + 5, startY + 18);
            };

            drawCard(margin, "Faturamento", formatarBRL(faturamentoPeriodo), AZUL_CLARO);
            drawCard(margin + cardWidth + gap, "Despesas", formatarBRL(totalDespesas), VERMELHO);
            drawCard(margin + (cardWidth + gap) * 2, "Investimentos", formatarBRL(totalInvestimentos), ROXO);
            drawCard(margin + (cardWidth + gap) * 3, "Taxa Custo Fixo", `${taxaCustoFixo.toFixed(2)}%`, taxaCustoFixo > 30 ? VERMELHO : [34, 197, 94]);

            // TABELAS
            doc.setFontSize(14);
            doc.setTextColor(30);
            doc.text("Detalhamento de Despesas", 14, 90);

            autoTable(doc, {
                startY: 95,
                head: [['Vencimento', 'Descrição', 'Beneficiário', 'Status', 'Valor']],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body: despesasFiltradas.map((d: any) => [
                    formatarDataSemFuso(d.dataVencimento),
                    d.nome,
                    d.beneficiario || '-',
                    d.pago ? 'Pago' : 'Pendente',
                    formatarBRL(d.valor)
                ]),
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [254, 242, 242] }
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.setTextColor(30);
            doc.text("Detalhamento de Investimentos", 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Vencimento', 'Descrição', 'Valor']],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body: investimentosFiltrados.map((i: any) => [
                    formatarDataSemFuso(i.dataVencimento),
                    i.nome,
                    formatarBRL(i.valor)
                ]),
                theme: 'striped',
                headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [243, 232, 255] }
            });

            // RODAPÉ
            const pageCount = doc.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.setDrawColor(200);
                doc.line(14, doc.internal.pageSize.height - 15, pageWidth - 14, doc.internal.pageSize.height - 15);
                doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, doc.internal.pageSize.height - 8);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 8);
            }

            doc.save(`Relatorio_Financeiro_${dataInicio}_a_${dataFim}.pdf`);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF.");
        } finally {
            setGerando(false);
        }
    };

    return (
        /* CORREÇÃO: Sem onClick={onClose} no backdrop */
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={24} color="#475569" /> Relatório PDF
                    </h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body">
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>
                        Selecione o período para gerar o relatório detalhado em PDF.
                    </p>

                    <div className="form-group">
                        <label><Calendar size={14}/> Data Início</label>
                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label><Calendar size={14}/> Data Fim</label>
                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                    </div>

                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            className="btn-premium"
                            onClick={handleGerarPDF}
                            disabled={gerando}
                            style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                width: '100%',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: gerando ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                            }}
                        >
                            <Download size={20} /> 
                            {gerando ? 'Gerando Arquivo...' : 'BAIXAR RELATÓRIO PREMIUM'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}