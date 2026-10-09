import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const CONQUISTAS_DEFAULT = [
  {
    id: '1',
    nome: 'Primeiro Treino',
    corFundo: '#FF5E32', // Laranja/Vermelho
    icone: require('@/components/assets/trofeus/trofeu1.png'),
  },
  {
    id: '2',
    nome: 'Super Foco',
    corFundo: '#FF5E32',
    icone: require('@/components/assets/trofeus/trofeu21.png'),
  },
  {
    id: '3',
    nome: 'Ofensiva 7 Dias',
    corFundo: '#FFB5E8', // Rosa
    icone: require('@/components/assets/trofeus/trofeu21.png'),
  },
  {
    id: '4',
    nome: 'Mestre da Semana',
    corFundo: '#D2F522', // Verde-lima
    icone: require('@/components/assets/trofeus/trofeu21.png'),
  },
];

export function CardConquistasDesbloqueadas({
  titulo = 'Melhores conquistas',
  conquistas = CONQUISTAS_DEFAULT,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {conquistas.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <View style={[styles.circle, { backgroundColor: item.corFundo }]}>
              <Image
                source={item.icone}
                contentFit="contain"
                style={styles.trophyIcon}
              />
            </View>

            <Text style={styles.conquistaNome} numberOfLines={2}>
              {item.nome}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default CardConquistasDesbloqueadas;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    // Arrumar isso depois
    height: '24%',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignSelf: 'flex-start', // Impede que o card estique verticalmente
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151522',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: 16,
    paddingRight: 8,
    alignItems: 'flex-start', // Mantém o alinhamento no topo dos itens
  },
  itemContainer: {
    alignItems: 'center',
    width: 88,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trophyIcon: {
    width: 52,
    height: 52,
  },
  conquistaNome: {
    fontSize: 12,
    fontWeight: '700',
    color: '#151522',
    textAlign: 'center',
    lineHeight: 15,
  },
});