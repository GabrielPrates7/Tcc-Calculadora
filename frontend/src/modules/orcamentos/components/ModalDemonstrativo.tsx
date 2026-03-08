import { X, Printer, FileText, CheckCircle, TrendingUp, DollarSign, Hammer, Package, Receipt, ArrowRightCircle } from 'lucide-react';
import type { Orcamento } from '../types';
import { useNavigate } from 'react-router-dom';
import { OrdemServicoService } from '../../ordemServico/services/ordemServico.service';
import './ModalDemonstrativo.css';

interface Props {
    orcamento: Orcamento;
    onClose: () => void;
}

export function ModalDemonstrativo({ orcamento, onClose }: Props) {
    const navigate = useNavigate();

    // Formatações
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const PCT = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    const DATA = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

    // Cálculos Reversos Exatos
    const PV = Number(orcamento.preco_venda);
    const taxaFixo = Number(orcamento.taxa_fixa_snapshot || 0);
    const taxaLucro = Number(orcamento.lucro_desejado || 0);
    const taxaImposto = Number(orcamento.imposto || 0);

    const valorCustoFixo = PV * (taxaFixo / 100);
    const valorImposto = PV * (taxaImposto / 100);
    const valorLucro = PV * (taxaLucro / 100);
    const valorMateriais = Number(orcamento.custo_materiais || 0);
    const valorMaoObra = PV - valorCustoFixo - valorImposto - valorLucro - valorMateriais;

    // --- FUNÇÕES DOS BOTÕES ---
    const handlePrint = () => window.print();

    // A MÁGICA ACONTECE AQUI
    const handleAprovarOS = async () => {
        if (!orcamento.id) return alert('Erro: Salve o orçamento antes de gerar a O.S.');
        
        try {
            // Pergunta o prazo de forma nativa e rápida
            const dias = prompt('Quantos dias para entregar a obra? (Deixe vazio se não tiver prazo)');
            let dataEntrega = undefined;
            
            if (dias && !isNaN(Number(dias))) {
                const data = new Date();
                data.setDate(data.getDate() + Number(dias));
                dataEntrega = data.toISOString();
            }

            // Chama o backend para criar o cartão no Kanban
            await OrdemServicoService.criarDeOrcamento(orcamento.id, dataEntrega);
            
            alert('Ordem de Serviço gerada com sucesso!');
            onClose(); // Fecha o modal
            navigate('/ordens-servico'); // Leva o usuário direto para o Kanban!
            
        } catch (error) {
            // SOLUÇÃO DO 'ANY': Tratamos o erro explicitamente como uma instância de Error
            const err = error as Error;
            alert(err.message || 'Erro ao gerar O.S. (Pode ser que ela já exista no quadro).');
        }
    };

    return (
        <div className="modal-overlay-print">
            <div className="modal-demonstrativo">
                <button className="btn-fechar-modal no-print" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="doc-header">
                    <div className="doc-logo-area">
                        <TrendingUp size={36} color="#2563eb" />
                        <div>
                            <h2>Sistema Denarius</h2>
                            <span>Inteligência em Precificação</span>
                        </div>
                    </div>
                    <div className="doc-info">
                        <h3>Demonstrativo de Custos</h3>
                        <p><strong>Emissão:</strong> {DATA(orcamento.criado_em)}</p>
                        <p><strong>Ref:</strong> #{orcamento.id || 'Novo'}</p>
                    </div>
                </div>

                <div className="doc-client-info">
                    <div className="info-box">
                        <span className="info-label">Cliente / Solicitante</span>
                        <span className="info-value">{orcamento.cliente || 'Consumidor Final'}</span>
                    </div>
                    <div className="info-box">
                        <span className="info-label">Produto / Serviço</span>
                        <span className="info-value">{orcamento.nome_produto}</span>
                    </div>
                </div>

                <div className="lista-financeira">
                    <div className="linha-lista header-lista">
                        <div className="coluna-desc">Descrição do Item</div>
                        <div className="coluna-valores">
                            <span className="col-peso">Peso (%)</span>
                            <span className="col-rs">Valor Final (R$)</span>
                        </div>
                    </div>

                    <div className="linha-lista destaque-topo">
                        <div className="coluna-desc">
                            <strong className="flex items-center gap-2"><FileText size={18}/> Preço de Venda Sugerido</strong>
                        </div>
                        <div className="coluna-valores">
                            <span className="col-peso font-bold">100,00%</span>
                            <span className="col-rs font-bold destaque-azul">{BRL(PV)}</span>
                        </div>
                    </div>

                    <div className="linha-lista">
                        <div className="coluna-desc">
                            <span className="titulo-item"><Receipt size={16}/> Custo Fixo Operacional</span>
                            <span className="badge-base">Base informada: {PCT(taxaFixo)}</span>
                        </div>
                        <div className="coluna-valores">
                            <span className="col-peso">{PCT((valorCustoFixo / PV) * 100)}</span>
                            <span className="col-rs">{BRL(valorCustoFixo)}</span>
                        </div>
                    </div>

                    <div className="linha-lista">
                        <div className="coluna-desc">
                            <span className="titulo-item"><DollarSign size={16}/> Impostos Gerais (NFe/Simples)</span>
                            <span className="badge-base">Base informada: {PCT(taxaImposto)}</span>
                        </div>
                        <div className="coluna-valores">
                            <span className="col-peso">{PCT((valorImposto / PV) * 100)}</span>
                            <span className="col-rs">{BRL(valorImposto)}</span>
                        </div>
                    </div>

                    <div className="linha-lista">
                        <div className="coluna-desc">
                            <span className="titulo-item"><Package size={16}/> Materiais / Insumos</span>
                            <span className="badge-base text-gray">Custo Direto</span>
                        </div>
                        <div className="coluna-valores">
                            <span className="col-peso">{PCT((valorMateriais / PV) * 100)}</span>
                            <span className="col-rs">{BRL(valorMateriais)}</span>
                        </div>
                    </div>

                    <div className="linha-lista">
                        <div className="coluna-desc">
                            <span className="titulo-item"><Hammer size={16}/> Mão de Obra Aplicada</span>
                            <span className="badge-base text-gray">Tempo x Valor Hora/Dia</span>
                        </div>
                        <div className="coluna-valores">
                            <span className="col-peso">{PCT(valorMaoObra > 0 ? (valorMaoObra / PV) * 100 : 0)}</span>
                            <span className="col-rs">{BRL(valorMaoObra > 0 ? valorMaoObra : 0)}</span>
                        </div>
                    </div>

                    <div className="linha-lista destaque-lucro">
                        <div className="coluna-desc">
                            <strong className="flex items-center gap-2 text-success"><CheckCircle size={20}/> Lucro Líquido Real</strong>
                            <span className="badge-base badge-success">Margem Garantida: {PCT(taxaLucro)}</span>
                        </div>
                        <div className="coluna-valores">
                            <span className="col-peso font-bold text-success">{PCT((valorLucro / PV) * 100)}</span>
                            <span className="col-rs font-bold text-success text-lg">{BRL(valorLucro)}</span>
                        </div>
                    </div>
                </div>

                <div className="doc-footer">
                    <p>Documento gerado automaticamente com base na metodologia de Markup Divisor.</p>
                </div>

                {/* --- AÇÕES ATUALIZADAS (Não saem na impressão) --- */}
                <div className="modal-actions no-print">
                    <button className="btn-aprovar-os" onClick={handleAprovarOS}>
                        <ArrowRightCircle size={20} /> Aprovar & Gerar O.S.
                    </button>
                    
                    <button className="btn-imprimir-doc" onClick={handlePrint}>
                        <Printer size={20} /> Imprimir Relatório Oficial
                    </button>
                </div>
            </div>
        </div>
    );
}