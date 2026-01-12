import { useCustoObra } from './hooks/useCustoObra';
import { ResultadoCusto } from './components/ResultadoCusto';
import { FormularioCusto } from './components/FormularioCusto';
import './CustoObra.css';

export function CustoObra() {
    const { 
        loading, form, resultado, atualizarCalculo,
        setTipoTempo, setTipoOrganizacao, setTempoInput, setQtdUnidades, setTamanhoGrupo 
    } = useCustoObra();

    if (loading) return <div style={{padding: 40, color:'white'}}>Carregando calculadora...</div>;

    return (
        <div className="custo-obra-container">
            <h1>Custo Operacional 🏗️</h1>
            <p style={{color: '#94a3b8', marginBottom:'20px'}}>Defina quanto custa a sua hora/dia para o cliente.</p>

            <ResultadoCusto 
                resultado={resultado}
                tipoTempo={form.tipoTempo}
                tipoOrganizacao={form.tipoOrganizacao}
                tamanhoGrupo={form.tamanhoGrupo}
            />

            <FormularioCusto 
                {...form} // Passa todos os valores do form (tipoTempo, tempoInput, etc)
                resultado={resultado}
                setTipoTempo={setTipoTempo}
                setTipoOrganizacao={setTipoOrganizacao}
                setTempoInput={setTempoInput}
                setQtdUnidades={setQtdUnidades}
                setTamanhoGrupo={setTamanhoGrupo}
                onSalvar={atualizarCalculo}
            />
        </div>
    );
}