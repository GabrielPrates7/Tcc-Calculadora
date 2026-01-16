import { useState } from 'react'; // REMOVIDO useEffect
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
    // 1. INICIALIZAÇÃO DIRETA (O "Pulo do Gato")
    // Como o componente pai (Orcamentos.tsx) vai usar uma key, 
    // este componente será DESTRUÍDO e RECRIADO quando mudarmos de item.
    // Portanto, podemos iniciar o estado direto com as props.
    const [cliente, setCliente] = useState(orcamentoEdicao?.cliente || '');
    const [produto, setProduto] = useState(orcamentoEdicao?.nome_produto || '');
    const [materiais, setMateriais] = useState(orcamentoEdicao?.custo_materiais || 0);
    const [tempo, setTempo] = useState(orcamentoEdicao?.horas_trabalhadas || 0);
    const [lucro, setLucro] = useState(orcamentoEdicao?.lucro_desejado || 30);
    const [imposto, setImposto] = useState(orcamentoEdicao?.imposto || 5);

    // --- CÁLCULO EM TEMPO REAL ---
    const custoMaoObra = tempo * valorHora;
    const custoProducao = Number(materiais) + custoMaoObra;
    const somaPorcentagens = taxaFixa + Number(lucro) + Number(imposto);
    const divisor = 1 - (somaPorcentagens / 100);
    const precoFinal = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;
    const lucroReal = precoFinal * (Number(lucro) / 100);

    const handleSalvar = async () => {
        if (!produto) return alert("Digite o nome do produto!");
        
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
        
        // Se for NOVO item e salvou com sucesso, limpamos manualmente para o próximo.
        // Se for EDIÇÃO, o pai vai cuidar de mudar o estado.
        if (sucesso && !orcamentoEdicao) {
            setCliente(''); setProduto(''); setMateriais(0); setTempo(0);
        }
    };

    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="card-calculadora">
            <h2>
                {orcamentoEdicao ? <Edit2 size={22} color="var(--cor-primaria)"/> : <Calculator size={22} color="var(--cor-primaria)"/>} 
                {orcamentoEdicao ? ' Editar Orçamento' : ' Novo Orçamento'}
            </h2>
            {/* ... JSX dos inputs (Mantive oculto para economizar espaço, use o mesmo de antes) ... */}
            <div className="form-group"><label>Cliente</label><div className="input-icon-wrapper"><User size={18} className="input-icon"/><input type="text" value={cliente} onChange={e => setCliente(e.target.value)} /></div></div>
            <div className="form-group"><label>Produto</label><div className="input-icon-wrapper"><Package size={18} className="input-icon"/><input type="text" value={produto} onChange={e => setProduto(e.target.value)} /></div></div>
            <div className="row-inputs">
                <div className="form-group"><label>Materiais</label><div className="input-icon-wrapper"><DollarSign size={18} className="input-icon"/><input type="number" value={materiais} onChange={e => setMateriais(Number(e.target.value))} /></div></div>
                <div className="form-group"><label>Tempo</label><div className="input-icon-wrapper"><FileText size={18} className="input-icon"/><input type="number" value={tempo} onChange={e => setTempo(Number(e.target.value))} /></div></div>
            </div>
            
            <div className="resultado-box">
                <span className="resultado-label">Preço Sugerido</span>
                <div className="resultado-valor">{BRL(precoFinal)}</div>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
                <button className="btn-salvar" onClick={handleSalvar}><Save size={18}/> Salvar</button>
                {orcamentoEdicao && <button className="btn-salvar" style={{backgroundColor:'var(--danger)'}} onClick={onCancelarEdicao}><XCircle size={18}/> Cancelar</button>}
            </div>
        </div>
    );
}