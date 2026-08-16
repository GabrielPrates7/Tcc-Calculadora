import { useState, useRef } from 'react';
import { X, Calendar, Search, Download, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarBRL } from '../../../utils/formatters'; 
import type { Funcionario } from '../types';
import './ModalRelatorioCusto.css'; 

interface Props {
    onClose: () => void;
    onBuscar: (inicio: string, fim: string) => Promise<Funcionario[]>;
}

type TipoFiltroSetor = 'todos' | 'producao' | 'administrativo';

export function ModalRelatorioCusto({ onClose, onBuscar }: Props) {
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [resultados, setResultados] = useState<Funcionario[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [gerandoPdf, setGerandoPdf] = useState(false);
    const [erroValidacao, setErroValidacao] = useState<string | null>(null);

    const [filtroSetor, setFiltroSetor] = useState<TipoFiltroSetor>('todos');

    const inicioRef = useRef<HTMLInputElement>(null);
    const fimRef = useRef<HTMLInputElement>(null);
    const logoRef = useRef<HTMLImageElement>(null); 

    const formatarData = (dataIso: string) => {
        if (!dataIso) return '---';
        const [ano, mes, dia] = dataIso.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleFiltrar = async () => {
        setErroValidacao(null); // Reseta erros anteriores

        if (!inicio || !fim) {
            setErroValidacao("Preencha a data de início e fim para gerar o relatório.");
            return;
        }

        if (new Date(inicio) > new Date(fim)) {
            setErroValidacao("A data de início não pode ser posterior à data de término.");
            return;
        }

        setLoading(true);
        try {
            const dados = await onBuscar(inicio, fim);
            setResultados(dados);
        } catch (err) {
            console.error("Erro ao buscar:", err);
            setErroValidacao("Falha na comunicação com o servidor ao buscar os dados.");
        } finally {
            setLoading(false);
        }
    };

    const dadosFiltrados = resultados?.filter(func => {
        if (filtroSetor === 'todos') return true;
        return func.setor === filtroSetor;
    }) || null;

    const custoTotal = dadosFiltrados?.reduce((acc, func) => acc + (Number(func.custo_total_mensal) || 0), 0) || 0;

    const exportarPDF = () => {
        if (!dadosFiltrados || dadosFiltrados.length === 0) return;
        setGerandoPdf(true);

        try {
            const doc = new jsPDF('p', 'pt', 'a4');
            
            // 1. Cabeçalho Nativo e Injeção da Logo
            const yHeader = 40;
            const logoImg = logoRef.current;
            let textStartX = 40;

            if (logoImg) {
                try {
                    doc.addImage(logoImg, 'PNG', 40, yHeader - 15, 28, 28);
                    textStartX = 75; 
                } catch (e) {
                    console.error("Erro ao renderizar logo no PDF:", e);
                }
            }

            doc.setFontSize(16);
            doc.setTextColor(15, 23, 42); 
            doc.text('Relatório de Custos - Folha de Pagamento', textStartX, yHeader);
            
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(`Período: ${formatarData(inicio)} até ${formatarData(fim)}`, textStartX, yHeader + 14);
            doc.text(`Setor: ${filtroSetor.toUpperCase()}   |   Emissão: ${new Date().toLocaleDateString('pt-BR')}`, textStartX, yHeader + 26);

            // 2. Resumo de Totais
            const ySummary = yHeader + 60;
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            doc.text(`Visualizando: ${dadosFiltrados.length} registros`, 40, ySummary);

            const totalFormatado = formatarBRL(custoTotal);
            doc.setFontSize(11);
            doc.setTextColor(21, 128, 61); 
            doc.setFont('helvetica', 'bold');
            doc.text(`Custo Total: ${totalFormatado}`, 390, ySummary);
            doc.setFont('helvetica', 'normal'); 

            // 3. Tabela Multi-Páginas
            autoTable(doc, {
                startY: ySummary + 15,
                head: [['NOME', 'SETOR', 'FUNÇÃO', 'ADMISSÃO', 'CUSTO MENSAL']],
                body: dadosFiltrados.map(func => [
                    func.nome,
                    func.setor === 'producao' ? 'PRODUÇÃO' : 'ADMIN',
                    func.funcao || '-',
                    new Date(func.data_admissao).toLocaleDateString('pt-BR'),
                    formatarBRL(func.custo_total_mensal || 0)
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [255, 255, 255], 
                    textColor: [15, 23, 42],
                    fontSize: 8,
                    fontStyle: 'bold',
                    lineColor: [226, 232, 240],
                    lineWidth: 1,
                },
                bodyStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [51, 65, 85],
                    fontSize: 8,
                    lineColor: [226, 232, 240],
                    lineWidth: 1,
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255] 
                },
                styles: {
                    cellPadding: 6,
                }
            });

            doc.save(`Relatorio_Custos_${inicio}_ate_${fim}.pdf`);

        } catch (error) {
            console.error("Erro PDF:", error);
            alert("Erro ao gerar PDF");
        } finally {
            setGerandoPdf(false);
        }
    };

    return (
        <div className="modal-overlay">
            <img 
                ref={logoRef}
                src="/logo-denarius-branca.png" 
                alt="Logo Denarius Branca" 
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '10px' }}
            />

            <div className="modal-content" style={{ maxWidth: '900px' }}>
                
                <div className="modal-header" style={{ alignItems: 'center' }}>
                    <div className="header-text">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} color="var(--cor-primaria)"/> 
                            Relatório de Custo Histórico
                        </h2>
                        <p>Filtre os colaboradores ativos em um período específico.</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {resultados && (
                            <button 
                                onClick={exportarPDF} 
                                disabled={gerandoPdf}
                                className="btn-icon"
                                title="Baixar PDF Analítico"
                                style={{ color: '#0f766e', borderColor: '#0f766e' }}
                            >
                                {gerandoPdf ? '...' : <Download size={20}/>}
                            </button>
                        )}
                        <button className="btn-close" onClick={onClose}><X size={24}/></button>
                    </div>
                </div>

                <div className="modal-body">
                    
                    {erroValidacao && (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            backgroundColor: '#fef2f2', border: '1px solid #fecaca', 
                            color: '#ef4444', padding: '12px 16px', borderRadius: '6px', 
                            marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500'
                        }}>
                            <AlertCircle size={18} />
                            {erroValidacao}
                        </div>
                    )}

                    <div className="filtros-box">
                        <div className="filtro-grupo">
                            <label>Início</label>
                            <div className="input-wrapper">
                                <input ref={inicioRef} type="date" className="input-data-dark" value={inicio} onChange={e => setInicio(e.target.value)} />
                                <button className="btn-calendar-trigger" onClick={() => inicioRef.current?.showPicker()}><Calendar size={18} /></button>
                            </div>
                        </div>
                        <div className="filtro-grupo">
                            <label>Fim</label>
                            <div className="input-wrapper">
                                <input ref={fimRef} type="date" className="input-data-dark" value={fim} onChange={e => setFim(e.target.value)} />
                                <button className="btn-calendar-trigger" onClick={() => fimRef.current?.showPicker()}><Calendar size={18} /></button>
                            </div>
                        </div>
                        <div className="filtro-grupo">
                            <label>Setor</label>
                            <div className="input-wrapper">
                                <select 
                                    className="input-data-dark" 
                                    value={filtroSetor}
                                    onChange={(e) => setFiltroSetor(e.target.value as TipoFiltroSetor)}
                                    style={{ width: '160px', borderRadius: '6px', borderRight: '1px solid #cbd5e1' }}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="producao">Produção</option>
                                    <option value="administrativo">Administrativo</option>
                                </select>
                            </div>
                        </div>
                        <button onClick={handleFiltrar} disabled={loading} className="btn-filtrar">
                            <Search size={16}/> {loading ? 'Buscando...' : 'Filtrar'}
                        </button>
                    </div>

                    {dadosFiltrados && (
                        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}> 
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                <strong style={{ color: '#334155' }}>
                                    Visualizando: {dadosFiltrados.length} registros 
                                </strong>
                                <div style={{ background: '#ecfccb', color: '#365314', padding: '6px 14px', borderRadius: '20px', fontSize: '0.95rem', fontWeight: 'bold', border: '1px solid #d9f99d' }}>
                                    Total: {formatarBRL(custoTotal)}
                                </div>
                            </div>

                            <div className="tabela-container" style={{ maxHeight: 'none', overflowY: 'visible', border: 'none', boxShadow: 'none' }}> 
                                <table style={{ border: '1px solid #e2e8f0', width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                            <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nome</th>
                                            <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Setor</th>
                                            <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Função</th>
                                            <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Admissão</th>
                                            <th style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>Custo Mensal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dadosFiltrados.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Nenhum registro encontrado para este período.</td></tr>
                                        ) : (
                                            dadosFiltrados.map(func => (
                                                <tr key={func.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                                                    <td style={{ padding: '12px', color: '#334155' }}><strong>{func.nome}</strong></td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span className={`badge-setor ${func.setor}`}>
                                                            {func.setor === 'producao' ? 'Produção' : 'Admin'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px', color: '#475569' }}>{func.funcao}</td>
                                                    <td style={{ padding: '12px', color: '#475569' }}>{new Date(func.data_admissao).toLocaleDateString('pt-BR')}</td>
                                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                                                        {formatarBRL(func.custo_total_mensal || 0)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}