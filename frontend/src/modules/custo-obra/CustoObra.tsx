import { useState } from 'react';
import { FileDown, Trash2, Search, AlertTriangle, Edit, XCircle, Loader2 } from 'lucide-react';
import { formatarBRL } from '../../utils/formatters';
import { useCustoObra } from './hooks/useCustoObra';
import { FormularioObra } from './components/FormularioObra';
import { RelatorioPDF } from './components/RelatorioPDF';
import { pdf } from '@react-pdf/renderer';
import type { ObraHistorico } from './services/custo-obra.service';
import './CustoObra.css';

export function CustoObra() {
    const { historico, isLoadingHistorico, carregarHistorico, pagination, deleteModal, obraEmEdicao, iniciarEdicao, cancelarEdicao } = useCustoObra();
    
    const [baixandoId, setBaixandoId] = useState<number | null>(null);

    const temFiltroAtivo = Boolean(pagination.searchTerm || pagination.dataInicio || pagination.dataFim);

    const handleDownloadPDF = async (item: ObraHistorico) => {
        try {
            setBaixandoId(item.id);
            const blob = await pdf(
                <RelatorioPDF dados={{
                    titulo: item.titulo, 
                    cliente: item.cliente,
                    dataCriacao: new Date(item.criado_em).toLocaleDateString('pt-BR'),
                    recursos: item.recursos || [], 
                    custoTotalMaoDeObra: Number(item.custo_total_estimado)
                }} />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Base-Calculo-${item.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Não foi possível gerar o arquivo PDF desta base.");
        } finally {
            setBaixandoId(null);
        }
    };

    return (
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>
                    Custo de Obra <span style={{ color: '#f97316' }}>ABC</span>
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '5px' }}>
                    Dimensionamento de mão de obra por função e centro de custo.
                </p>
            </header>

            <FormularioObra 
                onSalvarSucesso={carregarHistorico} 
                obraEmEdicao={obraEmEdicao} 
                onCancelarEdicao={cancelarEdicao} 
            />

            <section style={{ marginTop: '40px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)' }}>
                
                <div style={{ padding: '20px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>
                        Histórico de Bases de Cálculos
                    </h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', height: '38px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>DE</span>
                            <input
                                type="date"
                                value={pagination.dataInicio}
                                onChange={(e) => pagination.setDataInicio(e.target.value)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.85rem', colorScheme: 'light', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 12px', height: '38px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>ATÉ</span>
                            <input
                                type="date"
                                value={pagination.dataFim}
                                onChange={(e) => pagination.setDataFim(e.target.value)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.85rem', colorScheme: 'light', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ position: 'relative', width: '220px', height: '38px', flexShrink: 0 }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Obra ou Cliente..."
                                value={pagination.searchTerm}
                                onChange={(e) => pagination.setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: '100%', padding: '0 10px 0 34px', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>

                        {temFiltroAtivo && (
                            <button
                                onClick={pagination.limparFiltros}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 14px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', flexShrink: 0, transition: 'background-color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                title="Limpar todos os filtros"
                            >
                                <XCircle size={15} />
                                Limpar
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    {isLoadingHistorico ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Carregando histórico...</div>
                    ) : pagination.totalItems === 0 && !temFiltroAtivo ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px', margin: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            Nenhuma base de cálculo foi salva no sistema ainda.
                        </div>
                    ) : pagination.totalItems === 0 && temFiltroAtivo ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px', margin: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            Nenhum registro encontrado para o período ou busca informada.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '30%', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Obra / Projeto</th>
                                        <th style={{ width: '20%', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Cliente</th>
                                        <th style={{ width: '15%', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Data</th>
                                        <th style={{ width: '15%', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Custo Total</th>
                                        <th style={{ width: '20%', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff', transition: 'background-color 0.15s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                                        >
                                            <td 
                                                style={{ padding: '16px 20px', color: '#0f172a', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}
                                                title={item.titulo}
                                            >
                                                {item.titulo}
                                            </td>
                                            
                                            <td 
                                                style={{ padding: '16px 20px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.95rem' }}
                                                title={item.cliente}
                                            >
                                                {item.cliente}
                                            </td>
                                            
                                            <td style={{ padding: '16px 20px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                                                {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                                            </td>
                                            
                                            <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                                                {formatarBRL(Number(item.custo_total_estimado))}
                                            </td>
                                            
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={() => iniciarEdicao(item)}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef9c3', color: '#ca8a04', border: '1px solid #fde047', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        title="Editar Base de Cálculo"
                                                    >
                                                        <Edit size={17} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDownloadPDF(item)}
                                                        disabled={baixandoId === item.id}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', color: baixandoId === item.id ? '#94a3b8' : '#0284c7', border: '1px solid #bae6fd', padding: '8px', borderRadius: '6px', cursor: baixandoId === item.id ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                                                        title="Baixar Relatório em PDF"
                                                    >
                                                        {baixandoId === item.id ? (
                                                            <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                                                        ) : (
                                                            <FileDown size={17} />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => deleteModal.open(item.id)}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        title="Excluir Base de Cálculo"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Mostrando <strong style={{ color: '#0f172a' }}>{pagination.indexOfFirstItem + 1}</strong> a <strong style={{ color: '#0f172a' }}>{Math.min(pagination.indexOfLastItem, pagination.totalItems)}</strong> de <strong style={{ color: '#0f172a' }}>{pagination.totalItems}</strong> registros
                                </span>
                                
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button 
                                        onClick={() => pagination.setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={pagination.currentPage === 1}
                                        style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: pagination.currentPage === 1 ? '#cbd5e1' : '#334155', borderRadius: '6px', cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                        &lt;
                                    </button>
                                    {pagination.getVisiblePages().map(page => (
                                        <button 
                                            key={page}
                                            onClick={() => pagination.setCurrentPage(page)}
                                            style={{ padding: '6px 12px', backgroundColor: pagination.currentPage === page ? '#f97316' : '#ffffff', border: '1px solid', borderColor: pagination.currentPage === page ? '#f97316' : '#cbd5e1', color: pagination.currentPage === page ? '#ffffff' : '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: pagination.currentPage === page ? 'bold' : 'normal' }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => pagination.setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                                        style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: (pagination.currentPage === pagination.totalPages || pagination.totalPages === 0) ? '#cbd5e1' : '#334155', borderRadius: '6px', cursor: (pagination.currentPage === pagination.totalPages || pagination.totalPages === 0) ? 'not-allowed' : 'pointer' }}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {deleteModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ backgroundColor: '#fef2f2', padding: '8px', borderRadius: '50%', display: 'flex' }}><AlertTriangle color="#ef4444" size={24} /></div>
                            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>Excluir Base de Cálculo?</h3>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                            Tem certeza que deseja excluir esta base? Todos os recursos alocados serão perdidos. Esta ação <strong style={{color: '#f8fafc'}}>não</strong> poderá ser desfeita.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button onClick={deleteModal.close} style={{ padding: '10px 16px', backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
                            <button onClick={deleteModal.confirm} style={{ padding: '10px 16px', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={16} />Sim, excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}