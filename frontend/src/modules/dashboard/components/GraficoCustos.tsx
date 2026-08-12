import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatarBRL } from '../../../utils/formatters';

interface CustosProps { data: { nome: string; valor: number; cor: string; }[]; }
interface TooltipCustosProps { active?: boolean; payload?: { name: string; value: number; payload: { cor: string; }; }[]; }

const TooltipCustos = ({ active, payload }: TooltipCustosProps) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-label" style={{ color: payload[0].payload.cor }}>{payload[0].name}</p>
                <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>{formatarBRL(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

export function GraficoCustos({ data }: CustosProps) {
    if (!data || data.length === 0) {
        return (
            <div className="grafico-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="msg-vazia">Nenhum custo registado no mês.</p>
            </div>
        );
    }

    return (
        <div className="grafico-card">
            <div className="card-header">
                <h3>Composição de Custos</h3>
                <span className="card-badge">Mês Atual</span>
            </div>
            {/* O SEGREDO DO ENCAPSULAMENTO ABSOLUTO */}
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data} cx="50%" cy="50%" 
                                innerRadius={60} outerRadius={85} 
                                paddingAngle={5} dataKey="valor" nameKey="nome" stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.cor} />
                                ))}
                            </Pie>
                            <Tooltip content={<TooltipCustos />} />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}