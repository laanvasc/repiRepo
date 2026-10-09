import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function CardNotificacao({
  titulo = 'Lembrete: Corrida às 18h hoje',
  tempo = 'Há 10 min',
  lida = false,
}) {
  return (
    <View style={styles.card}>
      {/* Ícone Circular de Sino */}
      <View style={styles.iconCircle}>
        <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
      </View>

      {/* Conteúdo de Texto */}
      <View style={styles.contentContainer}>
        <Text numberOfLines={1} style={styles.titleText}>
          {titulo}
        </Text>
        <Text style={styles.timeText}>{tempo}</Text>
      </View>

      {/* Indicador de Não Lida (Bolinha preta/escura) */}
      {!lida && <View style={styles.unreadDot} />}
    </View>
  );
}

export default CardNotificacao;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF5733', // Borda laranja fina do tema
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF5733', // Fundo laranja vibrante
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    paddingRight: 12,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A', // Ponto indicador escuro
  },
});