// ARQUIVO: src/modules/financeiro/components/ModalHistorico.tsx

import { useEffect, useState } from 'react';
import { X, Clock, FileText, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatarBRL } from '../../../utils/formatters'; 
import { ModalConfirmacao } from './ModalConfirmacao'; 
import './ModalFinanceiro.css'; 

interface Props {
    onClose: () => void;
}

export function ModalHistorico({ onClose }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [historico, setHistorico] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalExclusao, setModalExclusao] = useState<{ aberto: boolean; id: number | null }>({ aberto: false, id: null });

    const API_BASE = 'http://localhost:3000/api/financeiro';

    const carregarLista = () => {
        fetch(`${API_BASE}/snapshots`)
            .then(res => {
                if (!res.ok) throw new Error("Erro na resposta do servidor");
                return res.json();
            })
            .then(data => {
                setHistorico(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar snapshots:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        carregarLista();
    }, []);

    const handleExcluirClique = (id: number) => {
        setModalExclusao({ aberto: true, id });
    };

    const confirmarExclusao = async () => {
        if (modalExclusao.id === null) return;

        try {
            const res = await fetch(`${API_BASE}/snapshots/${modalExclusao.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setHistorico(prev => prev.filter(item => item.id !== modalExclusao.id));
            } else {
                alert("Erro ao excluir. Verifique o servidor.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        } finally {
            setModalExclusao({ aberto: false, id: null });
        }
    };

    const gerarPDFAntigo = async (id: number) => {
        try {
            const res = await fetch(`${API_BASE}/snapshots/${id}`);
            if (!res.ok) throw new Error("Snapshot não encontrado na API");
            
            const fullData = await res.json();
            console.log("🔥 LOG DEBUG - Dados do Banco:", fullData);

            // ==========================================
            // 🛡️ MOTOR DE DESERIALIZAÇÃO PROFUNDA
            // ==========================================
            let backup = fullData.dados_backup ?? fullData.dadosBackup;

            // Loop para descascar o "Double Stringify"
            while (typeof backup === 'string') {
                try {
                    backup = JSON.parse(backup);
                } catch { 
                    break; // Se falhar no parse, interrompe o loop
                }
            }

            // Garantia estrutural (Fallback se vier nulo/vazio)
            if (!backup || typeof backup !== 'object') {
                backup = { despesas: [], investimentos: [] };
            }

            // Garante que é estritamente um Array antes de ir para a tabela
            const despesasArchive = Array.isArray(backup.despesas) ? backup.despesas : [];
            console.log("✅ LOG DEBUG - Despesas Prontas para o PDF:", despesasArchive);

            // ==========================================
            // GERAÇÃO DO PDF
            // ==========================================
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text(`Histórico: ${fullData.descricao}`, 14, 22);
            doc.setFontSize(10);
            
            const dataCriacao = fullData.criado_em ?? fullData.criadoEm;
            doc.text(`Registro original de: ${new Date(dataCriacao).toLocaleString('pt-BR')}`, 14, 30);

            doc.setFillColor(240, 240, 240);
            doc.rect(14, 35, 180, 20, 'F');
            doc.setFontSize(12);
            
            const faturamento = fullData.faturamento ?? 0;
            const taxa = fullData.taxa_custo_fixo ?? fullData.taxaCustoFixo ?? 0;

            doc.text(`Faturamento: ${formatarBRL(faturamento)}`, 20, 48);
            doc.text(`Taxa: ${Number(taxa).toFixed(2)}%`, 100, 48);

            doc.text("Despesas (Versão Arquivada)", 14, 65);
            
            autoTable(doc, {
                startY: 70,
                head: [['Nome', 'Valor', 'Status']],
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                body: despesasArchive.map((d: any) => [
                    d.nome || 'Sem Nome',
                    formatarBRL(d.valor || 0), 
                    d.ativo !== false ? 'Ativo' : 'Inativo'
                ]),
            });

            doc.save(`Checkpoint_${new Date(dataCriacao).toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Erro Crítico ao gerar PDF:", error);
            alert("Erro ao regenerar o relatório antigo. Verifique o console do navegador.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px', position: 'relative'}}>
                <div className="modal-header">
                    <h2><Clock size={20}/> Linha do Tempo</h2>
                    <button className="btn-close" onClick={onClose}><X size={24}/></button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            <p>Carregando histórico...</p>
                        </div>
                    ) : (
                        <div style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '5px'}}>
                            {historico.length === 0 && (
                                <p style={{color:'#94a3b8', textAlign:'center', padding:40, backgroundColor: '#f8fafc', borderRadius: 8}}>
                                    Nenhum checkpoint salvo ainda. Salve o seu primeiro fechamento!
                                </p>
                            )}
                            
                            {historico.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '15px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: 8, borderRadius: 8
                                }}>
                                    <div>
                                        <strong style={{display:'block', color: '#1e293b', fontSize: '1.05rem'}}>{item.descricao}</strong>
                                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>
                                            {new Date(item.criado_em ?? item.criadoEm).toLocaleString('pt-BR')}
                                        </span>
                                        <div style={{fontSize: '0.85rem', marginTop: 6, color: '#334155'}}>
                                            Taxa Fixada: <strong style={{ color: '#059669' }}>{Number(item.taxa_custo_fixo ?? item.taxaCustoFixo ?? 0).toFixed(2)}%</strong>
                                        </div>
                                    </div>
                                    
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button 
                                            onClick={() => handleExcluirClique(item.id)}
                                            style={{
                                                background: '#fef2f2', border: '1px solid #fecaca', padding: '8px',
                                                borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                color: '#ef4444', transition: 'background 0.2s'
                                            }}
                                            title="Excluir Permanentemente"
                                        >
                                            <Trash2 size={18}/>
                                        </button>

                                        <button 
                                            onClick={() => gerarPDFAntigo(item.id)}
                                            style={{
                                                background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px',
                                                borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                                fontSize: '0.85rem', color: '#475569', fontWeight: 500, transition: 'background 0.2s'
                                            }}
                                        >
                                            <FileText size={16}/> Ver PDF
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ModalConfirmacao 
                isOpen={modalExclusao.aberto}
                onClose={() => setModalExclusao({ aberto: false, id: null })}
                onConfirm={confirmarExclusao}
            />
        </div>
    );
}