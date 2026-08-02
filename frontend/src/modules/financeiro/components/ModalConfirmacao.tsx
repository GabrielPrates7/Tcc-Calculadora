// ARQUIVO: src/modules/financeiro/components/ModalConfirmacao.tsx

import { AlertTriangle, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ModalConfirmacao({ isOpen, onClose, onConfirm }: Props) {
    if (!isOpen) return null;

    return (
        /* CORREÇÃO: Sem onClick={onClose} no backdrop */
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            
            <div className="modal-content" style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
                
                {/* Botão X (Fechar) no topo direito */}
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={20} />
                </button>

                {/* Corpo do Modal */}
                <div style={{ padding: '24px 24px 16px 24px', display: 'flex', gap: '16px' }}>
                    
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2' }}>
                        <AlertTriangle size={24} color="#ef4444" />
                    </div>

                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                            Excluir Registro
                        </h2>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
                            Tem certeza que deseja excluir este registro? Se ele possuir vínculos com outras métricas de faturamento, o sistema recalculará a taxa automaticamente para manter a integridade dos dados.
                        </p>
                    </div>
                </div>

                {/* Rodapé com Botões de Ação */}
                <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Cancelar
                    </button>
                    <button onClick={onConfirm} style={{ padding: '8px 16px', backgroundColor: '#ef4444', border: '1px solid #ef4444', color: '#ffffff', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Excluir Registro
                    </button>
                </div>

            </div>
        </div>
    );
}