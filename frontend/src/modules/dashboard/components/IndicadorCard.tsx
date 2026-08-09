import React from 'react';

interface Props {
    titulo: string;
    valor: string;
    icone: React.ReactNode;
    cor: string;
    sub?: string;
}

export function IndicadorCard({ titulo, valor, icone, cor, sub }: Props) {
    return (
        <div className="ind-card" style={{ borderBottom: `3px solid ${cor}` }}>
            <div className="ind-card-topo">
                <span className="ind-titulo">{titulo}</span>
                <div className="ind-icone" style={{ background: `${cor}22`, color: cor }}>
                    {icone}
                </div>
            </div>
            <p className="ind-valor">{valor}</p>
            {sub && <span className="ind-sub">{sub}</span>}
        </div>
    );
}