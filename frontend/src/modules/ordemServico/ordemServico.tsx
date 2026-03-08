import React, { useState, useEffect } from 'react';
import { Clock, PenTool, AlertCircle, CheckCircle, Package, DollarSign, Calendar, Search, Filter } from 'lucide-react';
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

    // --- ESTADOS DOS FILTROS ---
    const [busca, setBusca] = useState('');
    const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos');
    const [mostrarAtrasados, setMostrarAtrasados] = useState(false);

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
            alert('Erro ao mover o cartão. A recarregar quadro...');
            carregarOrdens();
        }
    };

    // --- MOTOR DE FILTRAGEM ---
    const ordensFiltradas = ordens.filter(os => {
        // 1. Filtro de Texto (Nome, Produto ou ID)
        const termo = busca.toLowerCase();
        const matchBusca = os.cliente.toLowerCase().includes(termo) || 
                           os.nome_produto.toLowerCase().includes(termo) || 
                           os.os_id.toString().includes(termo);

        // 2. Filtro Financeiro
        const matchFin = filtroFinanceiro === 'todos' || os.status_financeiro === filtroFinanceiro;

        // 3. Filtro de Atraso
        let matchAtraso = true;
        if (mostrarAtrasados) {
            const dataEntrega = os.data_entrega ? new Date(os.data_entrega) : null;
            matchAtraso = dataEntrega ? dataEntrega < new Date() && os.status_producao !== 'entregue' : false;
        }

        return matchBusca && matchFin && matchAtraso;
    });

    const formatarMoeda = (valor: string | number) => Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatarData = (data?: string) => data ? new Date(data).toLocaleDateString('pt-BR') : 'Sem prazo';

    const getBadgeFinanceiro = (status: string) => {
        switch(status) {
            case 'pago': return <span className="badge-fin badge-pago"><DollarSign size={12}/> Pago</span>;
            case 'sinal_pago': return <span className="badge-fin badge-sinal"><DollarSign size={12}/> 50% Pago</span>;
            default: return <span className="badge-fin badge-pendente"><DollarSign size={12}/> Pendente</span>;
        }
    };

    if (loading) return <div className="loading-kanban">A carregar o quadro de produção...</div>;

    return (
        <div className="kanban-container">
            <div className="kanban-header">
                <div className="header-titles">
                    <h1>Gestão de Produção</h1>
                    <p>Controle de Ordens de Serviço e Fluxo de Fabrico</p>
                </div>

                {/* --- BARRA DE FILTROS PROFISSIONAL --- */}
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
                        <select 
                            value={filtroFinanceiro} 
                            onChange={(e) => setFiltroFinanceiro(e.target.value)}
                        >
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
                {COLUNAS.map(coluna => {
                    // Pega as ordens filtradas para esta coluna específica
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
        </div>
    );
}