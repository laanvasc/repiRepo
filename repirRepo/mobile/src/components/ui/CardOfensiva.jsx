import { Image } from 'expo-image';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

  import {
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';

export function CardOfensiva({ dias = 13 }) {

      const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });


  return (
    <ImageBackground
      source={require('@/components/assets/fundos/fundo-onda1-verde.png')}
      style={styles.card}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      <View style={styles.leftContent}>
        <Text style={styles.number}>{dias}</Text>
        <Text style={styles.label}>DIAS DE OFENSIVA</Text>
      </View>

      <View style={styles.rightContent}>
        <Image
          source={require('@/components/assets/mascote/pose1-mascot1.svg')}
          contentFit="contain"
          style={styles.mascot}
        />
      </View>
    </ImageBackground>
  );
}

export default CardOfensiva;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#D2F522', // Cor base de fundo
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 0,
    width: 'auto',
    height:'auto'
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  number: {
        fontFamily: 'Inter_600SemiBold',
    fontSize: 94,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 76,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginTop: 4,
    letterSpacing: 0.5,
            fontFamily: 'Inter_600SemiBold',

  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 140,
    height: 140,
  },
});