import React, { useState, useEffect } from 'react';
import { Clock, PenTool, AlertCircle, CheckCircle, Package, DollarSign, Calendar, Search, Filter, X, User, Tag, Printer } from 'lucide-react';
import { OrdemServicoService } from './services/ordemServico.service';
import type { OrdemServico } from './types';
import './ordemServico.css';

const COLUNAS = [
    { id: 'fila', titulo: 'Fila de Espera', icone: <Clock size={18} /> },
    { id: 'producao', titulo: 'Em Produção', icone: <PenTool size={18} /> },
    { id: 'pausado', titulo: 'Pausado / Faltam Peças', icone: <AlertCircle size={18} /> },
    { id: 'pronto', titulo: 'Pronto', icone: <CheckCircle size={18} /> },
    { id: 'entregue', titulo: 'Entregue', icone: <Package size={18} /> }
];

export function OrdemServicoKanban() {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [busca, setBusca] = useState('');
    const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos');
    const [mostrarAtrasados, setMostrarAtrasados] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState('todos');

    // --- NOVO: Estado para o Modal de Detalhes ---
    const [osSelecionada, setOsSelecionada] = useState<OrdemServico | null>(null);

    useEffect(() => {
        carregarOrdens();
    }, []);

    const carregarOrdens = async () => {
        try {
            const data = await OrdemServicoService.listarTodas();
            setOrdens(data);
        } catch (error) {
            console.error("Erro ao carregar O.S.", error);
        } finally {
            setLoading(false);
        }
    };

    // --- DRAG AND DROP ---
    const handleDragStart = (e: React.DragEvent, osId: number) => {
        e.dataTransfer.setData('osId', osId.toString());
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

    const handleDrop = async (e: React.DragEvent, novaColuna: string) => {
        e.preventDefault();
        const osId = parseInt(e.dataTransfer.getData('osId'));

        setOrdens(prev => prev.map(os => 
            os.os_id === osId ? { ...os, status_producao: novaColuna as OrdemServico['status_producao'] } : os
        ));

        try {
            await OrdemServicoService.atualizarStatus(osId, novaColuna);
        } catch (error) {
            console.error("Falha ao mover a O.S:", error);
            alert('Erro ao mover o cartão. Recarregando quadro...');
            carregarOrdens();
        }
    };

    // --- NOVO: FUNÇÃO PARA ATUALIZAR STATUS FINANCEIRO ---
    const atualizarFinanceiro = async (novoStatus: OrdemServico['status_financeiro']) => {
        if (!osSelecionada) return;

        // Atualiza a interface instantaneamente
        setOrdens(prev => prev.map(os => 
            os.os_id === osSelecionada.os_id ? { ...os, status_financeiro: novoStatus } : os
        ));
        setOsSelecionada({ ...osSelecionada, status_financeiro: novoStatus }); // Atualiza o modal também

        // Salva no banco de dados
        try {
            await OrdemServicoService.atualizarStatus(osSelecionada.os_id, undefined, novoStatus);
        } catch (error) {
            console.error("Falha ao atualizar financeiro:", error);
            alert('Erro ao atualizar pagamento. Recarregando...');
            carregarOrdens();
        }
    };

    // --- FILTRAGEM ---
    const ordensFiltradas = ordens.filter(os => {
        const termo = busca.toLowerCase();
        const matchBusca = (os.cliente || '').toLowerCase().includes(termo) || 
                           (os.nome_produto || '').toLowerCase().includes(termo) || 
                           os.os_id.toString().includes(termo);

        const matchFin = filtroFinanceiro === 'todos' || os.status_financeiro === filtroFinanceiro;

        let matchAtraso = true;
        if (mostrarAtrasados) {
            const dataEntrega = os.data_entrega ? new Date(os.data_entrega) : null;
            matchAtraso = dataEntrega ? dataEntrega < new Date() && os.status_producao !== 'entregue' : false;
        }

        return matchBusca && matchFin && matchAtraso;
    });

    // --- FORMATAÇÕES ---
    const formatarMoeda = (valor: string | number) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatarData = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : 'Sem prazo';

    const getBadgeFinanceiro = (status: string) => {
        switch(status) {
            case 'pago': return <span className="badge-fin badge-pago"><DollarSign size={12}/> Pago</span>;
            case 'sinal_pago': return <span className="badge-fin badge-sinal"><DollarSign size={12}/> 50% Pago</span>;
            default: return <span className="badge-fin badge-pendente"><DollarSign size={12}/> Pendente</span>;
        }
    };

    if (loading) return <div className="loading-kanban">Carregando o quadro de produção...</div>;

    return (
        <div className="kanban-container">
            <div className="kanban-header">
                <div className="header-titles">
                    <h1>Gestão de Produção</h1>
                    <p>Controle de Ordens de Serviço e Fluxo de Fabrico</p>
                </div>

                <div className="kanban-toolbar">
                    <div className="search-box">
                        <Search size={18} color="#64748b" />
                        <input 
                            type="text" 
                            placeholder="Buscar cliente, produto ou #ID..." 
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                    
                    <div className="filtros-box">
                        <Filter size={18} color="#64748b" />
                        
                        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                            <option value="todos">Visão Geral (Kanban)</option>
                            <option value="fila">1. Fila de Espera</option>
                            <option value="producao">2. Em Produção</option>
                            <option value="pausado">3. Pausados / Faltam Peças</option>
                            <option value="pronto">4. Prontos</option>
                            <option value="entregue">5. Entregues</option>
                        </select>

                        <select value={filtroFinanceiro} onChange={(e) => setFiltroFinanceiro(e.target.value)}>
                            <option value="todos">Todos os Pagamentos</option>
                            <option value="pendente">Apenas Pendentes</option>
                            <option value="sinal_pago">Sinal Pago (50%)</option>
                            <option value="pago">Totalmente Pago</option>
                        </select>

                        <label className="checkbox-atraso">
                            <input 
                                type="checkbox" 
                                checked={mostrarAtrasados}
                                onChange={(e) => setMostrarAtrasados(e.target.checked)}
                            />
                            <span>⚠️ Apenas Atrasados</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="kanban-board">
                {COLUNAS
                    .filter(coluna => filtroStatus === 'todos' || coluna.id === filtroStatus)
                    .map(coluna => {
                        const ordensDaColuna = ordensFiltradas.filter(os => os.status_producao === coluna.id);
                        return (
                            <div 
                                key={coluna.id} 
                                className="kanban-column"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, coluna.id)}
                            >
                                <div className="column-header">
                                    {coluna.icone}
                                    <h2>{coluna.titulo}</h2>
                                    <span className="card-count">{ordensDaColuna.length}</span>
                                </div>

                                <div className="column-body">
                                    {ordensDaColuna.length === 0 ? (
                                        <div className="empty-column">Nenhuma O.S. aqui</div>
                                    ) : (
                                        ordensDaColuna.map(os => (
                                            <div 
                                                key={os.os_id} 
                                                className="kanban-card"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, os.os_id)}
                                                onDoubleClick={() => setOsSelecionada(os)} 
                                                title="Dê dois cliques para abrir os detalhes"
                                            >
                                                <div className="card-top">
                                                    <span className="os-numero">#{os.os_id}</span>
                                                    {getBadgeFinanceiro(os.status_financeiro)}
                                                </div>
                                                
                                                <h3 className="cliente-nome">{os.cliente || 'Consumidor Final'}</h3>
                                                <p className="produto-nome">{os.nome_produto}</p>
                                                
                                                <div className="card-footer">
                                                    <span className="valor-os">{formatarMoeda(os.preco_venda)}</span>
                                                    <span className={`prazo-os ${new Date(os.data_entrega || '') < new Date() && os.status_producao !== 'entregue' ? 'atrasado' : ''}`}>
                                                        <Calendar size={12}/> {formatarData(os.data_entrega)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                })}
            </div>

            {/* --- MODAL DE DETALHES DA ORDEM DE SERVIÇO --- */}
            {osSelecionada && (
                <div className="modal-overlay">
                    <div className="modal-os">
                        <div className="modal-os-header">
                            <div>
                                <h2>Detalhes da Ordem #{osSelecionada.os_id}</h2>
                                <span className="modal-coluna-atual no-print">
                                    Encontra-se em: <strong>{COLUNAS.find(c => c.id === osSelecionada.status_producao)?.titulo}</strong>
                                </span>
                            </div>
                            <button className="btn-close no-print" onClick={() => setOsSelecionada(null)}><X size={24} /></button>
                        </div>

                        <div className="modal-os-body">
                            <div className="os-info-grid">
                                <div className="os-info-box">
                                    <User size={18} color="#64748b"/>
                                    <div>
                                        <label>Cliente</label>
                                        <p>{osSelecionada.cliente || 'Consumidor Final'}</p>
                                    </div>
                                </div>
                                <div className="os-info-box">
                                    <Tag size={18} color="#64748b"/>
                                    <div>
                                        <label>Produto / Serviço</label>
                                        <p>{osSelecionada.nome_produto}</p>
                                    </div>
                                </div>
                                <div className="os-info-box">
                                    <DollarSign size={18} color="#64748b"/>
                                    <div>
                                        <label>Valor Fechado</label>
                                        <p className="valor-destaque">{formatarMoeda(osSelecionada.preco_venda)}</p>
                                    </div>
                                </div>
                                <div className="os-info-box">
                                    <Calendar size={18} color="#64748b"/>
                                    <div>
                                        <label>Prazo de Entrega</label>
                                        <p>{formatarData(osSelecionada.data_entrega)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="os-financeiro-panel">
                                <h3 className="no-print">Status de Pagamento</h3>
                                <p className="no-print">Atualize a situação financeira desta ordem de serviço:</p>
                                <div className="botoes-financeiro no-print">
                                    <button 
                                        className={`btn-fin btn-pendente ${osSelecionada.status_financeiro === 'pendente' ? 'ativo' : ''}`}
                                        onClick={() => atualizarFinanceiro('pendente')}
                                    >
                                        🔴 Pendente
                                    </button>
                                    <button 
                                        className={`btn-fin btn-sinal ${osSelecionada.status_financeiro === 'sinal_pago' ? 'ativo' : ''}`}
                                        onClick={() => atualizarFinanceiro('sinal_pago')}
                                    >
                                        🟡 Sinal Pago (50%)
                                    </button>
                                    <button 
                                        className={`btn-fin btn-pago ${osSelecionada.status_financeiro === 'pago' ? 'ativo' : ''}`}
                                        onClick={() => atualizarFinanceiro('pago')}
                                    >
                                        🟢 Totalmente Pago
                                    </button>
                                </div>

                                {/* 👇 BOTÃO DE IMPRESSÃO ADICIONADO AQUI 👇 */}
                                <div className="os-acoes-finais no-print" style={{marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px'}}>
                                    <button className="btn-print-os" onClick={() => window.print()}>
                                        <Printer size={18} /> Imprimir Ficha de Produção
                                    </button>
                                </div>
                            </div>
                            
                            {/* 👇 AQUI COMEÇA O TEMPLATE EXCLUSIVO PARA O PAPEL 👇 */}
                            <div className="print-layout">
                                <div className="print-header">
                                    <h1>FICHA DE PRODUÇÃO</h1>
                                    <h2>Ordem de Serviço #{osSelecionada.os_id}</h2>
                                </div>

                                <div className="print-info-grid">
                                    <div className="print-box">
                                        <strong>Cliente:</strong><br/>
                                        {osSelecionada.cliente || 'Consumidor Final'}
                                    </div>
                                    <div className="print-box">
                                        <strong>Produto / Serviço:</strong><br/>
                                        {osSelecionada.nome_produto}
                                    </div>
                                    <div className="print-box" style={{ gridColumn: 'span 2' }}>
                                        <strong>Prazo de Entrega Acordado:</strong> {formatarData(osSelecionada.data_entrega)}
                                    </div>
                                </div>

                                <div className="print-section">
                                    <h3>Observações / Medidas Específicas</h3>
                                    <div className="print-lines"></div>
                                    <div className="print-lines"></div>
                                    <div className="print-lines"></div>
                                </div>

                                <div className="print-section">
                                    <h3>Checklist de Produção</h3>
                                    <div className="print-check-item"><span className="box"></span> Separação de Materiais</div>
                                    <div className="print-check-item"><span className="box"></span> Execução / Montagem</div>
                                    <div className="print-check-item"><span className="box"></span> Acabamento / Revisão Final</div>
                                    <div className="print-check-item"><span className="box"></span> Embalagem / Pronto para Entrega</div>
                                </div>

                                <div className="print-signatures">
                                    <div className="sig-line">
                                        <hr/>
                                        <span>Responsável pela Produção</span>
                                    </div>
                                    <div className="sig-line">
                                        <hr/>
                                        <span>Controle de Qualidade</span>
                                    </div>
                                </div>
                            </div>
                            {/* 👆 FIM DO TEMPLATE DO PAPEL 👆 */}
                            
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}