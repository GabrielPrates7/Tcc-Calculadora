import { useState } from 'react';
import { Users, Edit2, Save, X, AlertCircle } from 'lucide-react';
import type { Funcionario } from '../types';
import './ModalFuncionario.css';

interface Props {
    funcionarioEdicao: Funcionario | null;
    onClose: () => void;
    onSalvar: (dados: Partial<Funcionario>) => Promise<boolean>;
}

export function ModalFuncionario({ funcionarioEdicao, onClose, onSalvar }: Props) {
    // --- Inicialização de Estado Direta (Sem useEffect) ---
    
    const [nome, setNome] = useState(funcionarioEdicao?.nome || '');
    const [funcao, setFuncao] = useState(funcionarioEdicao?.funcao || '');
    const [salario, setSalario] = useState(funcionarioEdicao?.salario_base || '');
    const [epi, setEpi] = useState(funcionarioEdicao?.epi || '');
    
    const [ativo, setAtivo] = useState(funcionarioEdicao ? funcionarioEdicao.ativo : true);
    
    // Tipagem explícita aqui evita problemas no select
    const [setor, setSetor] = useState<'producao' | 'administrativo'>(
        funcionarioEdicao?.setor || 'producao'
    );
    
    // Tratamento de Datas
    const [dataAdmissao, setDataAdmissao] = useState(() => {
        if (funcionarioEdicao?.data_admissao) {
            return funcionarioEdicao.data_admissao.split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    });

    const [dataInativacao, setDataInativacao] = useState(() => {
        return funcionarioEdicao?.data_inativacao ? funcionarioEdicao.data_inativacao.split('T')[0] : '';
    });

    const [motivoInativacao, setMotivoInativacao] = useState(funcionarioEdicao?.motivo_inativacao || '');

    const [salvando, setSalvando] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome || !salario) return alert("Preencha nome e salário!");

        if (!ativo && (!dataInativacao || !motivoInativacao)) {
            return alert("Para inativar, preencha a Data de Saída e o Motivo.");
        }

        setSalvando(true);
        const dados: Partial<Funcionario> = {
            id: funcionarioEdicao?.id, 
            nome,
            funcao,
            salario_base: String(salario), 
            epi: String(epi),
            ativo,
            setor,
            data_admissao: dataAdmissao,
            data_inativacao: !ativo ? dataInativacao : undefined,
            motivo_inativacao: !ativo ? motivoInativacao : undefined
        };

        const sucesso = await onSalvar(dados);
        if (sucesso) onClose();
        setSalvando(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {funcionarioEdicao ? <Edit2 size={24} color="#3b82f6" /> : <Users size={24} color="#3b82f6" />} 
                        {funcionarioEdicao ? ' Editar Colaborador' : ' Novo Colaborador'}
                    </h2>
                    <button className="btn-close-modal" onClick={onClose}><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="form-funcionario">
                    <div className="form-grid-modal">
                        <div className="input-group"><label>Nome Completo</label><input type="text" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} autoFocus /></div>
                        <div className="input-group"><label>Função / Cargo</label><input type="text" placeholder="Ex: Marceneiro" value={funcao} onChange={e => setFuncao(e.target.value)} /></div>
                        <div className="input-group"><label>Salário Base (R$)</label><input type="number" placeholder="0.00" value={salario} onChange={e => setSalario(e.target.value)} /></div>
                        <div className="input-group"><label>EPI / Vale (R$)</label><input type="number" placeholder="0.00" value={epi} onChange={e => setEpi(e.target.value)} /></div>
                    </div>

                    <div className="form-row-bottom" style={{ marginBottom: '10px' }}>
                        <div className="input-group">
                            <label>Setor</label>
                            {/* CORREÇÃO AQUI: Trocamos 'any' pela tipagem correta */}
                            <select 
                                value={setor} 
                                onChange={e => setSetor(e.target.value as 'producao' | 'administrativo')}
                            >
                                <option value="producao">🛠️ Produção (Fábrica)</option>
                                <option value="administrativo">💻 Administrativo (Escritório)</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Status</label>
                            <select value={ativo ? 'true' : 'false'} onChange={e => setAtivo(e.target.value === 'true')}>
                                <option value="true">✅ Ativo (Trabalhando)</option>
                                <option value="false">⛔ Inativo / Afastado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row-bottom">
                        <div className="input-group">
                            <label>Data Admissão</label>
                            <input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} />
                        </div>

                        {!ativo && (
                            <div className="input-group" style={{ gridColumn: '1 / -1', borderTop: '1px dashed #cbd5e1', paddingTop: '15px', marginTop: '5px' }}>
                                <div style={{ display: 'flex', gap: '8px', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '10px' }}>
                                    <AlertCircle size={16} /> Dados de Saída / Afastamento
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ color: '#ef4444' }}>Data Saída</label>
                                        <input type="date" value={dataInativacao} onChange={e => setDataInativacao(e.target.value)} style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }} />
                                    </div>
                                    <div>
                                        <label style={{ color: '#ef4444' }}>Motivo</label>
                                        <select value={motivoInativacao} onChange={e => setMotivoInativacao(e.target.value)} style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>
                                            <option value="">Selecione...</option>
                                            <option value="Demissão sem justa causa">Demissão sem justa causa</option>
                                            <option value="Demissão com justa causa">Demissão com justa causa</option>
                                            <option value="Pedido de Demissão">Pedido de Demissão</option>
                                            <option value="Fim de Contrato">Fim de Contrato</option>
                                            <option value="Atestado / Doença">Atestado / Doença</option>
                                            <option value="Férias">Férias</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="btn-container-modal">
                        <button type="submit" className="btn-salvar" disabled={salvando}>
                            <Save size={18} /> {salvando ? 'Salvando...' : (funcionarioEdicao ? 'Salvar Alterações' : 'Cadastrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}