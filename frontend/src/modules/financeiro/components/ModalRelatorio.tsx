// ARQUIVO: src/modules/financeiro/components/ModalRelatorio.tsx

import { useState } from 'react';
import { X, FileText, Calendar, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ItemFinanceiro } from '../types';
import { analisarIntervalo } from '../utils/dateHelper';
import './ModalFinanceiro.css'; // Reutilizamos o CSS do modal existente

interface Props {
    despesas: ItemFinanceiro[];
    investimentos: ItemFinanceiro[];
    onClose: () => void;
    // Função para buscar o faturamento exato do período escolhido no relatório
    somarFaturamento: (meses: number[], ano: number) => Promise<number>;
}

export function ModalRelatorio({ despesas, investimentos, onClose, somarFaturamento }: Props) {
    
    // Inicia com o mês atual por padrão
    const hoje = new Date();
    const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const fimPadrao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dataInicio, setDataInicio] = useState(inicioPadrao);
    const [dataFim, setDataFim] = useState(fimPadrao);
    const [gerando, setGerando] = useState(false);

    // --- LÓGICA DE GERAÇÃO DO PDF ---
    const handleGerarPDF = async () => {
        setGerando(true);
        try {
            // 1. Analisa as datas escolhidas para buscar o faturamento correto
            const infoDatas = analisarIntervalo(dataInicio, dataFim);
            let faturamentoPeriodo = 0;

            if (infoDatas.ano && infoDatas.meses.length > 0) {
                // Busca no banco a soma do faturamento para os meses selecionados
                const mesesBanco = infoDatas.meses.map(m => m + 1);
                faturamentoPeriodo = await somarFaturamento(mesesBanco, infoDatas.ano);
            }

            // 2. Filtra os itens baseados na data escolhida
            const filtrarPorData = (lista: ItemFinanceiro[]) => {
                return lista.filter(item => {
                    if (!item.ativo) return false; // Relatório só considera ativos
                    const d = item.dataVencimento ? item.dataVencimento.substring(0, 10) : '';
                    return d >= dataInicio && d <= dataFim;
                });
            };

            const despesasFiltradas = filtrarPorData(despesas);
            const investimentosFiltrados = filtrarPorData(investimentos);

            // 3. Cálculos Totais
            const totalDespesas = despesasFiltradas.reduce((acc, i) => acc + Number(i.valor), 0);
            const totalInvestimentos = investimentosFiltrados.reduce((acc, i) => acc + Number(i.valor), 0);
            
            // Taxa Custo Fixo (Só Despesas / Faturamento)
            const taxaCustoFixo = faturamentoPeriodo > 0 
                ? (totalDespesas / faturamentoPeriodo) * 100 
                : 0;

            // --- INÍCIO DO PDF ---
            const doc = new jsPDF();

            // Título
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text("Relatório de Inteligência Financeira", 14, 22);

            // Subtítulo (Período)
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Período de Análise: ${new Date(dataInicio).toLocaleDateString('pt-BR')} até ${new Date(dataFim).toLocaleDateString('pt-BR')}`, 14, 30);

            // --- CARD DE RESUMO (Desenhado manualmente) ---
            doc.setDrawColor(200);
            doc.setFillColor(245, 247, 250);
            doc.roundedRect(14, 35, 180, 25, 3, 3, 'FD');

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Faturamento", 20, 42);
            doc.text("Total Despesas", 70, 42);
            doc.text("Investimentos", 120, 42);
            doc.text("Taxa Custo Fixo", 160, 42);

            doc.setFontSize(12);
            doc.setTextColor(0); // Preto
            doc.setFont("helvetica", "bold");
            
            const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            doc.text(BRL(faturamentoPeriodo), 20, 50);
            doc.setTextColor(239, 68, 68); // Vermelho
            doc.text(BRL(totalDespesas), 70, 50);
            doc.setTextColor(139, 92, 246); // Roxo
            doc.text(BRL(totalInvestimentos), 120, 50);
            
            // Cor da taxa dinâmica
            if (taxaCustoFixo > 30) doc.setTextColor(239, 68, 68); // Vermelho
            else if (taxaCustoFixo > 15) doc.setTextColor(245, 158, 11); // Laranja
            else doc.setTextColor(34, 197, 94); // Verde
            
            doc.text(`${taxaCustoFixo.toFixed(2)}%`, 160, 50);

            // --- TABELA DE DESPESAS ---
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text("Detalhamento de Despesas Fixas", 14, 70);

            autoTable(doc, {
                startY: 75,
                head: [['Vencimento', 'Descrição', 'Beneficiário', 'Status', 'Valor']],
                body: despesasFiltradas.map(d => [
                    new Date(d.dataVencimento || '').toLocaleDateString('pt-BR'),
                    d.nome,
                    d.beneficiario || '-',
                    d.pago ? 'Pago' : 'Pendente',
                    BRL(Number(d.valor))
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [239, 68, 68] }, // Vermelho
            });

            // --- TABELA DE INVESTIMENTOS ---
// --- TABELA DE INVESTIMENTOS ---
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalY = (doc as any).lastAutoTable.finalY + 15;

            doc.setFontSize(14);

            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.text("Detalhamento de Investimentos", 14, finalY);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Vencimento', 'Descrição', 'Valor']],
                body: investimentosFiltrados.map(i => [
                    new Date(i.dataVencimento || '').toLocaleDateString('pt-BR'),
                    i.nome,
                    BRL(Number(i.valor))
                ]),
                styles: { fontSize: 9 },
                headStyles: { fillColor: [139, 92, 246] }, // Roxo
            });

            // Rodapé
            const pageCount = doc.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text('Gerado pelo Sistema Denarius Financeiro', 14, doc.internal.pageSize.height - 10);
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            }

            // Salvar
            doc.save(`Relatorio_Financeiro_${dataInicio}_a_${dataFim}.pdf`);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar PDF.");
        } finally {
            setGerando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileText size={24} color="#475569" /> Relatório PDF
                    </h2>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body">
                    <p style={{ color: '#64748b', marginBottom: '20px' }}>
                        Selecione o período que deseja analisar. O sistema buscará o faturamento e as despesas desta data para calcular a taxa histórica.
                    </p>

                    <div className="form-group">
                        <label><Calendar size={14}/> Data Início</label>
                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label><Calendar size={14}/> Data Fim</label>
                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            className="btn-save-modal" 
                            style={{ backgroundColor: '#1e293b', width: '100%' }}
                            onClick={handleGerarPDF}
                            disabled={gerando}
                        >
                            <Download size={18} /> {gerando ? 'Gerando...' : 'Baixar Relatório PDF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}