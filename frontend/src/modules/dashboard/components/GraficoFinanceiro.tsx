import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatarBRL } from '../../../utils/formatters';

interface FinanceiroProps { data: { mes: string; prevista: number; realizada: number; }[]; }
interface TooltipFinProps { active?: boolean; label?: string; payload?: { name: string; value: number; color: string; }[]; }

const TooltipFin = ({ active, payload, label }: TooltipFinProps) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label">{label}</p>
                {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color, margin: '4px 0' }}>
                        {p.name === 'prevista' ? 'Projetado (Emissões)' : 'Recebido (Pagamentos)'}: <strong>{formatarBRL(p.value)}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function GraficoFinanceiro({ data }: FinanceiroProps) {
    return (
        <div className="grafico-card">
            <div className="card-header">
                <h3>Produção: Previsto × Realizado</h3>
                <span className="card-badge">Últimos 6 meses</span>
            </div>
            {/* O SEGREDO DO ENCAPSULAMENTO ABSOLUTO */}
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="corPrevista" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="corRealizada" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `R$${value / 1000}k`} axisLine={false} tickLine={false} />
                            <Tooltip content={<TooltipFin />} cursor={{ fill: '#ffffff05' }} />
                            <Legend formatter={(v) => v === 'prevista' ? 'Projetado (Emissões)' : 'Recebido (Pagamentos)'} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="prevista" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#corPrevista)" />
                            <Area type="monotone" dataKey="realizada" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#corRealizada)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}