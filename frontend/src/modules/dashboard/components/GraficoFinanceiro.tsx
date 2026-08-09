import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatarBRL } from '../utils/formatters';

const dadosGrafico = [
    { mes: 'Jan', receita: 18000, lucro: 5400 },
    { mes: 'Fev', receita: 22000, lucro: 6600 },
    { mes: 'Mar', receita: 19500, lucro: 5850 },
    { mes: 'Abr', receita: 25000, lucro: 7500 },
    { mes: 'Mai', receita: 21000, lucro: 6300 },
    { mes: 'Jun', receita: 28000, lucro: 8400 },
];

interface PayloadItem {
    name: string;
    value: number;
    color: string;
}

interface TooltipCustomProps {
    active?: boolean;
    payload?: PayloadItem[];
    label?: string;
}

const TooltipCustom = ({ active, payload, label }: TooltipCustomProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label">{label}</p>
                {payload.map((p: PayloadItem) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name === 'receita' ? 'Receita' : 'Lucro'}: {formatarBRL(p.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

export function GraficoFinanceiro() {
    return (
        <div className="grafico-card">
            <div className="card-header">
                <h3>Receita × Lucro</h3>
                <span className="card-badge">Últimos 6 meses</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<TooltipCustom />} />
                    <Legend formatter={(v) => v === 'receita' ? 'Receita' : 'Lucro'} wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={2} fill="url(#gradReceita)" />
                    <Area type="monotone" dataKey="lucro" stroke="#a855f7" strokeWidth={2} fill="url(#gradLucro)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}