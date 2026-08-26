import type { CSSProperties } from 'react';
import { X, Calculator, Info } from 'lucide-react';
import type { Funcionario } from '../types';
import './ModalDetalhes.css'; 

interface Props {
    funcionario: Funcionario;
    onClose: () => void;
}

export function ModalDetalhes({ funcionario, onClose }: Props) {
    const salario = Number(funcionario.salario_base) || 0;
    const valorEpi = Number(funcionario.valor_epi) || 0;
    const valorBeneficio = Number(funcionario.valor_beneficio) || 0;

    // Valores já persistidos e calculados pelo backend (calcularEncargos em
    // funcionario.service.ts), os mesmos gravados no cadastro/edição do
    // colaborador — não recalculados aqui para não divergir do banco.
    const decimoTerceiro = Number(funcionario.decimo_terceiro) || 0;
    const ferias = Number(funcionario.ferias) || 0;
    const umTercoFerias = Number(funcionario.um_terco_ferias) || 0;
    const inss = Number(funcionario.inss) || 0;
    const multaFgts = Number(funcionario.multa_fgts) || 0;

    const formatarBRL = (valor: number) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
    };

    const tituloSecao: CSSProperties = {
        padding: '14px 20px 4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    const Linha = ({ label, valor, destaque, semBorda }: { label: string; valor: number; destaque?: boolean; semBorda?: boolean }) => (
        <div style={{ padding: '10px 20px', borderBottom: semBorda ? 'none' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#334155', fontWeight: 500 }}>{label}</span>
            <span style={{ color: '#0f172a', fontWeight: 'bold', fontFamily: 'monospace', fontSize: destaque ? '1.15rem' : '1rem' }}>{formatarBRL(valor)}</span>
        </div>
    );

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

                    {/* Correção CSS: overflow setado para visible para impedir cortes */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'visible' }}>

                        {/* Bloco 1: Base */}
                        <div style={tituloSecao}>Base</div>
                        <Linha label="Salário Base" valor={salario} destaque semBorda />

                        <div style={{ borderTop: '1px solid #e2e8f0' }} />

                        {/* Bloco 2: Adicionais */}
                        <div style={tituloSecao}>Adicionais</div>
                        <Linha label="EPI" valor={valorEpi} />
                        <Linha label="Benefício / Vale Alimentação" valor={valorBeneficio} semBorda />
                        <p style={{ margin: 0, padding: '0 20px 14px', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Não entram na base de cálculo dos encargos abaixo.
                        </p>

                        <div style={{ borderTop: '1px solid #e2e8f0' }} />

                        {/* Bloco 3: Encargos sobre o Salário Base */}
                        <div style={tituloSecao}>Encargos sobre o Salário Base</div>
                        <p style={{ margin: 0, padding: '0 20px 8px', color: '#94a3b8', fontSize: '0.8rem' }}>
                            Base de cálculo: Salário Base ({formatarBRL(salario)})
                        </p>
                        <Linha label="Provisão 13º" valor={decimoTerceiro} />
                        <Linha label="Provisão Férias" valor={ferias} />
                        <Linha label="1/3 Férias" valor={umTercoFerias} />
                        <Linha label="INSS (8%)" valor={inss} />
                        <Linha label="Multa FGTS (Provisão 40%)" valor={multaFgts} semBorda />

                        {/* Linha final destacada: Custo Total Mensal */}
                        <div style={{ background: '#334155', borderRadius: '0 0 7px 7px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #22c55e' }}>
                            <div>
                                <div style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>Custo Total Mensal</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Valor exato armazenado no banco de dados.</div>
                            </div>
                            <div style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {formatarBRL(Number(funcionario.custo_total_mensal) || 0)}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px', display: 'flex', gap: '8px', color: '#64748b', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                        <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ margin: 0 }}>
                            <strong>Conferência:</strong> Valores gravados no cadastro deste colaborador, calculados a partir do Salário Base ({formatarBRL(salario)}). O FGTS de 8% mensal não compõe a precificação nesta visão.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}