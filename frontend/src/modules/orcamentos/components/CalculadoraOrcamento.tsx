import { useState } from 'react';
import { 
    Edit2, Calculator, User, Package, DollarSign, 
    FileText, Save, XCircle, Percent, Info, Briefcase, Search, X, ChevronRight 
} from 'lucide-react';
import type { Orcamento, CenarioMaoObra } from '../types';
import { formatarBRL } from '../../../utils/formatters'; 
import './CalculadoraOrcamento.css';

type OrcamentoPayload = Orcamento & { valorHoraSelecionado?: number };

interface Props {
    listaCenarios: CenarioMaoObra[]; 
    taxaFixa: number;      
    orcamentoEdicao: Orcamento | null;
    onSalvar: (orc: OrcamentoPayload) => Promise<boolean>;
    onCancelarEdicao: () => void;
}

export function CalculadoraOrcamento({ listaCenarios, taxaFixa, orcamentoEdicao, onSalvar, onCancelarEdicao }: Props) {
    const [cliente, setCliente] = useState(orcamentoEdicao?.cliente || '');
    const [produto, setProduto] = useState(orcamentoEdicao?.nome_produto || ''); 
    const [materiais, setMateriais] = useState<number | string>(orcamentoEdicao?.custo_materiais || ''); 
    const [tempo, setTempo] = useState<number | string>(orcamentoEdicao?.horas_trabalhadas || ''); 
    const [lucro, setLucro] = useState<number | string>(orcamentoEdicao?.lucro_desejado || 30); 
    const [imposto, setImposto] = useState<number | string>(orcamentoEdicao?.imposto || 5); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buscaCenario, setBuscaCenario] = useState('');
    const [ordemCenario, setOrdemCenario] = useState('az'); 

    const [idCenarioSelecionado, setIdCenarioSelecionado] = useState<number | null>(() => {
        if (orcamentoEdicao?.id_cenario_mo) return orcamentoEdicao.id_cenario_mo;
        if (!orcamentoEdicao || !orcamentoEdicao.preco_venda || !orcamentoEdicao.horas_trabalhadas) return null;

        const PV = Number(orcamentoEdicao.preco_venda);
        const tf = Number(orcamentoEdicao.taxa_fixa_snapshot || taxaFixa);
        const tl = Number(orcamentoEdicao.lucro_desejado || 0);
        const ti = Number(orcamentoEdicao.imposto || 0);
        const mat = Number(orcamentoEdicao.custo_materiais || 0);
        const hrs = Number(orcamentoEdicao.horas_trabalhadas);

        if (hrs === 0) return null;

        const divisor = 1 - ((tf + tl + ti) / 100);
        const custoProducao = PV * divisor;
        const valorHoraEstimado = (custoProducao - mat) / hrs;

        const cenarioEncontrado = listaCenarios.find(c => Math.abs(c.valorUnitario - valorHoraEstimado) <= 0.5);
        return cenarioEncontrado ? cenarioEncontrado.id : null;
    });

    const cenarioAtivo = listaCenarios.find(c => c.id === idCenarioSelecionado) 
                         || (listaCenarios.length > 0 ? listaCenarios[0] : null);

    const cenariosFiltrados = listaCenarios
        .filter(c => c.titulo.toLowerCase().includes(buscaCenario.toLowerCase()))
        .sort((a, b) => {
            if (ordemCenario === 'az') return a.titulo.localeCompare(b.titulo);
            if (ordemCenario === 'za') return b.titulo.localeCompare(a.titulo);
            if (ordemCenario === 'maior') return b.valorUnitario - a.valorUnitario;
            if (ordemCenario === 'menor') return a.valorUnitario - b.valorUnitario;
            return 0;
        });

    const PCT = (v: number) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

    const valorHora = cenarioAtivo?.valorUnitario || 0;
    const unidadeTempo = cenarioAtivo?.unidade || 'horas';
    
    // Condicional de avaliação de métrica
    const isCustoFechado = unidadeTempo === 'total da obra' || unidadeTempo === 'projeto';
    const tempoEfetivo = isCustoFechado ? 1 : (Number(tempo) || 0);

    const custoMaoObra = tempoEfetivo * valorHora;
    const custoProducao = Number(materiais) + custoMaoObra;

    const somaPorcentagens = taxaFixa + Number(lucro) + Number(imposto);
    const divisor = 1 - (somaPorcentagens / 100);

    const precoFinal = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;

    const handleSalvar = async () => {
        if (!produto) return alert("Por favor, digite o nome do produto.");
        if (divisor <= 0) return alert("A soma das taxas ultrapassa 100%. Impossível calcular.");

        const dados: OrcamentoPayload = {
            id: orcamentoEdicao?.id,
            cliente,
            nome_produto: produto,
            custo_materiais: Number(materiais),
            horas_trabalhadas: tempoEfetivo,
            lucro_desejado: Number(lucro),
            imposto: Number(imposto),
            preco_venda: precoFinal,
            valorHoraSelecionado: valorHora,
            id_cenario_mo: cenarioAtivo?.id 
        };

        const sucesso = await onSalvar(dados);
        
        if (sucesso && !orcamentoEdicao) {
            setCliente(''); setProduto(''); setMateriais(''); setTempo(''); setBuscaCenario('');
        }
    };

    const handleSelecionarCenario = (id: number) => {
        setIdCenarioSelecionado(id);
        setIsModalOpen(false); 
        setBuscaCenario(''); 
    };

    return (
        <>
            <div className="card-calculadora">
                <h2>
                    {orcamentoEdicao ? <Edit2 size={24} className="text-blue-500"/> : <Calculator size={24} className="text-blue-500"/>} 
                    {orcamentoEdicao ? ' Editar Orçamento' : ' Novo Orçamento'}
                </h2>

                <div className="secao-cenario">
                    <label>
                        <Briefcase size={18}/> Base de Cálculo: Mão de Obra
                    </label>
                    <button 
                        type="button" 
                        className="btn-abrir-modal-base"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="base-selecionada-info" style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                            <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                {cenarioAtivo ? cenarioAtivo.titulo : 'Nenhuma base disponível'}
                            </strong>
                            <span>
                                {cenarioAtivo 
                                    ? `${formatarBRL(cenarioAtivo.valorUnitario)} ${isCustoFechado ? '(Custo Total da Equipe)' : `/ ${cenarioAtivo.unidade}`}` 
                                    : 'Crie uma base no Módulo de Obras'}
                            </span>
                        </div>
                        <ChevronRight size={20} color="#64748b" style={{ flexShrink: 0 }} />
                    </button>
                </div>

                <div className="form-group">
                    <label>Nome do Cliente (Opcional)</label>
                    <div className="input-icon-wrapper">
                        <User size={18} className="input-icon"/>
                        <input type="text" placeholder="Ex: João da Silva" value={cliente} onChange={e => setCliente(e.target.value)} />
                    </div>
                </div>

                <div className="form-group">
                    <label>Produto / Serviço</label>
                    <div className="input-icon-wrapper">
                        <Package size={18} className="input-icon"/>
                        <input type="text" placeholder="Ex: Guarda-Roupa MDF" value={produto} onChange={e => setProduto(e.target.value)} />
                    </div>
                </div>

                <div className="row-inputs">
                    <div className="form-group">
                        <label>Materiais (R$)</label>
                        <div className="input-icon-wrapper">
                            <DollarSign size={18} className="input-icon"/>
                            <input type="number" min="0" step="0.01" value={materiais} onChange={e => setMateriais(e.target.value)} />
                        </div>
                    </div>
                    
                    {!isCustoFechado && (
                        <div className="form-group">
                            <label>Tempo ({unidadeTempo})</label>
                            <div className="input-icon-wrapper">
                                <FileText size={18} className="input-icon"/>
                                <input type="number" min="0" step="0.5" value={tempo} onChange={e => setTempo(e.target.value)} />
                            </div>
                            <small style={{color:'#64748b', fontSize:'0.75rem', marginTop: '4px', display: 'block'}}>
                                Custo Base: {formatarBRL(valorHora)} / {unidadeTempo}
                            </small>
                        </div>
                    )}
                </div>

                <div className="row-inputs">
                    <div className="form-group">
                        <label>Lucro Desejado (%)</label>
                        <div className="input-icon-wrapper">
                            <Percent size={18} className="input-icon"/>
                            <input type="number" value={lucro} onChange={e => setLucro(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Impostos Gerais (%)</label>
                        <div className="input-icon-wrapper">
                            <Percent size={18} className="input-icon"/>
                            <input type="number" value={imposto} onChange={e => setImposto(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="custos-breakdown">
                    <div className="custo-linha">
                        <span><Info size={14} style={{verticalAlign:'middle'}}/> Custo Fixo (Automático)</span>
                        <span className="custo-valor">{PCT(taxaFixa)}</span>
                    </div>
                    <div className="custo-linha">
                        <span>Mão de Obra {isCustoFechado ? '(Custo Total da Equipe)' : `(${tempoEfetivo} ${unidadeTempo})`}</span>
                        <span className="custo-valor">{formatarBRL(custoMaoObra)}</span>
                    </div>
                    <div className="custo-linha">
                        <span>Materiais</span>
                        <span className="custo-valor">{formatarBRL(Number(materiais) || 0)}</span>
                    </div>
                    
                    <div className="custo-linha destaque">
                        <span>Custo de Produção (Total)</span>
                        <span className="custo-valor">{formatarBRL(custoProducao)}</span>
                    </div>
                </div>
                
                <div className="resultado-box">
                    <span className="resultado-label">Preço de Venda Sugerido</span>
                    <div className="resultado-valor">{formatarBRL(precoFinal)}</div>
                    
                    {divisor <= 0 && (
                        <div style={{color:'#ef4444', fontSize:'0.85rem', marginTop:'10px', fontWeight: 'bold'}}>
                            ⚠️ Atenção: Suas taxas somam mais de 100%!
                        </div>
                    )}
                </div>

                <div style={{display:'flex', gap:'15px'}}>
                    <button className="btn-salvar" onClick={handleSalvar} disabled={!cenarioAtivo}>
                        <Save size={20}/> {orcamentoEdicao ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                    </button>
                    {orcamentoEdicao && (
                        <button className="btn-salvar" style={{backgroundColor:'#ef4444'}} onClick={onCancelarEdicao}>
                            <XCircle size={20}/> Cancelar
                        </button>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-base-overlay">
                    <div className="modal-base-content">
                        
                        <div className="modal-base-header">
                            <h3>Escolher Base de Cálculo</h3>
                            <button className="btn-close-base" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-base-filtros">
                            <div className="base-search">
                                <Search size={16} color="#64748b" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nome..." 
                                    value={buscaCenario}
                                    onChange={e => setBuscaCenario(e.target.value)}
                                />
                            </div>
                            <select 
                                className="base-sort"
                                value={ordemCenario}
                                onChange={e => setOrdemCenario(e.target.value)}
                            >
                                <option value="az">A-Z</option>
                                <option value="za">Z-A</option>
                                <option value="maior">Maior Preço</option>
                                <option value="menor">Menor Preço</option>
                            </select>
                        </div>

                        <div className="modal-base-lista">
                            {cenariosFiltrados.length === 0 ? (
                                <p className="base-vazia">Nenhuma base encontrada.</p>
                            ) : (
                                cenariosFiltrados.map(cenario => (
                                    <div 
                                        key={cenario.id} 
                                        className={`base-item ${cenario.id === idCenarioSelecionado ? 'selecionado' : ''}`}
                                        onClick={() => handleSelecionarCenario(cenario.id)}
                                    >
                                        <div className="base-item-info" style={{ flex: 1, minWidth: 0, paddingRight: '15px' }}>
                                            <h4 
                                                style={{ 
                                                    margin: '0 0 4px 0', 
                                                    color: '#0f172a', 
                                                    fontSize: '1rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                                title={cenario.titulo}
                                            >
                                                {cenario.titulo}
                                            </h4>
                                            
                                            {isCustoFechado ? (
                                                <span style={{ 
                                                    display: 'inline-block', 
                                                    backgroundColor: '#f1f5f9', 
                                                    color: '#475569', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 600, 
                                                    marginTop: '4px' 
                                                }}>
                                                    Custo Total de Mão de Obra
                                                </span>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                    Métrica: por {cenario.unidade}
                                                </span>
                                            )}
                                        </div>
                                        <div className="base-item-valor" style={{ whiteSpace: 'nowrap' }}>
                                            {formatarBRL(cenario.valorUnitario)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}