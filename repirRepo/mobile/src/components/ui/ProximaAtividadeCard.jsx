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
      {}
      <Image
        source={require('../assets/mascote/pose2-mascot2.svg')}
        style={styles.mascot}
        contentFit="contain"
      />

      <View style={styles.content}>
        <Text style={styles.title}>PRÓXIMA ATIVIDADE</Text>

        <View style={styles.activityRow}>
          <View style={styles.iconCircle}>
            <Svg width={28} height={28} viewBox="0 0 48 48">
              <Path
                d="M4 25H12L17 14L24 34L30 20L34 25H44"
                fill="none"
                stroke="#FFB4ED"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.activity}>Treino quadriceps</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 370,
    height: 126,
    backgroundColor: '#FFB4ED',
    borderRadius: 16,
    overflow: 'hidden',
  },

  content: {
    position: 'absolute',
    left: 16,
    top: 16,
  },

  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 18,
    color: '#000000',
    marginBottom: 12,
    textTransform: 'none',
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activity: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
  },

  mascot: {
    position: 'absolute',
    right: 30,
    top: 13,
    width: 100,
    height: 100,
  },
});