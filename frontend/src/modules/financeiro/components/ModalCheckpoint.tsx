// ARQUIVO: src/modules/financeiro/components/ModalCheckpoint.tsx

import { useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (descricao: string) => Promise<void>;
}

export function ModalCheckpoint({ isOpen, onClose, onSave }: Props) {
    const [descricao, setDescricao] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!descricao.trim()) {
            setErro("A descrição é obrigatória.");
            return;
        }
        
        setErro(null);
        setSalvando(true);
        await onSave(descricao);
        setSalvando(false);
        setDescricao(''); // Reseta o campo após salvar
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={20} />
                </button>

                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '50%' }}>
                            <Save size={24} color="#059669" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Salvar Checkpoint</h2>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
                        Crie um ponto de restauração com os dados atuais. Isso salvará o faturamento e as taxas deste exato momento.
                    </p>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                            Nome do Checkpoint (Ex: Fechamento Jul/26) <span style={{color: '#ef4444'}}>*</span>
                        </label>
                        <input 
                            type="text" 
                            autoFocus
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder="Digite uma descrição..."
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                        />
                    </div>

                    {erro && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                            <AlertCircle size={16} /> {erro}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button onClick={onClose} style={{ padding: '10px 16px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={salvando} style={{ padding: '10px 16px', backgroundColor: '#059669', border: 'none', color: '#ffffff', borderRadius: '6px', fontWeight: 500, cursor: salvando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {salvando ? 'Salvando...' : 'Confirmar e Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}