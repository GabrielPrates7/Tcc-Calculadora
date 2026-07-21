import { Users, FileText, Briefcase, Loader2 } from 'lucide-react';

interface Props {
    custoFolha: number;
    custoProducao: number;
    totalAtivos: number;
    loading?: boolean;
}

export function ResumoFinanceiro({ custoFolha, custoProducao, totalAtivos, loading }: Props) {
    const formatarMoeda = (valor: number) => {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const pctProducao = custoFolha > 0 ? Math.round((custoProducao / custoFolha) * 100) : 0;

    return (
        <>
            <style>{`
                .resumo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-bottom: 24px;
                    opacity: ${loading ? 0.6 : 1};
                    transition: opacity 0.2s ease;
                    pointer-events: ${loading ? 'none' : 'auto'};
                }
                .card-metrica {
                    background-color: #1e293b;
                    border-radius: 12px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .card-metrica:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
                }
                
                /* Contornos específicos solicitados */
                .card-equipe {
                    border: 1px solid #f97316;
                    border-bottom: 4px solid #f97316;
                }

                .card-folha {
                    border: 1px solid #3b82f6;
                    border-bottom: 4px solid #3b82f6;
                }

                .card-producao {
                    border: 1px solid #10b981;
                    border-bottom: 4px solid #10b981;
                }
            `}</style>

            <div className="resumo-grid">
                
                {/* Card 1: Equipe Ativa (Laranja) */}
                <div className="card-metrica card-equipe">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)', padding: '10px', borderRadius: '8px', display: 'flex' }}>
                            <Users size={20} color="#f97316" />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>EQUIPE ATIVA</span>
                    </div>
                    <div>
                        <h2 style={{ color: '#f8fafc', fontSize: '2.2rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', height: '42px', fontWeight: 700 }}>
                            {loading ? <Loader2 size={28} className="animate-spin" color="#f97316" /> : totalAtivos}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>colaboradores</span>
                    </div>
                </div>

                {/* Card 2: Custo Folha (Azul) */}
                <div className="card-metrica card-folha">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '8px', display: 'flex' }}>
                            <FileText size={20} color="#3b82f6" />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>CUSTO FOLHA MENSAL</span>
                    </div>
                    <div>
                        <h2 style={{ color: '#f8fafc', fontSize: '2.2rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', height: '42px', fontWeight: 700 }}>
                            {loading ? <Loader2 size={28} className="animate-spin" color="#3b82f6" /> : formatarMoeda(custoFolha)}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📈 Visão Geral
                        </span>
                    </div>
                </div>

                {/* Card 3: Custo Produção (Verde) */}
                <div className="card-metrica card-producao">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '8px', display: 'flex' }}>
                            <Briefcase size={20} color="#10b981" />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>CUSTO PRODUÇÃO</span>
                    </div>
                    <div>
                        <h2 style={{ color: '#10b981', fontSize: '2.2rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', height: '42px', fontWeight: 700 }}>
                            {loading ? <Loader2 size={28} className="animate-spin" color="#10b981" /> : formatarMoeda(custoProducao)}
                        </h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            <strong style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{pctProducao}%</strong> do total
                        </span>
                    </div>
                </div>

            </div>
        </>
    );
}