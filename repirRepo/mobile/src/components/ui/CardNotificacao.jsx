import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

export default function CardNotificacao({ titulo, tempo, iconeMascote }) {
  return (
    <View style={styles.card}>
      {/* ILUSTRAÇÃO / MASCOTE À ESQUERDA */}
      <View style={styles.mascotContainer}>
        <Image
          source={iconeMascote || require('../assets/mascote/pose1-mascot1.svg')}
          style={styles.mascot}
          contentFit="contain"
        />
      </View>

      {/* CONTEÚDO DE TEXTO À DIREITA */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {titulo}
        </Text>
        <Text style={styles.time}>
          {tempo}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 96,
    backgroundColor: '#FFFBEA', // Tom de fundo creme suave idêntico ao da referência
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    // Borda subtil ou sombra se necessário
    borderWidth: 1,
    borderColor: '#F2E8C4',
  },
  mascotContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D2F522', // Fundo verde-lima da onda/mascote
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  mascot: {
    width: 52,
    height: 52,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    lineHeight: 18,
    color: '#111827',
    marginBottom: 4,
  },
  time: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 15,
    color: '#6B7280',
  },
});