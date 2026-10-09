import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

// Importação direta de um ícone genérico/padrão para o fallback
import trofeuPadrao from '../assets/trofeus/trofeu1.png';

export function Trofeu({
  tituloTrofeu = 'Primeiro Passo',
  disabled = false,
  isLoading = false,
  iconeTrofeu = null,
}) {
  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <Image
        source={iconeTrofeu || trofeuPadrao}
        style={[styles.trofeuIcon, disabled && styles.iconDisabled]}
        resizeMode="contain"
      />

      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.titleText}>{tituloTrofeu}</Text>
      )}
    </View>
  );
}

export default Trofeu;

const styles = StyleSheet.create({
  card: {
    width: '48%', // Usa largura percentual para se ajustar perfeito na grid de 2 colunas
    aspectRatio: 1, // Mantém o formato quadrado proporcional
    backgroundColor: '#FF5252',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  cardDisabled: {
    backgroundColor: '#FF9E9E',
    borderColor: '#FF5252',
    borderStyle: 'dashed',
  },

  trofeuIcon: {
    width: 68,
    height: 68,
    marginBottom: 8,
  },

  iconDisabled: {
    opacity: 0.7,
  },

  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});