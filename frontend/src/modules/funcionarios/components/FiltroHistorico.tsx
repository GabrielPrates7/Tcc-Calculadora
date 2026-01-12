import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Search, DollarSign } from 'lucide-react';
import type { Funcionario } from '../types';
import './FiltroHistorico.css';

interface Props {
    // O componente recebe uma função que retorna uma Promessa de lista
    onBuscar: (inicio: string, fim: string) => Promise<Funcionario[]>;
}

export function FiltroHistorico({ onBuscar }: Props) {
    const [aberto, setAberto] = useState(false);
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');
    const [lista, setLista] = useState<Funcionario[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFiltrar = async () => {
        if (!inicio || !fim) return alert("Selecione as datas.");
        setLoading(true);
        const dados = await onBuscar(inicio, fim);
        setLista(dados);
        setLoading(false);
    };

    const total = lista ? lista.reduce((acc, curr) => acc + Number(curr.custo_total_mensal), 0) : 0;

    return (
        <div className="card-filtro-custo" style={{ 
            backgroundColor: '#1e293b', 
            padding: aberto ? '20px' : '15px 20px', 
            borderRadius: '8px', 
            marginTop: '24px', 
            border: '1px solid #334155' 
        }}>
            <div onClick={() => setAberto(!aberto)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#f8fafc', display: 'flex', gap: '8px', alignItems: 'center', margin: 0, fontSize: '1rem' }}>
                    <Calendar size={20} color="#3b82f6" />
                    Custo de Produção Histórico
                </h3>
                {aberto ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </div>

            {aberto && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div><label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem' }}>De:</label><input type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></div>
                        <div><label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem' }}>Até:</label><input type="date" value={fim} onChange={e => setFim(e.target.value)} /></div>
                        <button onClick={handleFiltrar} disabled={loading} className="btn-novo" style={{ height: '38px' }}>
                            <Search size={18} /> {loading ? '...' : 'Filtrar'}
                        </button>
                    </div>

                    {lista && (
                        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #334155' }}>
                            <div style={{ display: 'flex', gap: 30 }}>
                                <div><span style={{ color: '#94a3b8' }}>Qtd:</span> <strong style={{ color: 'white', fontSize: '1.2rem' }}>{lista.length}</strong></div>
                                <div><span style={{ color: '#94a3b8' }}>Total:</span> <strong style={{ color: '#22c55e', fontSize: '1.2rem' }}><DollarSign size={16} style={{display:'inline'}}/> {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}