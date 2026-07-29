import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
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
        }[];
        custoTotalMaoDeObra: number;
    }
}

// ESTILOS DO PDF
const styles = StyleSheet.create({
    page: { 
        padding: 40, 
        backgroundColor: '#ffffff', 
        fontFamily: 'Helvetica' 
    },
    header: { 
        marginBottom: 30, 
        textAlign: 'center' 
    },
    title: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1e293b', 
        marginBottom: 5 
    },
    subtitle: { 
        fontSize: 10, 
        color: '#64748b' 
    },
    infoRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 30 
    },
    infoBox: { 
        width: '48%', 
        padding: 15, 
        borderRadius: 8, 
        border: '1px solid #e2e8f0', 
        backgroundColor: '#f8fafc' 
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
        marginTop: 10 
    },
    table: { 
        width: '100%', 
        border: '1px solid #e2e8f0', 
        borderRadius: 8, 
        overflow: 'hidden' 
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#f1f5f9', 
        padding: 10, 
        borderBottom: '1px solid #e2e8f0' 
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
        backgroundColor: '#0f172a', 
        padding: 15, 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    totalLabel: { 
        fontSize: 12, 
        color: '#f8fafc', 
        fontWeight: 'bold' 
    },
    totalValue: { 
        fontSize: 16, 
        color: '#f97316', 
        fontWeight: 'bold' 
    }
});

// FUNÇÃO MÁGICA ATUALIZADA (Força Bruta):
// Vare o texto e quebra forçadamente palavras com mais de 20 caracteres sem espaço.
const protegerPalavrasLongas = (texto: string) => {
    if (!texto) return '';
    return texto.split(' ').map(palavra => {
        // Se a palavra tiver mais de 20 caracteres, injetamos um espaço real
        if (palavra.length > 20) {
            return palavra.match(/.{1,20}/g)?.join(' ') || palavra;
        }
        return palavra;
    }).join(' ');
};

export function RelatorioPDF({ dados }: RelatorioPDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                
                <View style={styles.header}>
                    <Text style={styles.title}>Orçamento de Custo Direto (Mão de Obra)</Text>
                    <Text style={styles.subtitle}>Sistema Denarius • Custeio ABC Industrial</Text>
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
                        <View style={styles.col3}><Text style={styles.colTextHeader}>Tempo (Horas)</Text></View>
                        <View style={styles.col4}><Text style={styles.colTextHeader}>Subtotal</Text></View>
                    </View>

                    {dados.recursos.map((recurso, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={styles.col1}>
                                <Text style={styles.colText}>{recurso.funcao_nome}</Text>
                            </View>
                            <View style={styles.col2}>
                                <Text style={styles.colText}>{recurso.qtd_profissionais}</Text>
                            </View>
                            <View style={styles.col3}>
                                <Text style={styles.colText}>{(recurso.horas_estimadas / recurso.qtd_profissionais).toFixed(1)} h</Text>
                            </View>
                            <View style={styles.col4}>
                                <Text style={styles.colText}>{formatarBRL(recurso.horas_estimadas * recurso.custo_hora_aplicado)}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Custo Direto Total Estimado</Text>
                        <Text style={styles.totalValue}>{formatarBRL(dados.custoTotalMaoDeObra)}</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}