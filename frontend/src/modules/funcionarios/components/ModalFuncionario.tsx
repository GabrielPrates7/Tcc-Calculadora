import { useState, type ChangeEvent } from 'react';
import { X, Save, Calendar, User, Briefcase, HardHat, DollarSign, Ban, AlertCircle, FileText } from 'lucide-react';
import type { Funcionario } from '../types';
import './ModalFuncionario.css';

interface DadosEnvio {
    id?: number;
    nome: string;
    funcao: string;
    setor: 'producao' | 'administrativo';
    ativo: boolean;
    data_admissao: string;
    salario: number;
    epi: number;
    // Campos opcionais de desligamento
    data_inativacao?: string | null;
    motivo_inativacao?: string | null;
}

interface Props {
    funcionarioEdicao: Funcionario | null;
    onClose: () => void;
    onSalvar: (dados: DadosEnvio | Funcionario) => Promise<void>;
}

export function ModalFuncionario({ funcionarioEdicao, onClose, onSalvar }: Props) {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Tratamento de datas na abertura
    const dataInicial = funcionarioEdicao?.data_admissao 
        ? funcionarioEdicao.data_admissao.split('T')[0] 
        : hoje;

    // --- ESTADOS ---
    const [nome, setNome] = useState(funcionarioEdicao?.nome || '');
    const [funcao, setFuncao] = useState(funcionarioEdicao?.funcao || '');
    const [setor, setSetor] = useState<'producao' | 'administrativo'>(
        funcionarioEdicao?.setor || 'producao'
    );
    const [dataAdmissao, setDataAdmissao] = useState(dataInicial);
    
    // Status e Desligamento
    const [ativo, setAtivo] = useState(funcionarioEdicao ? funcionarioEdicao.ativo : true);
    const [motivo, setMotivo] = useState(funcionarioEdicao?.motivo_inativacao || '');
    const [dataInativacao, setDataInativacao] = useState(
        funcionarioEdicao?.data_inativacao 
            ? funcionarioEdicao.data_inativacao.split('T')[0] 
            : hoje
    );

    // Financeiro (Lendo 'epi' corretamente do banco)
    const [salario, setSalario] = useState(Number(funcionarioEdicao?.salario_base) || 0);
    const [valorEpi, setValorEpi] = useState(Number(funcionarioEdicao?.epi) || 0);

    const [salvando, setSalvando] = useState(false);

    // Handlers
    const handleSetorChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSetor(e.target.value as 'producao' | 'administrativo');
    };

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const valor = e.target.value === 'true';
        setAtivo(valor);
        // Se reativar, limpa os dados de desligamento para não enviar lixo
        if (valor) {
            setMotivo('');
            setDataInativacao(hoje);
        }
    };

    const handleSubmit = async () => {
        if (!nome || !funcao) return alert("Preencha nome e função!");
        if (salario <= 0) return alert("Salário deve ser maior que zero.");

        // Validação de Inatividade
        if (!ativo) {
            if (!motivo) return alert("Por favor, selecione o motivo do desligamento.");
            if (!dataInativacao) return alert("Informe a data de inativação.");
        }

        setSalvando(true);

        const payload: DadosEnvio = {
            id: funcionarioEdicao?.id,
            nome, funcao, setor, ativo,
            data_admissao: dataAdmissao,
            salario: Number(salario),
            epi: Number(valorEpi),
            // Envia null se estiver ativo
            data_inativacao: ativo ? null : dataInativacao,
            motivo_inativacao: ativo ? null : motivo
        };

        await onSalvar(payload);
        setSalvando(false);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                    <div className="header-text">
                        <h2>{funcionarioEdicao ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
                        <p>Preencha os dados contratuais.</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={24}/></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    
                    {/* 1. Informações Pessoais */}
                    <div className="section-label">Informações Pessoais</div>
                    <div className="form-grid">
                        <div className="input-group span-2">
                            <label>Nome Completo</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João da Silva" autoFocus />
                            </div>
                        </div>
                        <div className="input-group span-2">
                            <label>Função / Cargo</label>
                            <div className="input-wrapper">
                                <Briefcase size={18} />
                                <input type="text" value={funcao} onChange={e => setFuncao(e.target.value)} placeholder="Ex: Marceneiro Sênior" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Contrato e Status */}
                    <div className="section-label">Status e Contrato</div>
                    <div className="form-grid three-cols">
                        <div className="input-group">
                            <label>Setor</label>
                            <select value={setor} onChange={handleSetorChange}>
                                <option value="producao">Produção</option>
                                <option value="administrativo">Administrativo</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Data Admissão</label>
                            <div className="input-wrapper">
                                <Calendar size={18} />
                                <input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Situação</label>
                            <select 
                                value={ativo ? 'true' : 'false'} 
                                onChange={handleStatusChange}
                                style={{ 
                                    borderColor: ativo ? '#22c55e' : '#ef4444', 
                                    color: ativo ? '#15803d' : '#b91c1c',
                                    fontWeight: '600',
                                    paddingLeft: '12px' // Força ajuste manual pois não tem wrapper
                                }}
                            >
                                <option value="true">🟢 Ativo</option>
                                <option value="false">🔴 Inativo</option>
                            </select>
                        </div>
                    </div>

                    {/* ÁREA CONDICIONAL: DESLIGAMENTO */}
                    {!ativo && (
                        <div className="inativo-box">
                            <div className="inativo-header">
                                <AlertCircle size={18}/> Detalhes do Desligamento
                            </div>
                            <div className="form-grid two-cols">
                                <div className="input-group">
                                    <label>Motivo</label>
                                    <div className="input-wrapper">
                                        <FileText size={18} />
                                        <select 
                                            value={motivo || ''} 
                                            onChange={e => setMotivo(e.target.value)}
                                        >
                                            <option value="" disabled>Selecione o motivo...</option>
                                            <option value="Pedido de Demissão">Pedido de Demissão</option>
                                            <option value="Demissão sem Justa Causa">Demissão sem Justa Causa</option>
                                            <option value="Demissão por Justa Causa">Demissão por Justa Causa</option>
                                            <option value="Término de Contrato">Término de Contrato</option>
                                            <option value="Aposentadoria">Aposentadoria</option>
                                            <option value="Falecimento">Falecimento</option>
                                            <option value="Outros">Outros</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Data Saída</label>
                                    <div className="input-wrapper">
                                        <Calendar size={18} />
                                        <input 
                                            type="date" 
                                            value={dataInativacao} 
                                            onChange={e => setDataInativacao(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="divider"></div>

                    {/* 3. Financeiro */}
                    <div className="section-label destaque">Base Financeira (Mensal)</div>
                    <div className="form-grid two-cols financeiro-box">
                        <div className="input-group">
                            <label>Salário Base</label>
                            <div className="input-wrapper money">
                                <span className="currency">R$</span>
                                <input type="number" value={salario} onChange={e => setSalario(Number(e.target.value))} placeholder="0.00" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Valor EPI / Benefícios</label>
                            <div className="input-wrapper money">
                                <span className="currency"><HardHat size={16}/> R$</span>
                                <input type="number" value={valorEpi} onChange={e => setValorEpi(Number(e.target.value))} placeholder="0.00" />
                            </div>
                        </div>
                    </div>

                    <div className="info-message">
                        <DollarSign size={16} />
                        <span>O sistema calculará automaticamente: 13º, Férias, INSS (8%) e FGTS (3,2%).</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={salvando}>
                        <Ban size={18}/> Cancelar
                    </button>
                    <button className="btn-save" onClick={handleSubmit} disabled={salvando}>
                        <Save size={18}/> {salvando ? 'Salvando...' : 'Salvar Dados'}
                    </button>
                </div>
            </div>
        </div>
    );
}