import { FileText, X, Printer } from 'lucide-react';
import type { Orcamento } from '../types';
import './ModalDemonstrativo.css';

interface Props {
    orcamento: Orcamento;
    valorHora: number;
    onClose: () => void;
}

export function ModalDemonstrativo({ orcamento, valorHora, onClose }: Props) {
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const PCT = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

    // Recalcula para exibição
    const pv = Number(orcamento.preco_venda);
    const mat = Number(orcamento.custo_materiais);
    const impPct = Number(orcamento.imposto);
    const lucPct = Number(orcamento.lucro_desejado);
    
    // Obs: Usa o valor da hora atual do sistema.
    const mo = Number(orcamento.horas_trabalhadas) * valorHora;
    
    const valImposto = pv * (impPct / 100);
    const valLucro = pv * (lucPct / 100);
    const valFixo = pv - (mat + mo + valImposto + valLucro);
    
    const fixoPct = (valFixo / pv) * 100;
    const matPct = (mat / pv) * 100;
    const moPct = (mo / pv) * 100;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><FileText size={20} color="#3b82f6"/> Demonstrativo: {orcamento.nome_produto}</h3>
                    <button className="btn-close" onClick={onClose}><X size={24}/></button>
                </div>
                
                <div style={{marginBottom:'15px', fontWeight:'bold', color:'#64748b'}}>Cliente: {orcamento.cliente}</div>

                <table className="tabela-demonstrativo">
                    <thead><tr><th>Descrição</th><th>Valor (R$)</th><th>%</th></tr></thead>
                    <tbody>
                        <tr className="row-venda"><td>Preço de Venda</td><td className="col-valor">{BRL(pv)}</td><td className="col-pct">100%</td></tr>
                        <tr><td>Custo Fixo (Empresa)</td><td className="col-valor">{BRL(valFixo)}</td><td className="col-pct">{PCT(fixoPct)}</td></tr>
                        <tr><td>Imposto</td><td className="col-valor">{BRL(valImposto)}</td><td className="col-pct">{PCT(impPct)}</td></tr>
                        <tr><td>Materiais (Mercadoria)</td><td className="col-valor">{BRL(mat)}</td><td className="col-pct">{PCT(matPct)}</td></tr>
                        <tr><td>Mão de Obra</td><td className="col-valor">{BRL(mo)}</td><td className="col-pct">{PCT(moPct)}</td></tr>
                        <tr className="row-lucro"><td>Lucro Líquido</td><td className="col-valor">{BRL(valLucro)}</td><td className="col-pct">{PCT(lucPct)}</td></tr>
                    </tbody>
                </table>
                <button className="btn-imprimir" onClick={() => window.print()}><Printer size={18}/> Imprimir Demonstrativo</button>
            </div>
        </div>
    );
}