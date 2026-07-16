import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { X, Save, Calendar, User, HardHat, DollarSign, Ban, AlertCircle, FileText, Settings, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Funcionario } from '../types';
import { ModalGerenciarFuncoes } from './ModalGerenciarFuncoes';
import './ModalFuncionario.css';

interface DadosEnvio {
    id?: number;
    nome: string;
    funcao_id: number; 
    setor: 'producao' | 'administrativo';
    ativo: boolean;
    data_admissao: string;
    salarioBase: number;
    epi: number;
    data_inativacao?: string | null;
    motivo_inativacao?: string | null;
}

type FuncionarioBD = Funcionario & {
    funcao_id?: number;
    salario_base?: number | string;
};

interface Props {
    funcionarioEdicao: Funcionario | null;
    onClose: () => void;
    onSalvar: (dados: DadosEnvio | Partial<Funcionario>) => Promise<void>; 
}

export function ModalFuncionario({ funcionarioEdicao, onClose, onSalvar }: Props) {
    const hoje = new Date().toISOString().split('T')[0];
    const funcEdicao = funcionarioEdicao as FuncionarioBD | null;

    const dataInicial = funcEdicao?.data_admissao 
        ? funcEdicao.data_admissao.split('T')[0] 
        : hoje;

    const [nome, setNome] = useState(funcEdicao?.nome || '');
    const [funcaoId, setFuncaoId] = useState<number | ''>(funcEdicao?.funcao_id || '');
    
    // Estados para o Autocomplete customizado
    const [buscaFuncao, setBuscaFuncao] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const [setor, setSetor] = useState<'producao' | 'administrativo'>(
        funcEdicao?.setor || 'producao'
    );
    const [dataAdmissao, setDataAdmissao] = useState(dataInicial);
    
    const [ativo, setAtivo] = useState(funcEdicao ? funcEdicao.ativo : true);
    const [motivo, setMotivo] = useState(funcEdicao?.motivo_inativacao || '');
    const [dataInativacao, setDataInativacao] = useState(
        funcEdicao?.data_inativacao 
            ? funcEdicao.data_inativacao.split('T')[0] 
            : hoje
    );

    const [salario, setSalario] = useState<string>(
        funcEdicao?.salario_base 
            ? Number(funcEdicao.salario_base).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : ''
    );
    const [valorEpi, setValorEpi] = useState<string>(
        funcEdicao?.epi 
            ? Number(funcEdicao.epi).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : ''
    );

    const [salvando, setSalvando] = useState(false);
    
    // Tipagem explícita para resolver o erro 'any' no find()
    type FuncaoItem = { id: number; nome: string };
    const [listaFuncoes, setListaFuncoes] = useState<FuncaoItem[]>([]);
    const [showGerenciador, setShowGerenciador] = useState(false);

    const carregarFuncoes = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:3000/api/funcoes');
            const data: FuncaoItem[] = await res.json();
            setListaFuncoes(data);
            
            if (funcEdicao?.funcao_id) {
                const funcaoEncontrada = data.find((f: FuncaoItem) => f.id === funcEdicao.funcao_id);
                if (funcaoEncontrada) setBuscaFuncao(funcaoEncontrada.nome);
            }
        } catch (error) {
            console.error("Erro ao carregar funções", error);
        }
    }, [funcEdicao]);

    useEffect(() => {
        const inicializar = async () => {
            await carregarFuncoes();
        };
        void inicializar();
    }, [carregarFuncoes]);

    const funcoesFiltradas = listaFuncoes.filter(f => 
        f.nome.toLowerCase().includes(buscaFuncao.toLowerCase())
    );

    // LÓGICA ALTERADA: Máscara com digitação natural da esquerda para a direita
    const aplicarMascaraMoeda = (valor: string): string => {
        let v = valor.replace(/[^\d,]/g, ''); 

        const partes = v.split(',');
        if (partes.length > 2) {
            v = partes[0] + ',' + partes.slice(1).join('');
        }

        if (v.length > 1 && v.startsWith('0') && !v.startsWith('0,')) {
            v = v.replace(/^0+/, '');
            if (v.startsWith(',')) v = '0' + v; 
        }

        if (v.includes(',')) {
            const [inteiro, decimal] = v.split(',');
            v = inteiro + ',' + decimal.substring(0, 2);
        }

        const [inteiro, decimal] = v.split(',');
        const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return decimal !== undefined ? `${inteiroFormatado},${decimal}` : inteiroFormatado;
    };

    const limparMascaraMoeda = (valorFormatado: string): number => {
        if (!valorFormatado) return 0;
        const stringLimpa = valorFormatado.replace(/\./g, '').replace(',', '.');
        return Number(stringLimpa);
    };

    // LÓGICA ADICIONADA: Autocompleta casas decimais ao tirar o foco do input
    const completarDecimais = (valor: string, setValor: React.Dispatch<React.SetStateAction<string>>) => {
        if (!valor) return;
        let v = valor;
        if (!v.includes(',')) v += ',00';
        else if (v.endsWith(',')) v += '00';
        else if (v.split(',')[1].length === 1) v += '0';
        setValor(v);
    };

    const handleSalarioChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSalario(aplicarMascaraMoeda(e.target.value));
    };

    const handleValorEpiChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValorEpi(aplicarMascaraMoeda(e.target.value));
    };

    const handleSubmit = async () => {
        if (!nome.trim()) {
            toast.warning("Preencha o nome!");
            return;
        }
        if (funcaoId === '') {
            toast.warning("Selecione uma função na lista suspensa válida!");
            return;
        }
        
        const salarioNumerico = limparMascaraMoeda(salario);
        if (salarioNumerico <= 0) {
            toast.warning("Salário deve ser maior que zero.");
            return;
        }

        if (!ativo) {
            if (!motivo) {
                toast.warning("Por favor, selecione o motivo do desligamento.");
                return;
            }
            if (!dataInativacao) {
                toast.warning("Informe a data de inativação.");
                return;
            }
        }

        setSalvando(true);

        const payload: DadosEnvio = {
            id: funcEdicao?.id,
            nome: nome.trim(), 
            funcao_id: Number(funcaoId), 
            setor, 
            ativo,
            data_admissao: dataAdmissao,
            salarioBase: salarioNumerico, 
            epi: limparMascaraMoeda(valorEpi), 
            data_inativacao: ativo ? null : dataInativacao,
            motivo_inativacao: ativo ? null : motivo
        };

        try {
            await onSalvar(payload);
            toast.success(funcEdicao ? "Dados atualizados com sucesso!" : "Colaborador cadastrado com sucesso!");
            onClose();
        } catch (error) {
            console.error("Falha ao salvar:", error);
            toast.error("Erro ao salvar. Verifique a conexão com o servidor.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="header-text">
                            <h2>{funcionarioEdicao ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
                            <p>Preencha os dados contratuais.</p>
                        </div>
                        <button className="btn-close" onClick={onClose}><X size={24}/></button>
                    </div>

                    <div className="modal-body">
                        
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    
                                    <div className="input-wrapper" style={{ flex: 1, padding: 0, position: 'relative', overflow: 'visible' }}>
                                        <div style={{ paddingLeft: '12px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                                            <Search size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={buscaFuncao}
                                            onChange={(e) => {
                                                setBuscaFuncao(e.target.value);
                                                setDropdownOpen(true);
                                                setFuncaoId(''); 
                                            }}
                                            onFocus={() => setDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                                            placeholder="Digite para buscar a função..."
                                            style={{ border: 'none', background: 'transparent', width: '100%', padding: '10px', outline: 'none', color: '#0f172a' }}
                                        />
                                        
                                        {dropdownOpen && (
                                            <ul style={{
                                                position: 'absolute', top: '100%', left: 0, right: 0, 
                                                maxHeight: '180px', overflowY: 'auto', background: '#fff', 
                                                border: '1px solid #cbd5e1', borderRadius: '6px', 
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 100,
                                                listStyle: 'none', padding: 0, margin: '4px 0 0 0'
                                            }}>
                                                {funcoesFiltradas.length === 0 ? (
                                                    <li style={{ padding: '10px', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                                                        Nenhuma função encontrada.
                                                    </li>
                                                ) : (
                                                    funcoesFiltradas.map(f => (
                                                        <li 
                                                            key={f.id} 
                                                            onClick={() => {
                                                                setFuncaoId(f.id);
                                                                setBuscaFuncao(f.nome);
                                                                setDropdownOpen(false);
                                                            }}
                                                            style={{
                                                                padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                                                                color: '#1e293b', fontSize: '0.9rem'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            {f.nome}
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setShowGerenciador(true)}
                                        style={{
                                            background: '#f8fafc', border: '1px solid #cbd5e1', 
                                            borderRadius: '6px', padding: '0 14px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#64748b', transition: 'all 0.2s'
                                        }}
                                        title="Gerenciar Departamentos"
                                        onMouseEnter={e => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#3b82f6' }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1' }}
                                    >
                                        <Settings size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="section-label">Status e Contrato</div>
                        <div className="form-grid three-cols">
                            <div className="input-group">
                                <label>Setor</label>
                                <select value={setor} onChange={e => setSetor(e.target.value as 'producao' | 'administrativo')}>
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
                                    onChange={e => {
                                        const val = e.target.value === 'true';
                                        setAtivo(val);
                                        if (val) { setMotivo(''); setDataInativacao(hoje); }
                                    }}
                                    style={{ borderColor: ativo ? '#22c55e' : '#ef4444', color: ativo ? '#15803d' : '#b91c1c', fontWeight: '600', paddingLeft: '12px' }}
                                >
                                    <option value="true">🟢 Ativo</option>
                                    <option value="false">🔴 Inativo</option>
                                </select>
                            </div>
                        </div>

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
                                            <select value={motivo || ''} onChange={e => setMotivo(e.target.value)}>
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
                                            <input type="date" value={dataInativacao} onChange={e => setDataInativacao(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="divider"></div>

                        <div className="section-label destaque">Base Financeira (Mensal)</div>
                        <div className="form-grid two-cols financeiro-box">
                            <div className="input-group">
                                <label>Salário Base</label>
                                <div className="input-wrapper money">
                                    <span className="currency">R$</span>
                                    <input 
                                        type="text" 
                                        value={salario} 
                                        onChange={handleSalarioChange} 
                                        onBlur={() => completarDecimais(salario, setSalario)}
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Valor EPI / Benefícios</label>
                                <div className="input-wrapper money">
                                    <span className="currency"><HardHat size={16}/> R$</span>
                                    <input 
                                        type="text" 
                                        value={valorEpi} 
                                        onChange={handleValorEpiChange} 
                                        onBlur={() => completarDecimais(valorEpi, setValorEpi)}
                                        placeholder="0,00" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="info-message">
                            <DollarSign size={16} />
                            <span>O sistema calculará automaticamente: 13º, Férias, INSS (8%) e FGTS (8% + Multa de 3,2%).</span>
                        </div>
                    </div>

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

            {showGerenciador && (
                <ModalGerenciarFuncoes 
                    onClose={() => {
                        setShowGerenciador(false);
                        carregarFuncoes(); 
                    }} 
                />
            )}
        </>
    );
}