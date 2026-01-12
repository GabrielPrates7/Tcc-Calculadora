import { useState } from 'react';
import { Edit2, Calculator, User, Package, DollarSign, FileText, Hammer, Building2, TrendingUp, Percent, Save, XCircle } from 'lucide-react';
import type { Orcamento } from '../types';
import './CalculadoraOrcamento.css';

interface Props {
    valorHora: number;
    taxaFixa: number;
    orcamentoEdicao: Orcamento | null;
    onSalvar: (orc: Orcamento) => Promise<boolean>;
    onCancelarEdicao: () => void;
}

export function CalculadoraOrcamento({ valorHora, taxaFixa, orcamentoEdicao, onSalvar, onCancelarEdicao }: Props) {
    // 1. INICIALIZAÇÃO DIRETA
    // Como vamos usar a "key" no componente pai, toda vez que mudarmos de orçamento,
    // este componente será recriado do zero, pegando os valores corretos aqui.
    const [cliente, setCliente] = useState(orcamentoEdicao?.cliente || '');
    const [produto, setProduto] = useState(orcamentoEdicao?.nome_produto || '');
    const [materiais, setMateriais] = useState(orcamentoEdicao?.custo_materiais || 0);
    const [tempo, setTempo] = useState(orcamentoEdicao?.horas_trabalhadas || 0);
    const [lucro, setLucro] = useState(orcamentoEdicao?.lucro_desejado || 30);
    const [imposto, setImposto] = useState(orcamentoEdicao?.imposto || 5);

    // Função simples para limpar, usada apenas ao salvar um NOVO item com sucesso
    const resetarFormulario = () => {
        setCliente(''); 
        setProduto(''); 
        setMateriais(0); 
        setTempo(0); 
        setLucro(30); 
        setImposto(5);
    };

    // --- CÁLCULO EM TEMPO REAL ---
    const custoMaoObra = tempo * valorHora;
    const custoProducao = Number(materiais) + custoMaoObra;
    const somaPorcentagens = taxaFixa + Number(lucro) + Number(imposto);
    const divisor = 1 - (somaPorcentagens / 100);
    const precoFinal = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;
    const lucroReal = precoFinal * (Number(lucro) / 100);

    const handleSalvar = async () => {
        if (!produto) return alert("Digite o nome do produto!");
        if (precoFinal <= 0) return alert("Preço zerado.");

        const dados: Orcamento = {
            id: orcamentoEdicao?.id,
            cliente,
            nome_produto: produto,
            custo_materiais: Number(materiais),
            horas_trabalhadas: Number(tempo),
            lucro_desejado: Number(lucro),
            imposto: Number(imposto),
            preco_venda: precoFinal
        };

        const sucesso = await onSalvar(dados);
        
        // Se salvou um NOVO (não edição) e deu certo, limpamos a tela para o próximo.
        // Se era edição, o Pai vai mudar o estado, desmontar esse componente e montar um novo, limpando automaticamente.
        if (sucesso && !orcamentoEdicao) {
            resetarFormulario();
        }
    };

    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="card-calculadora">
            <h2>
                {orcamentoEdicao ? <Edit2 size={22} color="#f97316"/> : <Calculator size={22} color="#f97316"/>} 
                {orcamentoEdicao ? ' Editar Orçamento' : ' Novo Orçamento'}
            </h2>

            <div className="form-group">
                <label>Cliente</label>
                <div className="input-icon-wrapper">
                    <User size={18} className="input-icon"/>
                    <input type="text" placeholder="Ex: João da Silva" value={cliente} onChange={e => setCliente(e.target.value)} />
                </div>
            </div>

            <div className="form-group">
                <label>Produto</label>
                <div className="input-icon-wrapper">
                    <Package size={18} className="input-icon"/>
                    <input type="text" placeholder="Ex: Mesa de Jantar" value={produto} onChange={e => setProduto(e.target.value)} />
                </div>
            </div>

            <div className="row-inputs">
                <div className="form-group">
                    <label>Materiais (R$)</label>
                    <div className="input-icon-wrapper">
                        <DollarSign size={18} className="input-icon"/>
                        <input type="number" placeholder="0.00" value={materiais} onChange={e => setMateriais(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Tempo (Horas)</label>
                    <div className="input-icon-wrapper">
                        <FileText size={18} className="input-icon"/>
                        <input type="number" placeholder="0" value={tempo} onChange={e => setTempo(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="custos-breakdown">
                <div className="custo-linha"><span><Package size={14}/> Materiais:</span><span className="custo-valor">{BRL(materiais)}</span></div>
                <div className="custo-linha"><span><Hammer size={14}/> Mão de Obra ({tempo}h):</span><span className="custo-valor">{BRL(custoMaoObra)}</span></div>
                <div className="custo-linha destaque"><span>Total Produção:</span><span className="custo-valor">{BRL(custoProducao)}</span></div>
            </div>

            <div className="row-inputs" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Custo Fixo (%)</label>
                    <div className="input-icon-wrapper">
                        <Building2 size={16} className="input-icon" style={{color:'#f97316'}}/>
                        <input type="number" value={taxaFixa.toFixed(2)} disabled style={{backgroundColor:'#f1f5f9', color:'#64748b', fontWeight:'bold'}} />
                    </div>
                </div>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Lucro (%)</label>
                    <div className="input-icon-wrapper">
                        <TrendingUp size={16} className="input-icon"/>
                        <input type="number" value={lucro} onChange={e => setLucro(Number(e.target.value))} />
                    </div>
                </div>
                <div className="form-group">
                    <label style={{fontSize:'0.8rem'}}>Imposto (%)</label>
                    <div className="input-icon-wrapper">
                        <Percent size={16} className="input-icon"/>
                        <input type="number" value={imposto} onChange={e => setImposto(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="resultado-box">
                <span className="resultado-label">Preço Sugerido</span>
                <div className="resultado-valor">{BRL(precoFinal)}</div>
                <span className="resultado-lucro">Lucro Líq: {BRL(lucroReal)}</span>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
                <button className="btn-salvar" onClick={handleSalvar}>
                    <Save size={18} /> {orcamentoEdicao ? 'Salvar Alterações' : 'Salvar Orçamento'}
                </button>
                {orcamentoEdicao && (
                    <button className="btn-salvar" style={{backgroundColor:'#ef4444'}} onClick={onCancelarEdicao}>
                        <XCircle size={18} /> Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}