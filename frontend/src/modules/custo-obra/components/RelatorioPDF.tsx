import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatarBRL } from '../../../utils/formatters';

interface RelatorioPDFProps {
    dados: {
        titulo: string;
        cliente: string;
        dataCriacao: string;
        recursos: {
            funcao_id: number;
            funcao_nome: string;
            qtd_profissionais: number;
            horas_estimadas: number;
            custo_hora_aplicado: number;
            unidade_tempo?: 'horas' | 'dias';
        }[];
        custoTotalMaoDeObra: number;
    }
}

// ESTILOS DO PDF - DESIGN FINAL (Fundo branco, texto preto, logo branca/escura)
const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        backgroundColor: '#ffffff', 
        fontFamily: 'Helvetica' 
    },
    headerBanner: {
        backgroundColor: '#ffffff', // ✅ Fundo branco onde você marcou o X
        paddingBottom: 20,
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0' // ✅ Fio elegante para separar do resto
    },
    logoContainer: {
        width: 85, // Tamanho elegante
    },
    logo: {
        width: '100%',
        height: 'auto'
    },
    headerTextContainer: {
        alignItems: 'flex-end'
    },
    titleDark: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#0f172a', // ✅ Texto principal Preto/Escuro
        marginBottom: 4 
    },
    subtitleDark: { 
        fontSize: 9, 
        color: '#64748b', // ✅ Subtítulo cinza elegante
        textTransform: 'uppercase'
    },
    infoRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 30 
    },
    infoBox: { 
        width: '48%', 
        padding: 12, 
        borderRadius: 6, 
        border: '1px solid #cbd5e1', 
        backgroundColor: '#ffffff' 
    },
    infoLabel: { 
        fontSize: 8, 
        color: '#64748b', 
        textTransform: 'uppercase', 
        marginBottom: 6 
    },
    infoValue: { 
        fontSize: 12, 
        color: '#0f172a', 
        fontWeight: 'bold',
        lineHeight: 1.4
    },
    infoDate: { 
        fontSize: 8, 
        color: '#94a3b8', 
        marginTop: 8 
    },
    table: { 
        width: '100%', 
        border: '1px solid #cbd5e1', 
        borderRadius: 6, 
        overflow: 'hidden' 
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#f8fafc', 
        padding: 10, 
        borderBottom: '1px solid #cbd5e1' 
    },
    tableRow: { 
        flexDirection: 'row', 
        padding: 10, 
        borderBottom: '1px solid #e2e8f0' 
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'center' },
    col3: { width: '20%', textAlign: 'center' },
    col4: { width: '20%', textAlign: 'right' },
    colTextHeader: { 
        fontSize: 9, 
        color: '#475569', 
        fontWeight: 'bold', 
        textTransform: 'uppercase' 
    },
    colText: { 
        fontSize: 10, 
        color: '#1e293b' 
    },
    totalRow: { 
        flexDirection: 'row', 
        backgroundColor: '#ffffff', 
        padding: 15, 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '2px solid #0f172a' 
    },
    totalLabel: { 
        fontSize: 11, 
        color: '#0f172a', 
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    totalValue: { 
        fontSize: 16, 
        color: '#0f172a', 
        fontWeight: 'bold' 
    }
});

const protegerPalavrasLongas = (texto: string) => {
    if (!texto) return '';
    return texto.split(' ').map(palavra => {
        if (palavra.length > 20) {
            return palavra.match(/.{1,20}/g)?.join(' ') || palavra;
        }
        return palavra;
    }).join(' ');
};

const HORAS_PADRAO_DIA = 8;

export function RelatorioPDF({ dados }: RelatorioPDFProps) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                <View style={styles.headerBanner}>
                    <View style={styles.logoContainer}>
                        {/* ✅ Mantido o arquivo da logo branca conforme você pediu */}
                        <Image src={`${baseUrl}/logo-denarius-branca.png`} style={styles.logo} />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.titleDark}>Orçamento Custo Direto</Text>
                        <Text style={styles.subtitleDark}>Mão de Obra • Sistema Denarius</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Projeto / Obra</Text>
                        <Text style={styles.infoValue}>{protegerPalavrasLongas(dados.titulo)}</Text>
                    </View>
                    
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Cliente</Text>
                        <Text style={styles.infoValue}>{protegerPalavrasLongas(dados.cliente)}</Text>
                        <Text style={styles.infoDate}>Emitido em: {dados.dataCriacao}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.col1}><Text style={styles.colTextHeader}>Função / Cargo</Text></View>
                        <View style={styles.col2}><Text style={styles.colTextHeader}>Profissionais</Text></View>
                        <View style={styles.col3}><Text style={styles.colTextHeader}>Tempo Alocado</Text></View>
                        <View style={styles.col4}><Text style={styles.colTextHeader}>Subtotal</Text></View>
                    </View>

                    {dados.recursos.map((recurso, index) => {
                        const isDia = recurso.unidade_tempo === 'dias';
                        const horasIndividuais = recurso.horas_estimadas / recurso.qtd_profissionais;
                        
                        const valorTempoExibicao = isDia 
                            ? (horasIndividuais / HORAS_PADRAO_DIA) 
                            : horasIndividuais;
                        
                        const labelUnidade = isDia ? 'dias' : 'h';

                        return (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.col1}>
                                    <Text style={styles.colText}>{recurso.funcao_nome}</Text>
                                </View>
                                <View style={styles.col2}>
                                    <Text style={styles.colText}>{recurso.qtd_profissionais}</Text>
                                </View>
                                <View style={styles.col3}>
                                    <Text style={styles.colText}>{valorTempoExibicao.toFixed(1)} {labelUnidade}</Text>
                                </View>
                                <View style={styles.col4}>
                                    <Text style={styles.colText}>{formatarBRL(recurso.horas_estimadas * recurso.custo_hora_aplicado)}</Text>
                                </View>
                            </View>
                        );
                    })}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Custo Total (Mão de Obra)</Text>
                        <Text style={styles.totalValue}>{formatarBRL(dados.custoTotalMaoDeObra)}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}