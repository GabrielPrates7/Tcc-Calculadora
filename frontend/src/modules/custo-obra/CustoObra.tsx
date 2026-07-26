import { FileDown, Trash2, Search, AlertTriangle, Edit } from 'lucide-react'; // <-- Edit Importado aqui
import { formatarBRL } from '../../utils/formatters';
import { useCustoObra } from './hooks/useCustoObra';
import { FormularioObra } from './components/FormularioObra';
import { RelatorioPDF } from './components/RelatorioPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

export function CustoObra() {
    const { historico, isLoadingHistorico, carregarHistorico, pagination, deleteModal, obraEmEdicao, iniciarEdicao, cancelarEdicao } = useCustoObra();

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

            {/* Injeção das propriedades de edição no Formulário */}
            <FormularioObra 
                onSalvarSucesso={carregarHistorico} 
                obraEmEdicao={obraEmEdicao} 
                onCancelarEdicao={cancelarEdicao} 
            />

            <section style={{ marginTop: '40px', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                
                <div style={{ padding: '20px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0, fontWeight: 'bold' }}>
                        Histórico de Bases de Cálculos
                    </h2>
                    
                    <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Buscar por Obra ou Cliente..."
                            value={pagination.searchTerm}
                            onChange={(e) => pagination.setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '6px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.2s' }}
                            onFocus={(e) => e.target.style.borderColor = '#f97316'}
                            onBlur={(e) => e.target.style.borderColor = '#475569'}
                        />
                    </div>
                </div>

                <div>
                    {isLoadingHistorico ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Carregando histórico...</div>
                    ) : pagination.totalItems === 0 && pagination.searchTerm === '' ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', margin: '20px', border: '1px dashed #475569', borderRadius: '8px', backgroundColor: '#0f172a' }}>
                            Nenhuma base de cálculo foi salva no sistema ainda.
                        </div>
                    ) : pagination.totalItems === 0 && pagination.searchTerm !== '' ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', margin: '20px', border: '1px dashed #475569', borderRadius: '8px', backgroundColor: '#0f172a' }}>
                            Nenhum registro encontrado para "{pagination.searchTerm}".
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Obra / Projeto</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Cliente</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Data de Criação</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Custo Mão de Obra</th>
                                        <th style={{ padding: '15px 20px', borderBottom: '1px solid #334155', textAlign: 'center', backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historico.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #334155', backgroundColor: '#1e293b' }}>
                                            <td style={{ padding: '15px 20px', color: '#f8fafc', fontWeight: '500' }}>{item.titulo}</td>
                                            <td style={{ padding: '15px 20px', color: '#94a3b8' }}>{item.cliente}</td>
                                            <td style={{ padding: '15px 20px', color: '#94a3b8' }}>{new Date(item.criado_em).toLocaleDateString('pt-BR')}</td>
                                            <td style={{ padding: '15px 20px', color: '#f97316', fontWeight: 'bold' }}>{formatarBRL(Number(item.custo_total_estimado))}</td>
                                            <td style={{ padding: '15px 20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                
                                                {/* BOTÃO DE EDITAR ADICIONADO AQUI */}
                                                <button
                                                    onClick={() => iniciarEdicao(item)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#10b981', border: '1px solid #047857', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="Editar Base de Cálculo"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <PDFDownloadLink
                                                    document={
                                                        <RelatorioPDF dados={{
                                                            titulo: item.titulo, cliente: item.cliente,
                                                            dataCriacao: new Date(item.criado_em).toLocaleDateString('pt-BR'),
                                                            recursos: item.recursos, custoTotalMaoDeObra: Number(item.custo_total_estimado)
                                                        }} />
                                                    }
                                                    fileName={`Base-Calculo-${item.titulo}.pdf`}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#38bdf8', border: '1px solid #0369a1', padding: '8px', borderRadius: '6px', textDecoration: 'none' }}
                                                    title="Baixar Relatório em PDF"
                                                >
                                                    {({ loading }) => (loading ? <span style={{ fontSize: '0.7rem', padding: '0 5px' }}>...</span> : <FileDown size={18} />)}
                                                </PDFDownloadLink>

                                                <button
                                                    onClick={() => deleteModal.open(item.id)}
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#ef4444', border: '1px solid #7f1d1d', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="Excluir Base de Cálculo"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {/* Rodapé de Paginação */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #334155', backgroundColor: '#0f172a', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Mostrando <strong style={{ color: '#f8fafc' }}>{pagination.indexOfFirstItem + 1}</strong> a <strong style={{ color: '#f8fafc' }}>{Math.min(pagination.indexOfLastItem, pagination.totalItems)}</strong> de <strong style={{ color: '#f8fafc' }}>{pagination.totalItems}</strong> registros
                                </span>
                                
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button 
                                        onClick={() => pagination.setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={pagination.currentPage === 1}
                                        style={{ padding: '6px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: pagination.currentPage === 1 ? '#475569' : '#cbd5e1', borderRadius: '6px', cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                    >
                                        &lt;
                                    </button>
                                    {pagination.getVisiblePages().map(page => (
                                        <button 
                                            key={page}
                                            onClick={() => pagination.setCurrentPage(page)}
                                            style={{ padding: '6px 12px', backgroundColor: pagination.currentPage === page ? '#f97316' : '#1e293b', border: '1px solid', borderColor: pagination.currentPage === page ? '#f97316' : '#334155', color: pagination.currentPage === page ? '#ffffff' : '#cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: pagination.currentPage === page ? 'bold' : 'normal' }}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => pagination.setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                                        style={{ padding: '6px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: (pagination.currentPage === pagination.totalPages || pagination.totalPages === 0) ? '#475569' : '#cbd5e1', borderRadius: '6px', cursor: (pagination.currentPage === pagination.totalPages || pagination.totalPages === 0) ? 'not-allowed' : 'pointer' }}
                                    >
                                        &gt;
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal de Exclusão Oculto */}
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