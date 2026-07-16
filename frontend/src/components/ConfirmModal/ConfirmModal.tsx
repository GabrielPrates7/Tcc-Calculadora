import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    textoConfirmar?: string;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, textoConfirmar = "Excluir" }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <button className="confirm-btn-close" onClick={onCancel}>
                    <X size={20} />
                </button>
                
                <div className="confirm-modal-body">
                    <div className="confirm-icon-wrapper">
                        <AlertTriangle size={32} color="#ef4444" />
                    </div>
                    <div className="confirm-text">
                        <h3>{title}</h3>
                        <p>{message}</p>
                    </div>
                </div>

                <div className="confirm-modal-footer">
                    <button className="btn-cancelar-padrao" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="btn-confirmar-perigo" onClick={onConfirm}>
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}