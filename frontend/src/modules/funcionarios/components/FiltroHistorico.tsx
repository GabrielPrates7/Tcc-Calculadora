import { useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import './FiltroHistorico.css';

interface Props {
    // A função retorna void (apenas dispara a busca)
    onBuscar: (inicio: string, fim: string) => Promise<void>; 
}

export function FiltroHistorico({ onBuscar }: Props) {
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [buscando, setBuscando] = useState(false);

    const handleBuscar = async () => {
        if (!dataInicio || !dataFim) return alert("Selecione as datas!");
        setBuscando(true);
        await onBuscar(dataInicio, dataFim);
        setBuscando(false);
    };

    return (
        <div className="card-filtro-custo" style={{backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px'}}>
            <div style={{display:'flex', gap:'10px', alignItems:'center', color:'var(--text-secondary)', marginBottom:'10px', fontWeight:'bold', fontSize:'0.9rem'}}>
                <Calendar size={16}/> CUSTO DE PRODUÇÃO HISTÓRICO
            </div>
            <div style={{display:'flex', gap:'15px', alignItems:'flex-end'}}>
                <div className="filtro-grupo">
                    <label style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Início</label>
                    <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                </div>
                <div className="filtro-grupo">
                    <label style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Fim</label>
                    <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                </div>
                
                <button 
                    onClick={handleBuscar} 
                    disabled={buscando} 
                    style={{backgroundColor:'var(--cor-primaria)', color:'white', border:'none', height:'38px', padding:'0 20px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px'}}
                >
                    {/* Ícone Search usado aqui */}
                    <Search size={16} /> 
                    {buscando ? 'Filtrando...' : 'Filtrar'}
                </button>
            </div>
        </div>
    );
}