import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

const MASCOTE_PADRAO = require('@/components/assets/mascote/pose2-mascot2.svg');

export default function CategoriaAtividadeCard({
  titulo = 'Corrida',
  concluidas = 0,
  total = 0,
  imagem,
  corFundo = '#FF5D57',
  style,
  onPress,
}) {
  const concluidaTotalmente = total > 0 && concluidas >= total;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: corFundo },
        concluidaTotalmente && styles.cardConcluido,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageBox}>
        <Image
          source={imagem || MASCOTE_PADRAO}
          style={styles.image}
          contentFit="contain"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={styles.progresso}>
          {concluidas} de {total}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 220,
    borderRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 14,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardConcluido: {
    borderColor: '#1E293B',
  },
  imageBox: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    minHeight: 135,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  progresso: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 21,
  },
});