import { useState, useRef } from 'react';
import { X, Calendar, Search, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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

    const [filtroSetor, setFiltroSetor] = useState<TipoFiltroSetor>('todos');

    const inicioRef = useRef<HTMLInputElement>(null);
    const fimRef = useRef<HTMLInputElement>(null);
    const relatorioRef = useRef<HTMLDivElement>(null); 

    // --- FUNÇÃO AUXILIAR PARA FORMATAR DATA (yyyy-mm-dd -> dd/mm/yyyy) ---
    // Isso evita bugs de fuso horário que o "new Date()" as vezes causa
    const formatarData = (dataIso: string) => {
        if (!dataIso) return '---';
        const [ano, mes, dia] = dataIso.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleFiltrar = async () => {
        if (!inicio || !fim) return alert("Selecione o período completo.");
        setLoading(true);
        try {
            const dados = await onBuscar(inicio, fim);
            setResultados(dados);
        } catch (err) {
            console.error("Erro ao buscar:", err);
            alert("Erro ao buscar relatório.");
        } finally {
            setLoading(false);
        }
    };

    // --- EXPORTAR PDF COM CABEÇALHO PERSONALIZADO ---
    const exportarPDF = async () => {
        if (!relatorioRef.current) return;
        setGerandoPdf(true);

        try {
            const element = relatorioRef.current;
            
            const canvas = await html2canvas(element, { 
                scale: 2, 
                backgroundColor: '#ffffff',
                // O SEGREDINHO ESTÁ AQUI:
                onclone: (documentClone) => {
                    // Encontra o cabeçalho oculto NO CLONE e torna visível
                    const headerOculto = documentClone.querySelector('.apenas-pdf') as HTMLElement;
                    if (headerOculto) {
                        headerOculto.style.display = 'block';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`Relatorio_Custos_${inicio}_ate_${fim}.pdf`);

        } catch (error) {
            console.error("Erro PDF:", error);
            alert("Erro ao gerar PDF");
        } finally {
            setGerandoPdf(false);
        }
    };

    const dadosFiltrados = resultados?.filter(func => {
        if (filtroSetor === 'todos') return true;
        return func.setor === filtroSetor;
    }) || null;

    const custoTotal = dadosFiltrados?.reduce((acc, func) => acc + (Number(func.custo_total_mensal) || 0), 0) || 0;
    const BRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="modal-overlay">
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
                                title="Baixar PDF"
                                style={{ color: '#0f766e', borderColor: '#0f766e' }}
                            >
                                {gerandoPdf ? '...' : <Download size={20}/>}
                            </button>
                        )}
                        <button className="btn-close" onClick={onClose}><X size={24}/></button>
                    </div>
                </div>

                <div className="modal-body">
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
                        <div ref={relatorioRef} style={{ padding: '20px', background: 'white' }}> {/* Aumentei o padding para ficar bonito no PDF */}
                            
                            {/* --- CABEÇALHO EXCLUSIVO DO PDF --- */}
                            {/* Ele tem display: 'none', mas a função onclone vai torná-lo visível na hora da foto */}
                            <div className="apenas-pdf" style={{ display: 'none', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
                                <h1 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 5px 0' }}>Relatório de Custos - Folha de Pagamento</h1>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '14px' }}>
                                    <p style={{ margin: 0 }}><strong>Período:</strong> {formatarData(inicio)} até {formatarData(fim)}</p>
                                    <p style={{ margin: 0 }}><strong>Setor Filtrado:</strong> {filtroSetor.toUpperCase()}</p>
                                    <p style={{ margin: 0 }}><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                            {/* ---------------------------------- */}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                                <strong style={{ color: '#334155' }}>
                                    Visualizando: {dadosFiltrados.length} registros 
                                </strong>
                                <div style={{ background: '#ecfccb', color: '#365314', padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid #d9f99d' }}>
                                    Total: {BRL(custoTotal)}
                                </div>
                            </div>

                            <div className="tabela-container" style={{ maxHeight: 'none', overflowY: 'visible', border: 'none' }}> 
                                <table style={{ border: '1px solid #e2e8f0' }}>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>Setor</th>
                                            <th>Função</th>
                                            <th>Admissão</th>
                                            <th>Custo Mensal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dadosFiltrados.length === 0 ? (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Nenhum registro encontrado.</td></tr>
                                        ) : (
                                            dadosFiltrados.map(func => (
                                                <tr key={func.id}>
                                                    <td><strong>{func.nome}</strong></td>
                                                    <td><span className={`badge-setor ${func.setor}`}>{func.setor === 'producao' ? 'Produção' : 'Admin'}</span></td>
                                                    <td>{func.funcao}</td>
                                                    <td>{new Date(func.data_admissao).toLocaleDateString('pt-BR')}</td>
                                                    <td style={{ fontWeight: 'bold', color: '#0f172a' }}>{BRL(Number(func.custo_total_mensal))}</td>
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