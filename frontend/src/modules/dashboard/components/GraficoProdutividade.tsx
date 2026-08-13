import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProdutividadeProps { data: { mes: string; criadas: number; finalizadas: number; }[]; }
interface TooltipProdProps { active?: boolean; label?: string; payload?: { name: string; value: number; color: string; }[]; }

const TooltipProd = ({ active, payload, label }: TooltipProdProps) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label">{label}</p>
                {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color, margin: '4px 0' }}>
                        {p.name === 'criadas' ? 'O.S. Emitidas' : 'O.S. Finalizadas'}: <strong>{p.value}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function GraficoProdutividade({ data }: ProdutividadeProps) {
    return (
        <div className="grafico-card">
            <div className="card-header">
                <h3>Produtividade (Entrada × Saída)</h3>
                <span className="card-badge">Últimos 6 meses</span>
            </div>
            {/* O SEGREDO DO ENCAPSULAMENTO ABSOLUTO */}
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<TooltipProd />} cursor={{ fill: '#ffffff05' }} />
                            <Legend formatter={(v) => v === 'criadas' ? 'Entrada (Criadas)' : 'Saída (Prontas)'} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                            <Bar dataKey="criadas" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="finalizadas" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}