// ARQUIVO: src/modules/financeiro/components/ModalHistorico.tsx

import { useEffect, useState } from 'react';
import { X, Clock, FileText, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ModalFinanceiro.css'; 

interface Props {
    onClose: () => void;
}

export function ModalHistorico({ onClose }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [historico, setHistorico] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. DEFINIR A FUNÇÃO PRIMEIRO
    const carregarLista = () => {
        fetch('http://localhost:3000/financeiro/snapshots')
            .then(res => res.json())
            .then(data => {
                setHistorico(data);
                setLoading(false);
            });
    };

    // 2. USAR NO EFEITO DEPOIS
    useEffect(() => {
        carregarLista();
    }, []);

    // Função de Excluir
    const handleExcluir = async (id: number) => {
        if (!confirm("Tem certeza que deseja apagar este histórico permanentemente?")) return;

        try {
            const res = await fetch(`http://localhost:3000/financeiro/snapshots/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                // Remove visualmente
                setHistorico(prev => prev.filter(item => item.id !== id));
            } else {
                alert("Erro ao excluir.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    };

    // Função de Gerar PDF
    const gerarPDFAntigo = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:3000/financeiro/snapshots/${id}`);
            const fullData = await res.json();
            
            const backup = typeof fullData.dados_backup === 'string' 
                ? JSON.parse(fullData.dados_backup) 
                : fullData.dados_backup;

            const { despesas } = backup;

            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text(`Histórico: ${fullData.descricao}`, 14, 22);
            doc.setFontSize(10);
            doc.text(`Registro original de: ${new Date(fullData.criado_em).toLocaleString('pt-BR')}`, 14, 30);

            doc.setFillColor(240, 240, 240);
            doc.rect(14, 35, 180, 20, 'F');
            doc.setFontSize(12);
            doc.text(`Faturamento: R$ ${Number(fullData.faturamento).toLocaleString('pt-BR')}`, 20, 48);
            doc.text(`Taxa: ${Number(fullData.taxa_custo_fixo).toFixed(2)}%`, 100, 48);

            doc.text("Despesas (Versão Arquivada)", 14, 65);
            
            autoTable(doc, {
                startY: 70,
                head: [['Nome', 'Valor', 'Status']],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body: despesas.map((d: any) => [
                    d.nome,
                    `R$ ${Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    d.ativo ? 'Ativo' : 'Inativo'
                ]),
            });

            doc.save(`Checkpoint_${new Date(fullData.criado_em).toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error(error);
            alert("Erro ao regenerar o relatório antigo.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                <div className="modal-header">
                    <h2><Clock size={20}/> Linha do Tempo</h2>
                    <button className="btn-close" onClick={onClose}><X size={24}/></button>
                </div>
                <div className="modal-body">
                    {loading ? <p>Carregando...</p> : (
                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {historico.length === 0 && <p style={{color:'#999', textAlign:'center', padding:20}}>Nenhum checkpoint salvo.</p>}
                            
                            {historico.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '15px', borderBottom: '1px solid #eee', background: '#fafafa', marginBottom: 5, borderRadius: 6
                                }}>
                                    <div>
                                        <strong style={{display:'block', color: '#334155'}}>{item.descricao}</strong>
                                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                                            {new Date(item.criado_em).toLocaleString('pt-BR')}
                                        </span>
                                        <div style={{fontSize: '0.85rem', marginTop: 4}}>
                                            Taxa: <strong>{Number(item.taxa_custo_fixo).toFixed(2)}%</strong>
                                        </div>
                                    </div>
                                    
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button 
                                            onClick={() => handleExcluir(item.id)}
                                            style={{
                                                background: '#fee2e2', border: '1px solid #fecaca', padding: '6px 10px',
                                                borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                color: '#ef4444'
                                            }}
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 size={16}/>
                                        </button>

                                        <button 
                                            onClick={() => gerarPDFAntigo(item.id)}
                                            style={{
                                                background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px',
                                                borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                                fontSize: '0.8rem', color: '#475569'
                                            }}
                                        >
                                            <FileText size={14}/> Ver PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}