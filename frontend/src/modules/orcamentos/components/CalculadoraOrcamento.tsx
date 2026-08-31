import { useState, useMemo, useEffect } from 'react';
import { Edit2, Calculator, User, Package, DollarSign, FileText, Save, XCircle, Percent, Info, AlertCircle } from 'lucide-react';
import type { IOrcamento, ICenarioMaoObra, IOrcamentoPayload } from '../types';
import { formatarBRL } from '../../../utils/formatters';
import { CustoObraOrcamentos } from './CustoObraOrcamentos';
import { api } from '../../../services/api'; // <-- Injetado para buscar os parâmetros globais
import './CalculadoraOrcamento.css';

interface Props {
    listaCenarios: ICenarioMaoObra[];
    taxaFixa: number;      
    orcamentoEdicao: IOrcamento | null;
    onSalvar: (orc: IOrcamentoPayload) => Promise<boolean>;
    onCancelarEdicao: () => void;
}

export function CalculadoraOrcamento({
    listaCenarios = [],
    taxaFixa = 0,
    orcamentoEdicao,
    onSalvar,
    onCancelarEdicao
}: Props) {
    const [cliente, setCliente] = useState(orcamentoEdicao?.cliente || '');
    const [produto, setProduto] = useState(orcamentoEdicao?.nome_produto || ''); 
    const [materiais, setMateriais] = useState<number | string>(orcamentoEdicao?.custo_materiais || ''); 
    const [tempo, setTempo] = useState<number | string>(orcamentoEdicao?.horas_trabalhadas || ''); 
    const [lucro, setLucro] = useState<number | string>(orcamentoEdicao?.lucro_desejado || 30); 
    const [imposto, setImposto] = useState<number | string>(orcamentoEdicao?.imposto || 5); 

    const [erroValidacao, setErroValidacao] = useState<string | null>(null);

    // EFEITO NOVO: Busca os padrões globais da empresa se for um Novo Orçamento
    useEffect(() => {
        if (!orcamentoEdicao) {
            const carregarTaxasGlobais = async () => {
                try {
                    const response = await api.get('/configuracoes');
                    if (response.data) {
                        setLucro(response.data.margemLucroPadrao);
                        setImposto(response.data.impostoPadrao);
                    }
                } catch (error) {
                    console.error("Erro ao carregar padrões de orçamento da empresa:", error);
                }
            };
            carregarTaxasGlobais();
        }
    }, [orcamentoEdicao]);

    const [idCenarioSelecionado, setIdCenarioSelecionado] = useState<number | null>(() => {
        if (orcamentoEdicao?.id_cenario_mo !== undefined) return orcamentoEdicao.id_cenario_mo ?? null;
        if (!orcamentoEdicao || !orcamentoEdicao.preco_venda || !orcamentoEdicao.horas_trabalhadas) return null;

        const PV = Number(orcamentoEdicao.preco_venda) || 0;
        const tf = Number(orcamentoEdicao.taxa_fixa_snapshot || taxaFixa) || 0;
        const tl = Number(orcamentoEdicao.lucro_desejado) || 0;
        const ti = Number(orcamentoEdicao.imposto) || 0;
        const mat = Number(orcamentoEdicao.custo_materiais) || 0;
        const hrs = Number(orcamentoEdicao.horas_trabalhadas) || 0;

        if (hrs === 0) return null;

        const divisor = 1 - ((tf + tl + ti) / 100);
        if (divisor <= 0) return null;

        const custoProducao = PV * divisor;
        const valorHoraEstimado = (custoProducao - mat) / hrs;

        const listaSegura = Array.isArray(listaCenarios) ? listaCenarios : [];
        const cenarioEncontrado = listaSegura.find(c => Math.abs((Number(c.valorUnitario) || 0) - valorHoraEstimado) <= 0.5);
        return cenarioEncontrado ? cenarioEncontrado.id : null;
    });

    const cenarioAtivo = useMemo(() => {
        const listaSegura = Array.isArray(listaCenarios) ? listaCenarios : [];
        return listaSegura.find(c => c.id === idCenarioSelecionado)
               || (listaSegura.length > 0 ? listaSegura[0] : null);
    }, [listaCenarios, idCenarioSelecionado]);

    /**
     * Valores originais dos campos relevantes ao preço, congelados na
     * abertura do formulário de edição — mesma lista usada na correção do
     * backend (atualizarOrcamento). O componente é remontado a cada troca de
     * orçamento (veja o `key` em Orcamentos.tsx), então `orcamentoEdicao` não
     * muda de identidade durante esta montagem: capturar uma vez já basta.
     */
    const valoresOriginaisPreco = useMemo(() => {
        if (!orcamentoEdicao) return null;
        return {
            materiais: Number(orcamentoEdicao.custo_materiais) || 0,
            horasTrabalhadas: Number(orcamentoEdicao.horas_trabalhadas) || 0,
            idCenarioMo: orcamentoEdicao.id_cenario_mo ?? null,
            lucro: Number(orcamentoEdicao.lucro_desejado) || 0,
            imposto: Number(orcamentoEdicao.imposto) || 0,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const PCT = (v: number) => (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

    const valorHora = Number(cenarioAtivo?.valorUnitario) || 0;
    const unidadeTempo = cenarioAtivo?.unidade || 'horas';
    const isDias = cenarioAtivo?.tipoTempo === 'dias';
    const rotuloMetrica = isDias ? 'em Dias' : 'em Horas';
    
    const isCustoFechado = unidadeTempo === 'total da obra' || unidadeTempo === 'projeto';
    const tempoEfetivo = isCustoFechado ? 1 : (Number(tempo) || 0);

    const custoMaoObra = tempoEfetivo * valorHora;
    const custoProducao = (Number(materiais) || 0) + custoMaoObra;

    const somaPorcentagens = (Number(taxaFixa) || 0) + (Number(lucro) || 0) + (Number(imposto) || 0);
    const divisor = 1 - (somaPorcentagens / 100);

    const precoCalculadoAoVivo = (divisor > 0 && custoProducao > 0) ? custoProducao / divisor : 0;

    // Sem orçamento em edição (novo orçamento), sempre ao vivo — comportamento
    // inalterado. Editando, só troca para o cálculo ao vivo (com a taxa atual)
    // depois que o usuário mexer em algum campo relevante ao preço; editar só
    // cliente/produto mantém o preço exibido igual ao que já está gravado —
    // espelha o que atualizarOrcamento decide no backend.
    const algumCampoPrecoMudou = !valoresOriginaisPreco || (
        (Number(materiais) || 0) !== valoresOriginaisPreco.materiais ||
        tempoEfetivo !== valoresOriginaisPreco.horasTrabalhadas ||
        (cenarioAtivo?.id ?? null) !== valoresOriginaisPreco.idCenarioMo ||
        (Number(lucro) || 0) !== valoresOriginaisPreco.lucro ||
        (Number(imposto) || 0) !== valoresOriginaisPreco.imposto
    );

    const precoFinal = algumCampoPrecoMudou
        ? precoCalculadoAoVivo
        : (Number(orcamentoEdicao?.preco_venda) || 0);

    const handleSalvar = async () => {
        if (!produto || !produto.trim()) {
            setErroValidacao("Por favor, digite o nome do produto.");
            return;
        }
        // Só bloqueia por causa da soma das taxas quando o preço de fato vai
        // ser recalculado — espelha exatamente a condição do backend
        // (atualizarOrcamento só valida a soma quando precoMudou é true). Numa
        // edição administrativa (ex: só o cliente), o snapshot é preservado
        // sem recálculo, então a soma atual não é relevante para essa gravação.
        if (algumCampoPrecoMudou && divisor <= 0) {
            setErroValidacao("A soma das taxas ultrapassa 100%. Impossível calcular o preço de venda.");
            return;
        }

        const dados: IOrcamentoPayload = {
            id: orcamentoEdicao?.id,
            cliente,
            nome_produto: produto,
            custo_materiais: Number(materiais) || 0,
            horas_trabalhadas: tempoEfetivo,
            lucro_desejado: Number(lucro) || 0,
            imposto: Number(imposto) || 0,
            preco_venda: precoFinal,
            valorHoraSelecionado: valorHora,
            id_cenario_mo: cenarioAtivo?.id || null
        };

        const sucesso = await onSalvar(dados);
        
        if (sucesso && !orcamentoEdicao) {
            setCliente(''); setProduto(''); setMateriais(''); setTempo('');
        }
    };

    return (
        <div className="card-calculadora">
            <h2>
    {orcamentoEdicao ? <Edit2 size={24} color="#f97316" /> : <Calculator size={24} color="#f97316" />} 
    {orcamentoEdicao ? ' Editar Orçamento' : ' Novo Orçamento'}
</h2>

            <CustoObraOrcamentos
                listaCenarios={listaCenarios}
                cenarioAtivo={cenarioAtivo}
                idCenarioSelecionado={idCenarioSelecionado}
                onSelecionarCenario={setIdCenarioSelecionado}
                rotuloMetrica={rotuloMetrica}
            />

            <div className="form-group">
                <label>Nome do Cliente (Opcional)</label>
                <div className="input-icon-wrapper">
                    <User size={18} className="input-icon" />
                    <input type="text" placeholder="Ex: João da Silva" value={cliente} onChange={e => setCliente(e.target.value)} />
                </div>
            </div>

            <div className="form-group">
                <label>Produto / Serviço</label>
                <div className="input-icon-wrapper">
                    <Package size={18} className="input-icon" />
                    <input type="text" placeholder="Ex: Guarda-Roupa MDF" value={produto} onChange={e => setProduto(e.target.value)} />
                </div>
            </div>

            <div className="row-inputs">
                <div className="form-group">
                    <label>Materiais (R$)</label>
                    <div className="input-icon-wrapper">
                        <DollarSign size={18} className="input-icon" />
                        <input type="number" min="0" step="0.01" value={materiais} onChange={e => setMateriais(e.target.value)} />
                    </div>
                </div>
                
                {!isCustoFechado && (
                    <div className="form-group">
                        <label>Tempo ({unidadeTempo})</label>
                        <div className="input-icon-wrapper">
                            <FileText size={18} className="input-icon" />
                            <input type="number" min="0" step="0.5" value={tempo} onChange={e => setTempo(e.target.value)} />
                        </div>
                    </div>
                )}
            </div>

            <div className="row-inputs">
                <div className="form-group">
                    <label>Lucro Desejado (%)</label>
                    <div className="input-icon-wrapper">
                        <Percent size={18} className="input-icon" />
                        <input type="number" value={lucro} onChange={e => setLucro(e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Impostos Gerais (%)</label>
                    <div className="input-icon-wrapper">
                        <Percent size={18} className="input-icon" />
                        <input type="number" value={imposto} onChange={e => setImposto(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="custos-breakdown">
                <div className="custo-linha">
                    <span><Info size={14} style={{ verticalAlign: 'middle' }} /> Custo Fixo (Automático)</span>
                    <span className="custo-valor">{PCT(taxaFixa)}</span>
                </div>
                <div className="custo-linha">
                    <span>Mão de Obra (Custo Total {rotuloMetrica})</span>
                    <span className="custo-valor">{formatarBRL(custoMaoObra)}</span>
                </div>
                <div className="custo-linha">
                    <span>Materiais</span>
                    <span className="custo-valor">{formatarBRL(Number(materiais) || 0)}</span>
                </div>
                
                <div className="custo-linha destaque">
                    <span>Custo de Produção (Total)</span>
                    <span className="custo-valor">{formatarBRL(custoProducao)}</span>
                </div>
            </div>
            
            <div className="resultado-box">
                <span className="resultado-label">Preço de Venda Sugerido</span>
                <div className="resultado-valor">{formatarBRL(precoFinal)}</div>
                
                {divisor <= 0 && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px', fontWeight: 'bold' }}>
                        ⚠️ Atenção: Suas taxas somam mais de 100%!
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-salvar" onClick={handleSalvar} disabled={!cenarioAtivo}>
                    <Save size={20} /> {orcamentoEdicao ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
                </button>
                {orcamentoEdicao && (
                    <button className="btn-salvar" style={{ backgroundColor: '#ef4444' }} onClick={onCancelarEdicao}>
                        <XCircle size={20} /> Cancelar
                    </button>
                )}
            </div>

            {/* --- MODAL ESCURO PARA VALIDAÇÃO DO FORMULÁRIO --- */}
            {erroValidacao && (
                <div 
                    onClick={() => setErroValidacao(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 10005
                    }}
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#1e293b',
                            border: '2px solid #ef4444',
                            borderRadius: '12px',
                            padding: '24px',
                            width: '90%',
                            maxWidth: '400px',
                            textAlign: 'center',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        <div style={{ marginBottom: '12px' }}>
                            <AlertCircle size={38} color="#ef4444" style={{ margin: '0 auto' }} />
                        </div>
                        
                        <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', margin: '0 0 10px 0' }}>
                            Campo Obrigatório
                        </h3>

                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '22px', lineHeight: '1.5' }}>
                            {erroValidacao}
                        </p>

                        <button
                            type="button"
                            onClick={() => setErroValidacao(null)}
                            style={{
                                background: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.95rem'
                            }}
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}