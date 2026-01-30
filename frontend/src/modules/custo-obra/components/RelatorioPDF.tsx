import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { fontSize: 22, marginBottom: 10, textAlign: 'center', color: '#1e293b', fontWeight: 'bold' },
  subHeader: { textAlign: 'center', fontSize: 10, color: '#64748b', marginBottom: 30 },
  
  // Caixas de Informação
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  section: { width: '48%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 5 },
  label: { fontSize: 10, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 14, color: '#0f172a', fontWeight: 'bold' },

  // Área da Matemática
  mathContainer: { marginTop: 20, padding: 20, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' },
  mathTitle: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 10, borderBottom: '1px solid #cbd5e1', paddingBottom: 5 },
  mathStep: { fontSize: 10, color: '#475569', marginBottom: 8, lineHeight: 1.5 },
  mathEquation: { fontSize: 14, textAlign: 'center', marginVertical: 15, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  mathNote: { fontSize: 9, color: '#94a3b8', fontStyle: 'italic', marginTop: 5 },

  // Resultado Final
  totalBox: { marginTop: 30, padding: 20, backgroundColor: '#eff6ff', borderRadius: 8, textAlign: 'center', border: '2px solid #3b82f6' },
  totalLabel: { fontSize: 12, color: '#1e40af', fontWeight: 'bold', marginBottom: 5 },
  totalValue: { fontSize: 32, color: '#1d4ed8', fontWeight: 'bold' },

  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#cbd5e1', borderTop: '1px solid #e2e8f0', paddingTop: 10 }
});

// Interface atualizada para receber os números brutos
interface Props {
  dados: {
    titulo: string;
    data: string;
    custoMensal: number;
    // Dados para a fórmula
    tipoTempo: string;      // 'dias' ou 'horas'
    tempoInput: number;     // ex: 20
    qtdUnidades: number;    // ex: 5 (equipes)
    tipoOrganizacao: string; // 'individual' ou 'grupo'
    tamanhoGrupo?: number;   // ex: 2
    valorFinal: number;
  }
}

export const RelatorioPDF = ({ dados }: Props) => {
  // Cálculos auxiliares para exibição
  const capacidadeTotal = dados.tempoInput * dados.qtdUnidades;
  const termoUnidade = dados.tipoOrganizacao === 'grupo' 
    ? `${dados.qtdUnidades} Equipes` 
    : `${dados.qtdUnidades} Profissionais`;
  
  const termoCapacidade = dados.tipoTempo === 'dias' ? 'Dias' : 'Horas';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Cabeçalho */}
        <Text style={styles.header}>Relatório de Custo Operacional</Text>
        <Text style={styles.subHeader}>Sistema Denarius - Inteligência de Precificação</Text>

        {/* Informações Básicas */}
        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Cenário</Text>
            <Text style={styles.value}>{dados.titulo}</Text>
            <Text style={{fontSize: 9, color: '#94a3b8', marginTop: 2}}>{dados.data}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Custo Mensal (Folha)</Text>
            <Text style={styles.value}>
              R$ {dados.custoMensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </Text>
          </View>
        </View>

        {/* --- AQUI ESTÁ A MÁGICA: MEMÓRIA DE CÁLCULO --- */}
        <View style={styles.mathContainer}>
          <Text style={styles.mathTitle}>Memória de Cálculo (Passo a Passo)</Text>
          
          <Text style={styles.mathStep}>
            1. O sistema identificou um Custo Operacional Total de <Text style={{fontWeight:'bold'}}>R$ {dados.custoMensal.toLocaleString('pt-BR')}</Text>.
          </Text>
          
          <Text style={styles.mathStep}>
            2. A capacidade produtiva foi definida com base em <Text style={{fontWeight:'bold'}}>{termoUnidade}</Text> trabalhando <Text style={{fontWeight:'bold'}}>{dados.tempoInput} {termoCapacidade}</Text> no mês.
          </Text>

          <Text style={styles.mathStep}>
            3. A fórmula aplicada divide o custo total pela capacidade total de produção:
          </Text>

          {/* A FÓRMULA VISUAL */}
          <Text style={styles.mathEquation}>
            R$ {dados.custoMensal.toLocaleString('pt-BR')} ÷ ({dados.tempoInput} x {dados.qtdUnidades})
          </Text>
          
          <Text style={{textAlign:'center', fontSize: 10, color:'#64748b'}}>
            (Custo Total) ÷ (Tempo x Quantidade de Equipes/Pessoas)
          </Text>

           <Text style={styles.mathEquation}>
            = R$ {dados.custoMensal.toLocaleString('pt-BR')} ÷ {capacidadeTotal} {termoCapacidade} Totais
          </Text>

          <View style={{marginTop: 10, paddingTop: 10, borderTop: '1px dashed #cbd5e1'}}>
            <Text style={styles.mathNote}>
              * Nota: Este valor representa o custo mínimo de 1 {termoCapacidade} de trabalho de 
              {dados.tipoOrganizacao === 'grupo' ? ` uma Equipe de ${dados.tamanhoGrupo} pessoas` : ' um Profissional'}.
            </Text>
          </View>
        </View>

        {/* Resultado Final em Destaque */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>CUSTO DA UNIDADE DE TRABALHO</Text>
          <Text style={styles.totalValue}>
            R$ {dados.valorFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </Text>
          <Text style={{fontSize: 10, color: '#60a5fa', marginTop: 5}}>
            Por {dados.tipoTempo === 'dias' ? 'Dia' : 'Hora'} de {dados.tipoOrganizacao === 'grupo' ? 'Equipe' : 'Trabalho'}
          </Text>
        </View>

        <Text style={styles.footer}>
          Documento gerado automaticamente em {new Date().toLocaleString()} • Denarius System v1.0
        </Text>
      </Page>
    </Document>
  );
};