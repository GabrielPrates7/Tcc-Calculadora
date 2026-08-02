// ARQUIVO: src/modules/financeiro/components/ModalNovoCheckpoint.tsx

import { Save, X, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (descricao: string) => Promise<boolean>;
}

export function ModalNovoCheckpoint({ isOpen, onClose, onConfirm }: Props) {
    const [descricao, setDescricao] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!descricao.trim()) {
            alert("Por favor, informe um nome para o checkpoint."); 
            return;
        }

        setIsSubmitting(true);
        const sucesso = await onConfirm(descricao); 
        
        if (sucesso) {
            setIsSuccess(true);
            setTimeout(() => {
                fecharE_Resetar();
            }, 2000);
        } else {
            setIsSubmitting(false);
        }
    };

    const fecharE_Resetar = () => {
        setDescricao('');
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
    };

    return (
        /* CORREÇÃO: Sem onClick={fecharE_Resetar} no backdrop */
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            
            <div className="modal-content" style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
                
                {isSuccess ? (
                    <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <CheckCircle size={64} color="#059669" style={{ marginBottom: '16px' }} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Salvo com sucesso!</h2>
                        <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>O histórico foi gravado na linha do tempo.</p>
                    </div>
                ) : (
                    <>
                        <button onClick={fecharE_Resetar} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={20} />
                        </button>

                        <div style={{ padding: '24px 24px 16px 24px', display: 'flex', gap: '16px' }}>
                            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5' }}>
                                <Save size={24} color="#059669" />
                            </div>

                            <div style={{ width: '100%' }}>
                                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                                    Salvar Ponto de Controle
                                </h2>
                                <p style={{ margin: '8px 0 16px 0', fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
                                    Dê um nome para este fechamento (Ex: Fechamento Julho/2026). Isso salvará uma cópia exata de todos os registros atuais.
                                </p>

                                <input 
                                    type="text" 
                                    placeholder="Nome do Checkpoint..." 
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    autoFocus
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', 
                                        fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                />
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9' }}>
                            <button onClick={fecharE_Resetar} disabled={isSubmitting} style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                                Cancelar
                            </button>
                            <button onClick={handleConfirm} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#059669', border: '1px solid #059669', color: '#ffffff', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                                {isSubmitting ? <><Loader2 size={16} className="spinner" /> Salvando...</> : 'Salvar Histórico'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}