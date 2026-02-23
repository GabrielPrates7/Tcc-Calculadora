import { useState } from 'react'; // Removido useEffect pois não é mais necessário
import { 
    Edit2, Calculator, User, Package, DollarSign, 
    FileText, Save, XCircle, Percent, Info, Briefcase 
} from 'lucide-react';
import type { Orcamento, CenarioMaoObra } from '../types';
import './CalculadoraOrcamento.css';

interface Props {
    listaCenarios: CenarioMaoObra[]; 
    taxaFixa: number;      
    orcamentoEdicao: Orcamento | null;
    onSalvar: (orc: Orcamento) => Promise<boolean>;
    onCancelarEdicao: () => void;
}

export function CalculadoraOrcamento({ listaCenarios, taxaFixa, orcamentoEdicao, onSalvar, onCancelarEdicao }: Props) {
    // ESTADOS (Inputs do Usuário)
    const [cliente, setCliente] = useState(orcamentoEdicao?.cliente || '');
    const [produto, setProduto] = useState(orcamentoEdicao?.nome_produto || ''); 
    const [materiais, setMateriais] = useState(orcamentoEdicao?.custo_materiais || 0); 
    const [tempo, setTempo] = useState(orcamentoEdicao?.horas_trabalhadas || 0); 
    const [lucro, setLucro] = useState(orcamentoEdicao?.lucro_desejado || 30); 
    const [imposto, setImposto] = useState(orcamentoEdicao?.imposto || 5); 

    // --- CORREÇÃO DO ERRO ---
    // Em vez de usar useEffect para setar o primeiro item, usamos "Estado Derivado".
    // 1. Guardamos apenas se o usuário mudou manualmente.
    const [cenarioManual, setCenarioManual] = useState<CenarioMaoObra | null>(null);

    // 2. Calculamos qual usar: O manual OU o primeiro da lista (automático)
    const cenarioEmUso = cenarioManual || (listaCenarios.length > 0 ? listaCenarios[0] : null);

    // Helpers de Formatação
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const PCT = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';

    // --- CÁLCULOS EM TEMPO REAL ---
    
    // Usa o cenário calculado acima (não precisa esperar useEffect)
    const valorHora = cenarioEmUso?.valorUnitario || 0;
    const unidadeTempo = cenarioEmUso?.unidade || 'horas';

    // 1. Custo Mão de Obra
    const custoMaoObra = tempo * valorHora;

    // 2. Custo de Produção (Mercadoria + MO)
    const custoProducao = Number(materiais) + custoMaoObra;

    // 3. Divisor Markup
    const somaPorcentagens = taxaFixa + Number(lucro) + Number(imposto);
    const divisor = 1 - (somaPorcentagens / 100);

    // 4. Preço Final
    const precoFinal = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;

    const handleSalvar = async () => {
        if (!produto) return alert("Por favor, digite o nome do produto.");
        if (divisor <= 0) return alert("A soma das taxas ultrapassa 100%. Impossível calcular.");

        const dados: Orcamento = {
            id: orcamentoEdicao?.id,
            cliente,
            nome_produto: produto,
            custo_materiais: Number(materiais),
            horas_trabalhadas: Number(tempo),
            lucro_desejado: Number(lucro),
            imposto: Number(imposto),
            preco_venda: precoFinal,
        };

        const sucesso = await onSalvar(dados);
        
        if (sucesso && !orcamentoEdicao) {
            setCliente(''); setProduto(''); setMateriais(0); setTempo(0);
        }
    };

    return (
        <div className="card-calculadora">
            <h2>
                {orcamentoEdicao ? <Edit2 size={22} className="text-blue-500"/> : <Calculator size={22} className="text-blue-500"/>} 
                {orcamentoEdicao ? ' Editar Orçamento' : ' Novo Orçamento'}
            </h2>

            {/* --- SELEÇÃO DE CENÁRIO --- */}
            <div className="form-group" style={{background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                <label style={{color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <Briefcase size={16}/> Tabela de Mão de Obra
                </label>
                <div className="input-icon-wrapper">
                    <select 
                        style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white'}}
                        onChange={e => {
                            const id = Number(e.target.value);
                            const selecionado = listaCenarios.find(c => c.id === id);
                            // Atualiza apenas se o usuário escolher
                            setCenarioManual(selecionado || null);
                        }}
                        // O valor do select é o ID do cenário em uso
                        value={cenarioEmUso?.id || 0}
                    >
                        {listaCenarios.length === 0 && <option value={0}>Carregando tabelas...</option>}
                        {listaCenarios.map(cenario => (
                            <option key={cenario.id} value={cenario.id}>
                                {cenario.titulo} ({BRL(cenario.valorUnitario)} / {cenario.unidade})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- IDENTIFICAÇÃO --- */}
            <div className="form-group">
                <label>Cliente</label>
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

            {/* --- CUSTOS DIRETOS --- */}
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
                    <small style={{color:'#64748b', fontSize:'0.75rem'}}>
                        x {BRL(valorHora)} ({unidadeTempo})
                    </small>
                </div>
            </div>

            {/* --- MARGENS --- */}
            <div className="row-inputs">
                <div className="form-group">
                    <label>Lucro Desejado %</label>
                    <div className="input-icon-wrapper">
                        <Percent size={18} className="input-icon"/>
                        <input type="number" value={lucro} onChange={e => setLucro(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Imposto %</label>
                    <div className="input-icon-wrapper">
                        <Percent size={18} className="input-icon"/>
                        <input type="number" value={imposto} onChange={e => setImposto(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            {/* --- RESUMO DOS CUSTOS --- */}
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
                
                {/* DESTAQUE DO CUSTO DE PRODUÇÃO */}
                <div className="custo-linha destaque" style={{borderTop: '2px dashed #cbd5e1', marginTop: '10px', paddingTop: '10px'}}>
                    <span style={{color: '#1e293b'}}>Custo de Produção (Total)</span>
                    <span className="custo-valor" style={{fontSize: '1.1rem'}}>{BRL(custoProducao)}</span>
                </div>
            </div>
            
            {/* --- RESULTADO FINAL --- */}
            <div className="resultado-box">
                <span className="resultado-label">Preço de Venda Sugerido</span>
                <div className="resultado-valor">{BRL(precoFinal)}</div>
                
                {divisor <= 0 && (
                    <div style={{color:'red', fontSize:'0.8rem', marginTop:'5px'}}>
                        ⚠️ Taxas acima de 100%!
                    </div>
                )}
            </div>

            <div style={{display:'flex', gap:'10px'}}>
                <button className="btn-salvar" onClick={handleSalvar}>
                    <Save size={18}/> Salvar Orçamento
                </button>
                {orcamentoEdicao && (
                    <button className="btn-salvar" style={{backgroundColor:'#ef4444'}} onClick={onCancelarEdicao}>
                        <XCircle size={18}/> Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}