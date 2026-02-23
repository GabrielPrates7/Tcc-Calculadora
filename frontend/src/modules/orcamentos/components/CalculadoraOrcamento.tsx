import { useState } from 'react';
import { 
    Edit2, Calculator, User, Package, DollarSign, 
    FileText, Save, XCircle, Percent, Info, Briefcase 
} from 'lucide-react';
import type { Orcamento, CenarioMaoObra } from '../types';
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
    const [materiais, setMateriais] = useState(orcamentoEdicao?.custo_materiais || 0); 
    const [tempo, setTempo] = useState(orcamentoEdicao?.horas_trabalhadas || 0); 
    const [lucro, setLucro] = useState(orcamentoEdicao?.lucro_desejado || 30); 
    const [imposto, setImposto] = useState(orcamentoEdicao?.imposto || 5); 

    const [idCenarioSelecionado, setIdCenarioSelecionado] = useState<number | null>(null);

    const cenarioAtivo = listaCenarios.find(c => c.id === idCenarioSelecionado) 
                         || (listaCenarios.length > 0 ? listaCenarios[0] : null);

    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const PCT = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';

    const valorHora = cenarioAtivo?.valorUnitario || 0;
    const unidadeTempo = cenarioAtivo?.unidade || 'horas';

    const custoMaoObra = tempo * valorHora;
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
            horas_trabalhadas: Number(tempo),
            lucro_desejado: Number(lucro),
            imposto: Number(imposto),
            preco_venda: precoFinal,
            valorHoraSelecionado: valorHora 
        };

        const sucesso = await onSalvar(dados);
        
        if (sucesso && !orcamentoEdicao) {
            setCliente(''); setProduto(''); setMateriais(0); setTempo(0);
        }
    };

    return (
        <div className="card-calculadora">
            <h2>
                {orcamentoEdicao ? <Edit2 size={24} className="text-blue-500"/> : <Calculator size={24} className="text-blue-500"/>} 
                {orcamentoEdicao ? ' Editar Orçamento' : ' Novo Orçamento'}
            </h2>

            {/* --- SELEÇÃO DE CENÁRIO REESTILIZADA --- */}
            <div className="secao-cenario">
                <label>
                    <Briefcase size={18}/> Base de Cálculo: Mão de Obra
                </label>
                <div className="input-icon-wrapper">
                    <Briefcase size={18} className="input-icon"/>
                    <select 
                        className="select-custom"
                        onChange={e => setIdCenarioSelecionado(Number(e.target.value))}
                        value={cenarioAtivo?.id || ''}
                    >
                        {listaCenarios.length === 0 && <option value="">Carregando tabelas...</option>}
                        {listaCenarios.map(cenario => (
                            <option key={cenario.id} value={cenario.id}>
                                {cenario.titulo} ({BRL(cenario.valorUnitario)} / {cenario.unidade})
                            </option>
                        ))}
                    </select>
                </div>
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
                        <input type="number" min="0" step="0.01" value={materiais} onChange={e => setMateriais(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Tempo ({unidadeTempo})</label>
                    <div className="input-icon-wrapper">
                        <FileText size={18} className="input-icon"/>
                        <input type="number" min="0" step="0.5" value={tempo} onChange={e => setTempo(Number(e.target.value))} />
                    </div>
                    <small style={{color:'#64748b', fontSize:'0.75rem', marginTop: '4px', display: 'block'}}>
                        Custo Base: {BRL(valorHora)} / {unidadeTempo}
                    </small>
                </div>
            </div>

            <div className="row-inputs">
                <div className="form-group">
                    <label>Lucro Desejado (%)</label>
                    <div className="input-icon-wrapper">
                        <Percent size={18} className="input-icon"/>
                        <input type="number" value={lucro} onChange={e => setLucro(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Impostos Gerais (%)</label>
                    <div className="input-icon-wrapper">
                        <Percent size={18} className="input-icon"/>
                        <input type="number" value={imposto} onChange={e => setImposto(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="custos-breakdown">
                <div className="custo-linha">
                    <span><Info size={14} style={{verticalAlign:'middle'}}/> Custo Fixo (Automático)</span>
                    <span className="custo-valor">{PCT(taxaFixa)}</span>
                </div>
                <div className="custo-linha">
                    <span>Mão de Obra ({tempo} {unidadeTempo})</span>
                    <span className="custo-valor">{BRL(custoMaoObra)}</span>
                </div>
                <div className="custo-linha">
                    <span>Materiais</span>
                    <span className="custo-valor">{BRL(Number(materiais))}</span>
                </div>
                
                <div className="custo-linha destaque">
                    <span>Custo de Produção (Total)</span>
                    <span className="custo-valor">{BRL(custoProducao)}</span>
                </div>
            </div>
            
            <div className="resultado-box">
                <span className="resultado-label">Preço de Venda Sugerido</span>
                <div className="resultado-valor">{BRL(precoFinal)}</div>
                
                {divisor <= 0 && (
                    <div style={{color:'#ef4444', fontSize:'0.85rem', marginTop:'10px', fontWeight: 'bold'}}>
                        ⚠️ Atenção: Suas taxas somam mais de 100%!
                    </div>
                )}
            </div>

            <div style={{display:'flex', gap:'15px'}}>
                <button className="btn-salvar" onClick={handleSalvar}>
                    <Save size={20}/> {orcamentoEdicao ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                </button>
                {orcamentoEdicao && (
                    <button className="btn-salvar" style={{backgroundColor:'#ef4444'}} onClick={onCancelarEdicao}>
                        <XCircle size={20}/> Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}