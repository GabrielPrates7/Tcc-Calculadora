import { useState, useEffect, useMemo } from 'react';
import { formatarBRL } from '../../../utils/formatters';
import { CustoObraService, type TaxaFuncao } from '../services/custo-obra.service';
import { Plus, Trash2, Search, Clock, Calendar, Users } from 'lucide-react'; 

interface RecursoAlocado {
    funcao_id: number;
    qtd_profissionais: number;
    tempo: number;
    unidade: 'horas' | 'dias';
}

interface FormularioObraProps {
    onSalvarSucesso: () => void;
}

const HORAS_POR_DIA = 8; 

export function FormularioObra({ onSalvarSucesso }: FormularioObraProps) {
    const [titulo, setTitulo] = useState('');
    const [cliente, setCliente] = useState('');

    const [taxas, setTaxas] = useState<TaxaFuncao[]>([]);
    const [recursos, setRecursos] = useState<RecursoAlocado[]>([]);
    const [termoBusca, setTermoBusca] = useState<string>('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        const carregarTaxas = async () => {
            try {
                setIsLoading(true);
                const taxasReais = await CustoObraService.obterTaxas();
                setTaxas(taxasReais);
            } catch (error) {
                console.error("Erro ao carregar taxas da API", error);
                setErro("Falha de comunicação com o servidor.");
            } finally {
                setIsLoading(false);
            }
        };
        carregarTaxas();
    }, []);

    const handleAdicionarRecurso = (funcao_id: number) => {
        if (recursos.some(r => r.funcao_id === funcao_id)) return;
        setRecursos([...recursos, { funcao_id, qtd_profissionais: 1, tempo: 0, unidade: 'horas' }]);
        setTermoBusca(''); 
    };

    const handleRemoverRecurso = (funcao_id: number) => {
        setRecursos(prev => prev.filter(r => r.funcao_id !== funcao_id));
    };

    const handleUpdateQtdProfissionais = (funcao_id: number, qtd: number) => {
        const qtdValida = qtd < 1 ? 1 : qtd; 
        setRecursos(prev => prev.map(r => r.funcao_id === funcao_id ? { ...r, qtd_profissionais: qtdValida } : r));
    };

    const handleUpdateTempo = (funcao_id: number, tempo: number) => {
        const tempoValido = tempo < 0 ? 0 : tempo;
        setRecursos(prev => prev.map(r => r.funcao_id === funcao_id ? { ...r, tempo: tempoValido } : r));
    };

    const handleToggleUnidade = (funcao_id: number, novaUnidade: 'horas' | 'dias') => {
        setRecursos(prev => prev.map(r => r.funcao_id === funcao_id ? { ...r, unidade: novaUnidade } : r));
    };

    const custoTotalMaoDeObra = useMemo(() => {
        return recursos.reduce((total, recurso) => {
            const taxa = taxas.find(t => t.funcao_id === recurso.funcao_id);
            const custoHora = taxa ? taxa.custo_hora_calculado : 0;
            
            const horasBase = recurso.unidade === 'dias' 
                ? recurso.tempo * HORAS_POR_DIA 
                : recurso.tempo;

            const horasHomem = horasBase * recurso.qtd_profissionais;

            return total + (horasHomem * custoHora);
        }, 0);
    }, [recursos, taxas]);

    const handleSalvar = async () => {
        if (!titulo || !cliente) {
            alert('Preencha o Título da Obra e o Cliente.');
            return;
        }

        const recursosFiltrados = recursos.filter(r => r.tempo > 0);
        if (recursosFiltrados.length === 0) {
            alert('Aloque tempo em pelo menos uma função.');
            return;
        }

        try {
            setIsSaving(true);
            
            const payload = {
                titulo,
                cliente,
                recursos: recursosFiltrados.map(r => {
                    const taxa = taxas.find(t => t.funcao_id === r.funcao_id);
                    const horasBase = r.unidade === 'dias' ? r.tempo * HORAS_POR_DIA : r.tempo;
                    const horasHomemTotais = horasBase * r.qtd_profissionais;
                    
                    return {
                        funcao_id: r.funcao_id,
                        horas_estimadas: horasHomemTotais, 
                        custo_hora_aplicado: taxa ? taxa.custo_hora_calculado : 0
                    };
                })
            };

            await CustoObraService.salvarOrcamento(payload);
            onSalvarSucesso();
            
            setTitulo('');
            setCliente('');
            setRecursos([]);
            
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar a base de cálculo.');
        } finally {
            setIsSaving(false);
        }
    };

    const funcoesDisponiveis = taxas.filter(t => !recursos.some(r => r.funcao_id === t.funcao_id));
    const funcoesFiltradas = funcoesDisponiveis.filter(t => 
        t.funcao_nome.toLowerCase().includes(termoBusca.toLowerCase())
    );

    if (isLoading) return <div style={{ color: '#fff', padding: '20px' }}>Carregando motor de precificação...</div>;
    if (erro) return <div style={{ color: '#ef4444', padding: '20px' }}>{erro}</div>;

    return (
        <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden' }}>
            {/* 1. TÍTULO CORRIGIDO PARA 'BASE DE CÁLCULO' E BORDA AJUSTADA */}
            <div style={{ padding: '20px', backgroundColor: '#1e293b', borderBottom: '1px solid #475569' }}>
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>Detalhes da Base de Cálculo</h2>
            </div>

            <div style={{ padding: '20px' }}>
                {/* DADOS CADASTRAIS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>NOME DA OBRA / PROJETO</label>
                        <input 
                            type="text" 
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Instalação de Caldeira"
                            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>CLIENTE</label>
                        <input 
                            type="text" 
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                            placeholder="Ex: Indústria XYZ"
                            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', outline: 'none' }}
                        />
                    </div>
                </div>
                
                {/* MOTOR DE BUSCA */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '14px', color: '#64748b' }} />
                    <input 
                        type="text" 
                        placeholder="Busque e adicione cargos (ex: Torneiro, Pintor)..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#fff', fontSize: '1rem', outline: 'none', boxShadow: termoBusca ? '0 0 0 1px rgba(249, 115, 22, 0.5)' : 'none' }}
                    />
                </div>

                {termoBusca && (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', marginBottom: '20px', padding: '5px' }}>
                        {funcoesFiltradas.length === 0 ? (
                            <div style={{ color: '#64748b', textAlign: 'center', padding: '15px' }}>Nenhum cargo encontrado.</div>
                        ) : (
                            funcoesFiltradas.map(taxa => (
                                <div key={taxa.funcao_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #0f172a' }}>
                                    <div>
                                        <span style={{ color: '#f8fafc', fontWeight: '500', display: 'block' }}>{taxa.funcao_nome}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatarBRL(taxa.custo_hora_calculado)}/h</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAdicionarRecurso(taxa.funcao_id)}
                                        style={{ padding: '6px 16px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Add
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* LISTA DE RECURSOS - GRID */}
                <div style={{ marginTop: '30px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>EQUIPE ALOCADA NESTA OBRA</label>
                    
                    {recursos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', border: '1px dashed #334155', borderRadius: '6px' }}>
                            Utilize a barra de pesquisa acima para montar a equipe desta obra.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {recursos.map(recurso => {
                                const taxa = taxas.find(t => t.funcao_id === recurso.funcao_id);
                                if (!taxa) return null;

                                const horasBase = recurso.unidade === 'dias' ? recurso.tempo * HORAS_POR_DIA : recurso.tempo;
                                const subtotal = (horasBase * recurso.qtd_profissionais) * taxa.custo_hora_calculado;

                                return (
                                    <div key={taxa.funcao_id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr auto', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f97316', gap: '15px' }}>
                                        
                                        {/* Info da Função */}
                                        <div>
                                            <span style={{ color: '#f8fafc', fontWeight: 'bold', display: 'block', fontSize: '1.05rem' }}>{taxa.funcao_nome}</span>
                                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Base: {formatarBRL(taxa.custo_hora_calculado)} /h</span>
                                        </div>

                                        {/* Qtd Profissionais */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Profissionais</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#0f172a', padding: '4px 8px', borderRadius: '6px', border: '1px solid #334155' }}>
                                                <Users size={14} color="#94a3b8" />
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={recurso.qtd_profissionais}
                                                    onChange={(e) => handleUpdateQtdProfissionais(taxa.funcao_id, Number(e.target.value))}
                                                    style={{ width: '40px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'center', fontSize: '1rem', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Tempo e Toggle (Dias/Horas) */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Tempo (por pessoa)</label>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={recurso.tempo || ''}
                                                    placeholder="0"
                                                    onChange={(e) => handleUpdateTempo(taxa.funcao_id, Number(e.target.value))}
                                                    style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontSize: '1rem', outline: 'none' }}
                                                />
                                                <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #334155', overflow: 'hidden' }}>
                                                    <button 
                                                        onClick={() => handleToggleUnidade(taxa.funcao_id, 'horas')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: 'none', cursor: 'pointer', backgroundColor: recurso.unidade === 'horas' ? '#475569' : 'transparent', color: recurso.unidade === 'horas' ? '#fff' : '#94a3b8', fontSize: '0.85rem' }}
                                                    >
                                                        <Clock size={12} /> Horas
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleUnidade(taxa.funcao_id, 'dias')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', border: 'none', cursor: 'pointer', backgroundColor: recurso.unidade === 'dias' ? '#475569' : 'transparent', color: recurso.unidade === 'dias' ? '#fff' : '#94a3b8', fontSize: '0.85rem' }}
                                                        title={`1 dia = ${HORAS_POR_DIA} horas`}
                                                    >
                                                        <Calendar size={12} /> Dias
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Subtotal da Linha */}
                                        <div style={{ textAlign: 'right', paddingRight: '10px' }}>
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block' }}>Subtotal</span>
                                            <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{formatarBRL(subtotal)}</span>
                                        </div>

                                        <button 
                                            onClick={() => handleRemoverRecurso(taxa.funcao_id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 2. RODAPÉ DO CÁLCULO E BOTÃO DE SUBMIT ATUALIZADOS */}
                <div style={{ marginTop: '30px' }}>
                    <div style={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569', 
                        padding: '20px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '15px'
                    }}>
                        <div>
                            <h3 style={{ color: '#cbd5e1', margin: 0, fontSize: '1.1rem' }}>
                                Custo Direto Total (Mão de Obra)
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '5px 0 0 0' }}>
                                Soma dos homens-hora de todas as funções alocadas.
                            </p>
                        </div>
                        
                        <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#f97316' }}>
                            {formatarBRL(custoTotalMaoDeObra)}
                        </div>
                    </div>

                    <button
                        onClick={handleSalvar}
                        disabled={isSaving || recursos.length === 0 || !titulo || !cliente}
                        style={{ 
                            width: '100%', 
                            padding: '16px', 
                            backgroundColor: (isSaving || recursos.length === 0 || !titulo || !cliente) ? '#334155' : '#f97316', 
                            color: (isSaving || recursos.length === 0 || !titulo || !cliente) ? '#64748b' : '#ffffff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 'bold', 
                            fontSize: '1.1rem', 
                            cursor: (isSaving || recursos.length === 0 || !titulo || !cliente) ? 'not-allowed' : 'pointer',
                            marginTop: '15px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Base de Cálculo'}
                    </button>
                </div>
            </div>
        </div>
    );
}