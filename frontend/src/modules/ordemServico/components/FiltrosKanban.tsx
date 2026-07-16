import { Search, Filter } from 'lucide-react';

interface Props {
    busca: string;
    setBusca: (valor: string) => void;
    filtroStatus: string;
    setFiltroStatus: (valor: string) => void;
    filtroFinanceiro: string;
    setFiltroFinanceiro: (valor: string) => void;
    mostrarAtrasados: boolean;
    setMostrarAtrasados: (valor: boolean) => void;
}

export function FiltrosKanban({
    busca, setBusca,
    filtroStatus, setFiltroStatus,
    filtroFinanceiro, setFiltroFinanceiro,
    mostrarAtrasados, setMostrarAtrasados
}: Props) {
    return (
        <div className="kanban-toolbar">
            <div className="search-box">
                <Search size={18} color="#64748b" />
                <input 
                    type="text" 
                    placeholder="Buscar cliente, produto ou #ID..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>
            
            <div className="filtros-box">
                <Filter size={18} color="#64748b" />
                
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                    <option value="todos">Visão Geral (Kanban)</option>
                    <option value="fila">1. Fila de Espera</option>
                    <option value="producao">2. Em Produção</option>
                    <option value="pausado">3. Pausados / Faltam Peças</option>
                    <option value="pronto">4. Prontos</option>
                    <option value="entregue">5. Entregues</option>
                </select>

                <select value={filtroFinanceiro} onChange={(e) => setFiltroFinanceiro(e.target.value)}>
                    <option value="todos">Todos os Pagamentos</option>
                    <option value="pendente">Apenas Pendentes</option>
                    <option value="sinal_pago">Sinal Pago (50%)</option>
                    <option value="pago">Totalmente Pago</option>
                </select>

                <label className="checkbox-atraso">
                    <input 
                        type="checkbox" 
                        checked={mostrarAtrasados}
                        onChange={(e) => setMostrarAtrasados(e.target.checked)}
                    />
                    <span>⚠️ Apenas Atrasados</span>
                </label>
            </div>
        </div>
    );
}