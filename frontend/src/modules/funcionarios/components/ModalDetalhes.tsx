import { X, Calculator, Info } from 'lucide-react';
import type { Funcionario } from '../types';
import './ModalDetalhes.css';

interface Props {
    funcionario: Funcionario | null;
    onClose: () => void;
}

// O 'export' aqui é fundamental
export function ModalDetalhes({ funcionario, onClose }: Props) {
    if (!funcionario) return null;

    const BRL = (valor: number) => 
        valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Leitura segura com fallback para 0
    const salario = Number(funcionario.salario_base || 0);
    const epi = Number(funcionario.epi || 0);
    const decimoTerceiro = Number(funcionario.decimo_terceiro || 0);
    const ferias = Number(funcionario.ferias || 0);
    const umTerco = Number(funcionario.um_terco_ferias || 0);
    const inss = Number(funcionario.inss || 0);
    const fgtsMulta = Number(funcionario.multa_fgts || 0);
    const total = Number(funcionario.custo_total_mensal || 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content detalhes-content" onClick={e => e.stopPropagation()}>
                {/* ... (Todo o resto do JSX igual ao anterior) ... */}
                <div className="modal-header detalhes-header">
                    <div className="header-text">
                        <div className="badge-cargo">
                             <Calculator size={16} style={{marginRight: 6}}/> Memória de Cálculo
                        </div>
                        <h2>{funcionario.nome}</h2>
                        <p>{funcionario.funcao} • {funcionario.setor}</p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={24}/></button>
                </div>

                <div className="modal-body">
                    <div className="card-resumo">
                        <div className="resumo-item principal">
                            <span>Custo Total Mensal</span>
                            <strong>{BRL(total)}</strong>
                        </div>
                        <div className="resumo-sub">Valor exato armazenado no banco de dados.</div>
                    </div>

                    <div className="tabela-custos">
                        <div className="tabela-header">
                            <span>Componente</span><span className="col-valor">Valor Calculado</span>
                        </div>
                        <div className="tabela-row"><span className="row-titulo">Salário Base</span><span className="row-valor">{BRL(salario)}</span></div>
                        <div className="tabela-row"><span className="row-titulo">EPI / Vale</span><span className="row-valor">{BRL(epi)}</span></div>
                        <div className="tabela-row"><span className="row-titulo">Provisão 13º</span><span className="row-valor">{BRL(decimoTerceiro)}</span></div>
                        <div className="tabela-row"><span className="row-titulo">Provisão Férias</span><span className="row-valor">{BRL(ferias)}</span></div>
                        <div className="tabela-row"><span className="row-titulo">1/3 Férias</span><span className="row-valor">{BRL(umTerco)}</span></div>
                        <div className="tabela-row destaque-imposto"><span className="row-titulo">INSS Patronal (8%)</span><span className="row-valor">{BRL(inss)}</span></div>
                        <div className="tabela-row destaque-imposto"><span className="row-titulo">Multa FGTS (3,2%)</span><span className="row-valor">{BRL(fgtsMulta)}</span></div>
                    </div>

                    <div className="info-legal">
                        <Info size={16}/>
                        <p><strong>Conferência:</strong> Estes valores são calculados automaticamente pelo sistema (Backend).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}