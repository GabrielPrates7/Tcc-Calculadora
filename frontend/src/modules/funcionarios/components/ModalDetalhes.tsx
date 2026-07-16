import { X, Calculator, Info } from 'lucide-react';
import type { Funcionario } from '../types';
import './ModalDetalhes.css'; 

interface Props {
    funcionario: Funcionario;
    onClose: () => void;
}

export function ModalDetalhes({ funcionario, onClose }: Props) {
    const salario = Number(funcionario.salario_base) || 0;
    const epi = Number(funcionario.epi) || 0;

    const decimoTerceiro = salario / 12;
    const ferias = salario / 12;
    const umTercoFerias = ferias / 3;
    const inss = salario * 0.08;
    const multaFgts = salario * 0.032;

    const formatarBRL = (valor: number) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <div className="header-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <Calculator size={14} />
                                Memória de Cálculo
                            </span>
                        </div>
                        <h2>{funcionario.nome}</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                            {funcionario.funcao} • {funcionario.setor}
                        </p>
                    </div>
                    <button className="btn-close" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '24px' }}>
                    
                    <div style={{ background: '#334155', borderRadius: '8px', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #22c55e' }}>
                        <div>
                            <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '500', marginBottom: '4px' }}>Custo Total Mensal</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Valor exato armazenado no banco de dados.</div>
                        </div>
                        <div style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: 'bold' }}>
                            {formatarBRL(Number(funcionario.custo_total_mensal) || 0)}
                        </div>
                    </div>

                    {/* Correção CSS: overflow setado para visible para impedir cortes */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'visible', paddingBottom: '4px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Componente</th>
                                    <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' }}>Valor Calculado</th>
                                </tr>
                            </thead>
                            <tbody style={{ display: 'table-row-group' }}>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>Salário Base</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(salario)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>EPI / Vale</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(epi)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>Provisão 13º</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(decimoTerceiro)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>Provisão Férias</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(ferias)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>1/3 Férias</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(umTercoFerias)}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>INSS (8%)</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(inss)}</td>
                                </tr>
                                <tr style={{ display: 'table-row' }}>
                                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>Multa FGTS (Provisão 40%)</td>
                                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold', textAlign: 'right', fontFamily: 'monospace', fontSize: '1rem' }}>{formatarBRL(multaFgts)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px', display: 'flex', gap: '8px', color: '#64748b', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                        <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ margin: 0 }}>
                            <strong>Conferência:</strong> Valores calculados a partir do Salário Base ({formatarBRL(salario)}). O FGTS de 8% mensal não compõe a precificação nesta visão.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}