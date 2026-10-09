import { StyleSheet, Text, View } from 'react-native';

export function CardSemanaQuantAtividades({
  semana = 12,
  concluidas = 4,
  total = 5,
}) {
  // Cálculo da porcentagem de progresso (evita divisão por zero)
  const percentual = total > 0 ? Math.min((concluidas / total) * 100, 100) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.semanaText}>Semana {semana}</Text>
      <Text style={styles.statusText}>
        {concluidas} de {total} atividades concluídas
      </Text>

      {/* Barra de Progresso */}
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${percentual}%` }]} />
      </View>
    </View>
  );
} 

export default CardSemanaQuantAtividades;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  semanaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151522',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151522',
    marginBottom: 16,
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#FCD8CD', // Fundo da barra (laranja claro)
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5E32', // Preenchimento da barra (laranja vibrante)
    borderRadius: 6,
  },
});