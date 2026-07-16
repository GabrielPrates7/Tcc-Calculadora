import React from 'react';
import './IndicadorCard.css';

interface Props {
    titulo: string;
    valor: string | number;
    icone: React.ReactNode;
    cor: string;
}

export function IndicadorCard({ titulo, valor, icone, cor }: Props) {
    return (
        <div className="indicador-card" style={{ borderLeft: `4px solid ${cor}` }}>
            <div className="card-corpo">
                <h3>{titulo}</h3>
                <p>{valor}</p>
            </div>
            <div className="card-icone" style={{ color: cor }}>
                {icone}
            </div>
        </div>
    );
}