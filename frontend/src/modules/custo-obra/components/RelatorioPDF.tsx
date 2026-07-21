import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatarBRL } from '../../../utils/formatters';

// Estilos corporativos refinados para o PDF do TCC
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#0f172a' },
  header: { fontSize: 20, marginBottom: 4, textAlign: 'center', fontWeight: 'bold', color: '#1e293b' },
  subHeader: { textAlign: 'center', fontSize: 10, color: '#64748b', marginBottom: 25 },
  
  // Informações da Obra (Grid superior)
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  section: { width: '48%', padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' },
  label: { fontSize: 9, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', fontWeight: 'bold' },
  value: { fontSize: 13, color: '#0f172a', fontWeight: 'bold' },

  // Tabela de Recursos (Equipe Alocada)
  tableContainer: { marginTop: 10 },
  tableTitle: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 8, borderBottom: '1px solid #cbd5e1', paddingBottom: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 6, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #f1f5f9', padding: 8, alignItems: 'center' },
  
  colCargo: { width: '35%', fontSize: 9, fontWeight: 'bold', color: '#1e293b' },
  colQtd: { width: '15%', fontSize: 9, textAlign: 'center', color: '#475569' },
  colTempo: { width: '25%', fontSize: 9, textAlign: 'center', color: '#475569' },
  colSubtotal: { width: '25%', fontSize: 9, textAlign: 'right', fontWeight: 'bold', color: '#0f172a' },

  // Resultado Final em Destaque
  totalBox: { marginTop: 25, padding: 15, backgroundColor: '#0284c7', borderRadius: 8, textAlign: 'center' },
  totalLabel: { fontSize: 10, color: '#e0f2fe', fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase' },
  totalValue: { fontSize: 26, color: '#ffffff', fontWeight: 'bold' },

  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 10 }
});

// Contrato atualizado para receber os dados reais da obra e seus recursos alocados
export interface RecursoPdfDTO {
  funcao_nome: string;
  qtd_profissionais: number;
  horas_estimadas: number;
  custo_hora_aplicado: number;
}

interface RelatorioPDFProps {
  dados: {
    titulo: string;
    cliente: string;
    dataCriacao: string;
    recursos: RecursoPdfDTO[];
    custoTotalMaoDeObra: number;
  };
}

export const RelatorioPDF = ({ dados }: RelatorioPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Cabeçalho */}
        <Text style={styles.header}>Orçamento de Custo Direto (Mão de Obra)</Text>
        <Text style={styles.subHeader}>Sistema Denarius • Custeio ABC Industrial</Text>

        {/* Informações Cadastrais */}
        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Projeto / Obra</Text>
            <Text style={styles.value}>{dados.titulo}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{dados.cliente}</Text>
            <Text style={{fontSize: 8, color: '#94a3b8', marginTop: 2}}>Emitido em: {dados.dataCriacao}</Text>
          </View>
        </View>

        {/* Tabela de Equipe Alocada */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Detalhamento de Homem-Hora por Função</Text>
          
          {/* Cabeçalho da Tabela */}
          <View style={styles.tableHeader}>
            <Text style={styles.colCargo}>Função / Cargo</Text>
            <Text style={styles.colQtd}>Profissionais</Text>
            <Text style={styles.colTempo}>Tempo Total (h)</Text>
            <Text style={styles.colSubtotal}>Subtotal (R$)</Text>
          </View>

          {/* Linhas da Tabela */}
          {dados.recursos.map((rec, index) => {
            const subtotal = rec.horas_estimadas * rec.custo_hora_aplicado;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colCargo}>{rec.funcao_nome}</Text>
                <Text style={styles.colQtd}>{rec.qtd_profissionais}x</Text>
                <Text style={styles.colTempo}>{rec.horas_estimadas}h ({formatarBRL(rec.custo_hora_aplicado)}/h)</Text>
                <Text style={styles.colSubtotal}>{formatarBRL(subtotal)}</Text>
              </View>
            );
          })}
        </View>

        {/* Resultado Final em Destaque */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Custo Total Estimado (Mão de Obra)</Text>
          <Text style={styles.totalValue}>
            {formatarBRL(dados.custoTotalMaoDeObra)}
          </Text>
        </View>

        {/* Rodapé */}
        <Text style={styles.footer}>
          Documento gerado eletronicamente pelo Denarius System • Metodologia de Custeio Baseado em Atividades (ABC)
        </Text>
      </Page>
    </Document>
  );
};