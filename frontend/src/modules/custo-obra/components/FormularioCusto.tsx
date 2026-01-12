// FormularioCusto.tsx
import { Calculator, Clock, Calendar, Users, Briefcase, HardHat } from 'lucide-react';
import type { TipoTempo, TipoOrganizacao, CustoResultado } from '../types';
import './FormularioCusto.css';

interface Props {
    // Valores
    tipoTempo: TipoTempo;
    tipoOrganizacao: TipoOrganizacao;
    tempoInput: number;
    qtdUnidades: number;
    tamanhoGrupo: number;
    resultado: CustoResultado; // Para mostrar na explicação

    // Setters
    setTipoTempo: (v: TipoTempo) => void;
    setTipoOrganizacao: (v: TipoOrganizacao) => void;
    setTempoInput: (v: number) => void;
    setQtdUnidades: (v: number) => void;
    setTamanhoGrupo: (v: number) => void;
    onSalvar: () => void;
}

export function FormularioCusto(props: Props) {
    const { 
        tipoTempo, tipoOrganizacao, tempoInput, qtdUnidades, tamanhoGrupo, resultado,
        setTipoTempo, setTipoOrganizacao, setTempoInput, setQtdUnidades, setTamanhoGrupo, onSalvar 
    } = props;

    const getLabelInputTempo = () => {
        if (tipoTempo === 'dias') return "📅 Dias Trabalhados no Mês";
        return "⏰ Horas TOTAIS Trabalhadas no Mês";
    };

    return (
        <div className="config-grid">
            {/* --- CARD ESQUERDA: INPUTS --- */}
            <div className="card-config">
                <h2><Calculator size={20} style={{ marginRight: '8px' }} /> Configuração</h2>

                {/* 1. MODO DE COBRANÇA */}
                <div className="input-group">
                    <label>Como você cobra o cliente?</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className={`btn-opcao ${tipoTempo === 'horas' ? 'ativo' : ''}`} onClick={() => setTipoTempo('horas')}>
                            <Clock size={16} /> Por Hora
                        </button>
                        <button className={`btn-opcao ${tipoTempo === 'dias' ? 'ativo' : ''}`} onClick={() => setTipoTempo('dias')}>
                            <Calendar size={16} /> Por Dia
                        </button>
                    </div>
                </div>

                {/* 2. MODO DE EQUIPE */}
                <div className="input-group">
                    <label>Quem executa o serviço?</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className={`btn-opcao ${tipoOrganizacao === 'individual' ? 'ativo' : ''}`}
                            onClick={() => { setTipoOrganizacao('individual'); setQtdUnidades(1); }}>
                            <Users size={16} /> Individual
                        </button>
                        <button className={`btn-opcao ${tipoOrganizacao === 'grupo' ? 'ativo' : ''}`}
                            onClick={() => setTipoOrganizacao('grupo')}>
                            <Briefcase size={16} /> Em Grupo
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    
                    {/* Tamanho Grupo */}
                    {tipoOrganizacao === 'grupo' && (
                        <div className="input-group">
                            <label>Tamanho da Equipe (Ex: 2 para Dupla)</label>
                            <input type="number" value={tamanhoGrupo} onChange={e => setTamanhoGrupo(Number(e.target.value))} />
                        </div>
                    )}

                    {/* Qtd Unidades */}
                    <div className="input-group">
                        <label>
                            {tipoOrganizacao === 'individual'
                                ? 'Quantos funcionários trabalham nessa função?'
                                : `Quantas equipes (${tamanhoGrupo} pessoas) existem?`}
                        </label>
                        <input type="number" value={qtdUnidades} onChange={e => setQtdUnidades(Number(e.target.value))} />
                    </div>

                    {/* Tempo */}
                    <div className="input-group">
                        <label>{getLabelInputTempo()}</label>
                        <input
                            type="number"
                            value={tempoInput}
                            onChange={e => setTempoInput(Number(e.target.value))}
                            style={{ border: '2px solid #3b82f6', backgroundColor: '#f0f9ff' }}
                        />
                        <small style={{ color: '#64748b' }}>
                            {tipoTempo === 'horas' ? 'Ex: 176 horas (22 dias x 8h)' : 'Ex: 22 dias úteis'}
                        </small>
                    </div>
                </div>

                <button className="btn-atualizar" onClick={onSalvar}>Recalcular Custo</button>
            </div>

            {/* --- CARD DIREITA: RESUMO / EXPLICAÇÃO --- */}
            <div className="card-config">
                <h2><HardHat size={20} style={{ marginRight: '8px' }} /> Resumo</h2>
                <div className="formula-box">
                    <p>O custo é calculado dividindo o total de despesas da equipe pela capacidade de produção.</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Custo Total Equipe: <strong>R$ {resultado.custoEquipeMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></li>
                        <li>Capacidade Total: <strong>{tempoInput * qtdUnidades} {tipoTempo}</strong></li>
                    </ul>

                    <div className="formula-total">
                        {resultado.custoEquipeMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ÷ ({tempoInput} x {qtdUnidades})
                        <br />
                        = <strong>R$ {resultado.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}