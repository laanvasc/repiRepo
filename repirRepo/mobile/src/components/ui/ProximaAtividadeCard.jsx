import {
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function ProximaAtividadeCard() {
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.card}>
      {/* CONTEÚDO DE TEXTO À ESQUERDA */}
      <View style={styles.content}>
        <Text style={styles.title}>PRÓXIMA ATIVIDADE</Text>

        <View style={styles.activityRow}>
          <View style={styles.iconCircle}>
            <Svg width={28} height={28} viewBox="0 0 48 48">
              <Path
                d="M4 25H12L17 14L24 34L30 20L34 25H44"
                fill="none"
                stroke="#EE6C42"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.activity} numberOfLines={1}>Treino quadriceps</Text>
        </View>
      </View>

      {/* MASCOTE À DIREITA (Posicionado de forma segura sem estourar o layout) */}
      <Image
        source={require('../assets/mascote/pose2-mascot2.svg')}
        style={styles.mascot}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 126, // Altura fixa controlada para o cartão não achatar
    backgroundColor: '#FFB4ED', // Cor original do fundo do card
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1, // Garante que o texto fica por cima se necessário
  },

  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: '#000000',
    marginBottom: 8,
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  activity: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    lineHeight: 18,
    color: '#000000',
    flexShrink: 1, // Evita que texto grande empurre o layout para fora
  },

  mascot: {
    width: 95,
    height: 95,
    marginLeft: 8,
  },
});