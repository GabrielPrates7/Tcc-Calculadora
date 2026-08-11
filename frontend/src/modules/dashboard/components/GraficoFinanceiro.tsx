import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatarBRL } from '../utils/formatters';

interface PayloadItem { name: string; value: number; color: string; }
interface TooltipProps { active?: boolean; payload?: PayloadItem[]; label?: string; }

const TooltipCustom = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label">{label}</p>
                {payload.map((p: PayloadItem) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name === 'prevista' ? 'O.S. Emitidas (Previsto)' : 'Recebimentos (Realizado)'}: {formatarBRL(p.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

interface GraficoProps {
    data: { mes: string; prevista: number; realizada: number; }[];
}

export function GraficoFinanceiro({ data }: GraficoProps) {
    return (
        <div className="grafico-card">
            <div className="card-header">
                <h3>Produção: Previsto × Realizado</h3>
                <span className="card-badge">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradPrevista" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradRealizada" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<TooltipCustom />} />
                    <Legend formatter={(v) => v === 'prevista' ? 'Projetado (Emissões)' : 'Recebido (Pagamentos)'} wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Area type="monotone" dataKey="prevista" stroke="#a855f7" strokeWidth={2} fill="url(#gradPrevista)" />
                    <Area type="monotone" dataKey="realizada" stroke="#10b981" strokeWidth={2} fill="url(#gradRealizada)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}