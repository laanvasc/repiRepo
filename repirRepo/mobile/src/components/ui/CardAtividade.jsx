import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function CardAtividade({
  titulo = 'Treino Abdominal',
  categoria = 'Corrida',
  concluido = true,
  icone = require('@/components/assets/icones/icone-notificacao3x.png'), // Ajuste para o ícone desejado
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        concluido ? styles.cardConcluido : styles.cardNaoConcluido,
      ]}
    >
      {/* Círculo Esquerdo com Ícone */}
      <View style={styles.iconContainer}>
        <Image source={icone} contentFit="contain" style={styles.icon} />
      </View>

      {/* Conteúdo Central: Título e Tag de Categoria */}
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.titulo,
            concluido ? styles.textEscuro : styles.textClaro,
          ]}
          numberOfLines={1}
        >
          {titulo}
        </Text>

        <View style={styles.badgeCategoria}>
          <Text style={styles.badgeText}>{categoria}</Text>
        </View>
      </View>

      {/* Ícone de Status do Lado Direito (Check ou X) */}
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusIcon,
            concluido ? styles.textEscuro : styles.textClaro,
          ]}
        >
          {concluido ? '✓' : '✕'}
        </Text>
      </View>
    </Pressable>
  );
}

export default CardAtividade;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 40, // Formato pílula arredondado como na imagem
    marginBottom: 12,
  },
  cardConcluido: {
    backgroundColor: '#D2F522', // Verde-lima vibrante
  },
  cardNaoConcluido: {
    backgroundColor: '#FF5E57', // Vermelho/Laranja vibrante
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    width: 24,
    height: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '800',
  },
  badgeCategoria: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A5568',
  },
  statusContainer: {
    marginLeft: 12,
    paddingRight: 6,
  },
  statusIcon: {
    fontSize: 22,
    fontWeight: '900',
  },
  textEscuro: {
    color: '#151522',
  },
  textClaro: {
    color: '#FFFFFF',
  },
});