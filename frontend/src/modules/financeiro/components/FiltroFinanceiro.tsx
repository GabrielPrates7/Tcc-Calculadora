import { Calendar, Filter, XCircle } from 'lucide-react';
// CORREÇÃO: Importar de ../types para parar o erro do print
import type { StatusFilter } from '../types'; 
import './FiltroFinanceiro.css';

interface Props {
    dataInicio: string;
    setDataInicio: (data: string) => void;
    dataFim: string;
    setDataFim: (data: string) => void;
    status: StatusFilter;
    setStatus: (s: StatusFilter) => void;
    onLimpar: () => void;
}

export function FiltroFinanceiro({ 
    dataInicio, setDataInicio, 
    dataFim, setDataFim, 
    status, setStatus, 
    onLimpar 
}: Props) {
    
    const temFiltroAtivo = dataInicio || dataFim || status !== 'todos';

    return (
        <div className="filtro-container">
            <div className="filtro-header">
                <span className="filtro-titulo">
                    <Filter size={16} /> Filtros
                </span>
                {temFiltroAtivo && (
                    <button className="btn-limpar" onClick={onLimpar}>
                        <XCircle size={14} /> Limpar
                    </button>
                )}
            </div>

            <div className="filtro-controles">
                {/* Grupo Data Inicio */}
                <div className="filtro-grupo">
                    <label>De:</label>
                    <div className="input-box">
                        <Calendar size={14} className="icon-input"/>
                        <input 
                            type="date" 
                            value={dataInicio} 
                            onChange={e => setDataInicio(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grupo Data Fim */}
                <div className="filtro-grupo">
                    <label>Até:</label>
                    <div className="input-box">
                        <Calendar size={14} className="icon-input"/>
                        <input 
                            type="date" 
                            value={dataFim} 
                            onChange={e => setDataFim(e.target.value)}
                        />
                    </div>
                </div>

                {/* Separador */}
                <div className="filtro-divisor"></div>

                {/* Status */}
                <div className="filtro-grupo">
                    <label>Status:</label>
                    <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value as StatusFilter)}
                        className={`select-status ${status}`}
                    >
                        <option value="todos">Todos os Registros</option>
                        <option value="ativos">Apenas Ativos (Cálculo)</option>
                        <option value="pendentes">Pendentes</option>
                        <option value="pagos">Pagos</option>
                    </select>
                </div>
            </div>
        </div>
    );
}