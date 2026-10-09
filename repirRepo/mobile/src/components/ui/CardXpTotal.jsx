import { StyleSheet, Text, View } from 'react-native';

export function CardXpTotal({
  nivel = 7,
  xpTotal = 1250,
  xpAtualNivel = 250,
  xpNecessarioNivel = 500,
}) {
  // Cálculo da porcentagem da barra de progresso
  const progresso = Math.min(Math.max(xpAtualNivel / xpNecessarioNivel, 0), 1) * 100;
  const xpRestante = xpNecessarioNivel - xpAtualNivel;

  return (
    <View style={styles.card}>
      {/* Título do Nível */}
      <Text style={styles.nivelText}>Nível {nivel}</Text>

      {/* Subtítulo XP Total */}
      <Text style={styles.xpTotalText}>
        {xpTotal.toLocaleString('pt-BR')} XP total
      </Text>

      {/* Barra de Progresso */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
      </View>

      {/* Legenda XP para o Próximo Nível */}
      <Text style={styles.legendaText}>
        {xpRestante} XP para o Nível {nivel + 1}
      </Text>
    </View>
  );
}

export default CardXpTotal;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FF5733', // Laranja vibrante do tema
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 8,
  },
  nivelText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  xpTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#F3F8BD', // Fundo amarelo bem claro da barra
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D2F500', // Verde-lima/amarelo destacado
    borderRadius: 5,
  },
  legendaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});