import { useState } from 'react';
import { Plus, Wallet, Briefcase, Search, RotateCcw, Download } from 'lucide-react';
import { useFuncionarios } from './hooks/useFuncionarios';
import { TabelaFuncionarios } from './components/TabelaFuncionarios';
import { FiltroHistorico } from './components/FiltroHistorico';
import { ModalFuncionario } from './components/ModalFuncionario';
import type { Funcionario } from './types';
import './Funcionarios.css'; 

export function Funcionarios() {
    // 1. CONECTANDO O CÉREBRO (HOOK)
    const { funcionarios, loading, salvar, excluir, buscarRelatorio } = useFuncionarios();

    // 2. ESTADOS DE UI
    const [termoBusca, setTermoBusca] = useState('');
    
    // Tipagem explícita nos states
    const [filtroSetor, setFiltroSetor] = useState<'todos' | 'producao' | 'administrativo'>('todos');
    const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
    
    // Controle do Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);

    // 3. LÓGICA DE FILTRO VISUAL
    const dadosFiltrados = funcionarios.filter(func => {
        const matchNome = func.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
                          (func.funcao || '').toLowerCase().includes(termoBusca.toLowerCase());
        const matchSetor = filtroSetor === 'todos' || func.setor === filtroSetor;
        const matchStatus = filtroStatus === 'todos' 
            ? true 
            : (filtroStatus === 'ativos' ? func.ativo : !func.ativo);
        
        return matchNome && matchSetor && matchStatus;
    });

    // 4. CÁLCULOS RÁPIDOS
    const custoFolha = funcionarios.filter(f => f.ativo).reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);
    const custoProducao = funcionarios.filter(f => f.ativo && f.setor === 'producao').reduce((acc, f) => acc + Number(f.custo_total_mensal), 0);
    const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // 5. HANDLERS
    const handleNovo = () => {
        setFuncionarioEdicao(null);
        setModalAberto(true);
    };

    const handleEditar = (func: Funcionario) => {
        setFuncionarioEdicao(func);
        setModalAberto(true);
    };

    const limparFiltros = () => {
        setTermoBusca('');
        setFiltroSetor('todos');
        setFiltroStatus('ativos');
    };

    const exportarCSV = () => {
        const cabecalho = "Nome,Funcao,Setor,Status,CustoMensal\n";
        const linhas = dadosFiltrados.map(f => 
            `${f.nome},${f.funcao},${f.setor},${f.ativo ? 'Ativo' : 'Inativo'},"${f.custo_total_mensal}"`
        ).join("\n");
        const blob = new Blob([cabecalho + linhas], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'funcionarios.csv'; a.click();
    };

    return (
        <div className="funcionarios-container">
            {/* CABEÇALHO & CARDS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <h1>Gestão de Equipe 👥</h1>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div className="card-resumo-mini">
                        <small><Wallet size={16} /> Folha Mensal (Ativa)</small>
                        <div className="valor">{loading ? '...' : BRL(custoFolha)}</div>
                    </div>
                    <div className="card-resumo-mini destaque">
                        <small><Briefcase size={16} /> Custo Produção (Ativa)</small>
                        <div className="valor">{loading ? '...' : BRL(custoProducao)}</div>
                    </div>
                </div>
            </div>

            {/* FILTRO HISTÓRICO (Componente Isolado) */}
            <FiltroHistorico onBuscar={buscarRelatorio} />

            {/* BARRA DE FERRAMENTAS */}
            <div className="toolbar" style={{ marginTop: '24px' }}>
                <div className="search-group">
                    <Search size={18} color="#94a3b8" />
                    <input 
                        placeholder="Buscar por nome ou função..." 
                        value={termoBusca} 
                        onChange={e => setTermoBusca(e.target.value)} 
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="filter-group">
                        {/* CORREÇÃO: Casting explícito removendo o 'any' */}
                        <select 
                            value={filtroSetor} 
                            onChange={e => setFiltroSetor(e.target.value as 'todos' | 'producao' | 'administrativo')}
                        >
                            <option value="todos">🏭 Todos os Setores</option>
                            <option value="producao">🛠️ Produção</option>
                            <option value="administrativo">💻 Administrativo</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        {/* CORREÇÃO: Casting explícito removendo o 'any' */}
                        <select 
                            value={filtroStatus} 
                            onChange={e => setFiltroStatus(e.target.value as 'todos' | 'ativos' | 'inativos')}
                        >
                            <option value="todos">🌗 Todos Status</option>
                            <option value="ativos">✅ Apenas Ativos</option>
                            <option value="inativos">⛔ Apenas Inativos</option>
                        </select>
                    </div>

                    <button className="btn-reset" onClick={limparFiltros} title="Limpar Filtros"><RotateCcw size={18} /></button>
                    <button className="btn-icon btn-expand" onClick={exportarCSV} title="Exportar CSV" style={{background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', width:'40px', height:'40px'}}><Download size={18} /></button>
                    
                    <button className="btn-novo" onClick={handleNovo}>
                        <Plus size={20} /> Novo Colaborador
                    </button>
                </div>
            </div>

            {/* TABELA (Componente Isolado) */}
            <TabelaFuncionarios 
                funcionarios={dadosFiltrados} 
                loading={loading} 
                onEditar={handleEditar} 
                onExcluir={excluir} 
            />

            {/* MODAL (Componente Isolado) */}
            {modalAberto && (
                <ModalFuncionario 
                    funcionarioEdicao={funcionarioEdicao} 
                    onClose={() => setModalAberto(false)} 
                    onSalvar={salvar} 
                />
            )}
        </div>
    );
}