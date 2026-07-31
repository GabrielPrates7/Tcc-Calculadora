import { useState, useMemo } from 'react';
import { Briefcase, ChevronRight, Search, X } from 'lucide-react';
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
    const [ordemCenario, setOrdemCenario] = useState('recente');
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
                const idA = Number(a?.id) || 0;
                const idB = Number(b?.id) || 0;
                const tituloA = a?.titulo || '';
                const tituloB = b?.titulo || '';
                const valorA = Number(a?.valorUnitario) || 0;
                const valorB = Number(b?.valorUnitario) || 0;

                if (ordemCenario === 'recente') return idB - idA;
                if (ordemCenario === 'antigo') return idA - idB;
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
                    <ChevronRight size={20} color="#94a3b8" style={{ flexShrink: 0 }} />
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-base-overlay">
                    <div className="modal-base-content">
                        <div className="modal-base-header">
                            <h3>Escolher Base de Cálculo</h3>
                            <button className="btn-close-base" onClick={() => setIsModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-base-filtros">
                            <div className="base-search">
                                <Search size={16} color="#64748b" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome da obra ou cliente..."
                                    value={buscaCenario}
                                    onChange={e => setBuscaCenario(e.target.value)}
                                />
                            </div>

                            <div className="filter-row-secondary">
                                <div className="date-range-clean">
                                    <div className="date-input-group">
                                        <span className="date-label">DE</span>
                                        <input
                                            type="date"
                                            className="input-date-clean"
                                            value={dataInicio}
                                            onChange={e => setDataInicio(e.target.value)}
                                            title="Data inicial do período"
                                        />
                                    </div>

                                    <span className="date-divisor">|</span>

                                    <div className="date-input-group">
                                        <span className="date-label">ATÉ</span>
                                        <input
                                            type="date"
                                            className="input-date-clean"
                                            value={dataFim}
                                            onChange={e => setDataFim(e.target.value)}
                                            title="Data final do período"
                                        />
                                    </div>

                                    {isPeriodoAtivo && (
                                        <button
                                            type="button"
                                            className="btn-clear-date"
                                            onClick={handleLimparPeriodo}
                                            title="Limpar filtro de período"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>

                                <select
                                    className="base-sort"
                                    value={ordemCenario}
                                    onChange={e => setOrdemCenario(e.target.value)}
                                >
                                    <option value="recente">Mais Recentes</option>
                                    <option value="antigo">Mais Antigas</option>
                                    <option value="az">A-Z</option>
                                    <option value="za">Z-A</option>
                                    <option value="maior">Maior Preço</option>
                                    <option value="menor">Menor Preço</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-base-lista">
                            {cenariosFiltrados.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                                    <p className="base-vazia">
                                        Nenhuma base encontrada {isPeriodoAtivo ? `no período (${formatarDataBR(dataInicio) || 'início'} até ${formatarDataBR(dataFim) || 'hoje'})` : ''}.
                                    </p>
                                    {isPeriodoAtivo && (
                                        <button
                                            type="button"
                                            onClick={handleLimparPeriodo}
                                            style={{
                                                marginTop: '10px',
                                                padding: '6px 14px',
                                                background: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: '#f8fafc',
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
                                                    margin: '0 0 6px 0',
                                                    color: '#f97316',
                                                    fontSize: '1.05rem',
                                                    fontWeight: '700',
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
                                                backgroundColor: cenario.tipoTempo === 'dias'
                                                    ? 'rgba(249, 115, 22, 0.15)'
                                                    : 'rgba(56, 189, 248, 0.15)',
                                                color: cenario.tipoTempo === 'dias'
                                                    ? '#fdba74'
                                                    : '#7dd3fc',
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                marginTop: '4px',
                                                border: `1px solid ${
                                                    cenario.tipoTempo === 'dias'
                                                        ? 'rgba(249, 115, 22, 0.35)'
                                                        : 'rgba(56, 189, 248, 0.35)'
                                                }`
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