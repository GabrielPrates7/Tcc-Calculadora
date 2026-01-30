import { PDFDownloadLink } from '@react-pdf/renderer'; 
import { FileText, Save, Info, XCircle } from 'lucide-react';
import { useCustoObra } from './hooks/useCustoObra';
import { ResultadoCusto } from './components/ResultadoCusto';
import { FormularioCusto } from './components/FormularioCusto';
import { RelatorioPDF } from './components/RelatorioPDF';
import { HistoricoCenarios } from './components/HistoricoCenarios';
import './CustoObra.css';

export function CustoObra() {
    const { 
        loading, form, resultado, historico, cenarioEmEdicao,
        titulo, setTitulo, 
        atualizarCalculo,
        setTipoTempo, setTipoOrganizacao, setTempoInput, setQtdUnidades, setTamanhoGrupo,
        excluirItem, renomearItem, restaurarCenario, cancelarEdicao 
    } = useCustoObra();

    if (loading) return <div style={{padding: 40, color:'white'}}>Carregando calculadora...</div>;

    // --- AÇÃO 1: SALVAR (Botão Superior) ---
    // Este é o ÚNICO lugar que grava no histórico agora.
    const handleSalvarComTitulo = () => {
        if(!titulo) {
            alert("Dê um nome para este cenário antes de salvar.");
            return;
        }
        // true = Salva no banco de histórico
        atualizarCalculo(titulo, true); 
    };

    // --- AÇÃO 2: APENAS RECALCULAR (Botão Inferior) ---
    // Serve apenas para ver o resultado na tela ("O que acontece se eu colocar 3 funcionários?").
    // Não suja o histórico.
    const handleRecalcularRapido = () => {
        // false = Não salva no histórico, apenas atualiza a configuração global e a tela
        atualizarCalculo(undefined, false); 
    };

    return (
        <div className="custo-obra-container">
            {/* --- TOPO --- */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <h1>Custo Operacional 🏗️</h1>
                    <p style={{color: '#94a3b8'}}>Defina sua régua de cobrança.</p>
                </div>
                
                <PDFDownloadLink 
                    document={
                        <RelatorioPDF dados={{
                            titulo: titulo || (cenarioEmEdicao ? cenarioEmEdicao : 'Custo Atual'),
                            data: new Date().toLocaleDateString(),
                            custoMensal: resultado.custoEquipeMensal,
                            tipoTempo: form.tipoTempo,
                            tempoInput: form.tempoInput,
                            qtdUnidades: form.qtdUnidades,
                            tipoOrganizacao: form.tipoOrganizacao,
                            tamanhoGrupo: form.tamanhoGrupo,
                            valorFinal: resultado.valorUnitario
                        }} />
                    } 
                    fileName={`Relatorio_Denarius_${new Date().getTime()}.pdf`}
                    style={{textDecoration: 'none'}}
                >
                    {({ loading }) => (
                        <button className="btn-pdf" disabled={loading} style={{
                            background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', 
                            borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems:'center'
                        }}>
                            <FileText size={18} /> {loading ? 'Gerando...' : 'Baixar PDF'}
                        </button>
                    )}
                </PDFDownloadLink>
            </div>

            {/* --- RESULTADO EM DESTAQUE --- */}
            <ResultadoCusto 
                resultado={resultado}
                tipoTempo={form.tipoTempo}
                tipoOrganizacao={form.tipoOrganizacao}
                tamanhoGrupo={form.tamanhoGrupo}
            />

            {/* --- BARRA DE SALVAMENTO (Único lugar onde se define nome e salva) --- */}
            <div className="card-input-titulo" style={{
                background: cenarioEmEdicao ? '#334155' : '#1e293b', 
                padding: 20, borderRadius: 8, marginBottom: 20,
                border: cenarioEmEdicao ? '1px solid #f97316' : 'none',
                transition: '0.3s'
            }}>
                {/* Aviso de Edição */}
                {cenarioEmEdicao && (
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 15, color: '#fb923c'}}>
                        <div style={{display:'flex', alignItems:'center', gap: 8}}>
                            <Info size={18} />
                            <span>
                                <strong>Modo de Edição:</strong> Você está alterando o cenário "{cenarioEmEdicao}".
                            </span>
                        </div>
                        <button onClick={cancelarEdicao} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
                            <XCircle size={16}/> Cancelar Edição
                        </button>
                    </div>
                )}

                <label style={{color: 'white', display:'block', marginBottom: 10}}>
                    {cenarioEmEdicao ? 'Nome do Cenário (Salvar atualizará este item):' : 'Nome deste Novo Cenário (Para Histórico):'}
                </label>
                
                <div style={{display:'flex', gap: 10}}>
                    <input 
                        type="text" 
                        placeholder="Ex: Tabela de Preços 2026 - Verão"
                        value={titulo} 
                        onChange={e => setTitulo(e.target.value)}
                        style={{flex: 1, padding: 10, borderRadius: 5, border: '1px solid #475569', background: '#0f172a', color: 'white'}}
                    />
                    <button 
                        onClick={handleSalvarComTitulo}
                        style={{background: '#f97316', color: 'white', border: 'none', padding: '0 20px', borderRadius: 5, cursor: 'pointer', fontWeight: 'bold', display:'flex', alignItems:'center'}}
                    >
                        <Save size={18} style={{marginRight:5}}/> 
                        {cenarioEmEdicao ? 'Atualizar Histórico' : 'Salvar no Histórico'}
                    </button>
                </div>
            </div>

            {/* --- FORMULÁRIO --- */}
            <FormularioCusto 
                {...form}
                resultado={resultado}
                setTipoTempo={setTipoTempo}
                setTipoOrganizacao={setTipoOrganizacao}
                setTempoInput={setTempoInput}
                setQtdUnidades={setQtdUnidades}
                setTamanhoGrupo={setTamanhoGrupo}
                onSalvar={handleRecalcularRapido} // Botão de baixo chama a função "Sem Salvar"
            />

            {/* --- LISTA DE HISTÓRICO --- */}
            <HistoricoCenarios 
                itens={historico} 
                custoMensalAtual={resultado.custoEquipeMensal} 
                onExcluir={excluirItem}
                onRenomear={renomearItem}
                onRestaurar={restaurarCenario}
            />
        </div>
    );
}