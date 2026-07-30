import { useState, useMemo } from 'react';
import { Briefcase, ChevronRight, Search, Calendar, X } from 'lucide-react';
import type { ICenarioMaoObra } from '../types';
import { formatarBRL } from '../../../utils/formatters';
import './CustoObraOrcamentos.css';

interface Props {
    listaCenarios: ICenarioMaoObra[];
    cenarioAtivo: ICenarioMaoObra | null | undefined;
    idCenarioSelecionado: number | null;
    onSelecionarCenario: (id: number) => void;
    rotuloMetrica: string;
}

const formatarDataBR = (isoDate?: string): string => {
    if (!isoDate) return '';
    return isoDate.split('-').reverse().join('/');
};

// Converte formatos DD/MM/YYYY, YYYY-MM-DD ou ISO para YYYY-MM-DD sem regex (zero lint errors)
const normalizarDataParaComparacao = (val?: string): string => {
    if (!val) return '';
    if (val.charAt(2) === '/') {
        const partes = val.split('/');
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return val.slice(0, 10);
};

export function CustoObraOrcamentos({
    listaCenarios = [],
    cenarioAtivo,
    idCenarioSelecionado,
    onSelecionarCenario,
    rotuloMetrica
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buscaCenario, setBuscaCenario] = useState('');
    const [ordemCenario, setOrdemCenario] = useState('az');
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');

    const cenariosFiltrados = useMemo(() => {
        const listaSegura = Array.isArray(listaCenarios) ? listaCenarios : [];

        return listaSegura
            .filter(c => {
                const titulo = c?.titulo || '';
                const matchNome = titulo.toLowerCase().includes(buscaCenario.toLowerCase());
                const dataNormalizada = normalizarDataParaComparacao(c?.dataCriacao);

                const matchInicio = !dataInicio || (dataNormalizada && dataNormalizada >= dataInicio);
                const matchFim = !dataFim || (dataNormalizada && dataNormalizada <= dataFim);

                return matchNome && matchInicio && matchFim;
            })
            .sort((a, b) => {
                const tituloA = a?.titulo || '';
                const tituloB = b?.titulo || '';
                const valorA = Number(a?.valorUnitario) || 0;
                const valorB = Number(b?.valorUnitario) || 0;

                if (ordemCenario === 'az') return tituloA.localeCompare(tituloB);
                if (ordemCenario === 'za') return tituloB.localeCompare(tituloA);
                if (ordemCenario === 'maior') return valorB - valorA;
                if (ordemCenario === 'menor') return valorA - valorB;
                return 0;
            });
    }, [listaCenarios, buscaCenario, dataInicio, dataFim, ordemCenario]);

    const handleSelecionar = (id: number) => {
        onSelecionarCenario(id);
        setIsModalOpen(false);
        setBuscaCenario('');
    };

    const handleLimparPeriodo = () => {
        setDataInicio('');
        setDataFim('');
    };

    const isPeriodoAtivo = Boolean(dataInicio || dataFim);

    return (
        <>
            <div className="secao-cenario">
                <label>
                    <Briefcase size={18} /> Base de Cálculo: Mão de Obra
                </label>
                <button
                    type="button"
                    className="btn-abrir-modal-base"
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="base-selecionada-info" style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                        <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {cenarioAtivo?.titulo || 'Nenhuma base disponível'}
                        </strong>
                        <span>
                            {cenarioAtivo
                                ? `${formatarBRL(Number(cenarioAtivo.valorUnitario) || 0)} (Custo de Mão de Obra ${rotuloMetrica})`
                                : 'Crie uma base no Módulo de Obras'}
                        </span>
                    </div>
                    <ChevronRight size={20} color="#64748b" style={{ flexShrink: 0 }} />
                </button>
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

                        <div className="modal-base-filtros" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div className="base-search" style={{ flex: 1, minWidth: '160px' }}>
                                <Search size={16} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome..."
                                    value={buscaCenario}
                                    onChange={e => setBuscaCenario(e.target.value)}
                                />
                            </div>

                            <div className="base-date-filter" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '0 8px',
                                height: '38px',
                                flexWrap: 'nowrap'
                            }}>
                                <Calendar size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={e => setDataInicio(e.target.value)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '0.8rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                    title="Data inicial do período"
                                />
                                <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>a</span>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={e => setDataFim(e.target.value)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '0.8rem',
                                        color: '#0f172a',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                    title="Data final do período"
                                />
                                {isPeriodoAtivo && (
                                    <button
                                        type="button"
                                        onClick={handleLimparPeriodo}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#94a3b8'
                                        }}
                                        title="Limpar filtro de período (Ver todas as datas)"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <select
                                className="base-sort"
                                value={ordemCenario}
                                onChange={e => setOrdemCenario(e.target.value)}
                                style={{ height: '38px' }}
                            >
                                <option value="az">A-Z</option>
                                <option value="za">Z-A</option>
                                <option value="maior">Maior Preço</option>
                                <option value="menor">Menor Preço</option>
                            </select>
                        </div>

                        <div className="modal-base-lista">
                            {cenariosFiltrados.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                                    <p className="base-vazia">
                                        Nenhuma base encontrada {isPeriodoAtivo ? `no período selecionado (${formatarDataBR(dataInicio) || 'início'} até ${formatarDataBR(dataFim) || 'hoje'})` : ''}.
                                    </p>
                                    {isPeriodoAtivo && (
                                        <button
                                            type="button"
                                            onClick={handleLimparPeriodo}
                                            style={{
                                                marginTop: '10px',
                                                padding: '6px 14px',
                                                background: '#f1f5f9',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: '#334155',
                                                fontWeight: 600,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Ver todas as datas cadastradas
                                        </button>
                                    )}
                                </div>
                            ) : (
                                cenariosFiltrados.map(cenario => (
                                    <div
                                        key={cenario.id}
                                        className={`base-item ${cenario.id === idCenarioSelecionado ? 'selecionado' : ''}`}
                                        onClick={() => handleSelecionar(cenario.id)}
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

                                            <span style={{
                                                display: 'inline-block',
                                                backgroundColor: cenario.tipoTempo === 'dias' ? '#fef3c7' : '#e0f2fe',
                                                color: cenario.tipoTempo === 'dias' ? '#92400e' : '#0369a1',
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                marginTop: '4px',
                                                border: `1px solid ${cenario.tipoTempo === 'dias' ? '#fde68a' : '#bae6fd'}`
                                            }}>
                                                {cenario.tipoTempo === 'dias'
                                                    ? 'Custo de Mão de Obra em Dias'
                                                    : 'Custo de Mão de Obra em Horas'}
                                            </span>
                                        </div>
                                        <div className="base-item-valor" style={{ whiteSpace: 'nowrap' }}>
                                            {formatarBRL(Number(cenario.valorUnitario) || 0)}
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