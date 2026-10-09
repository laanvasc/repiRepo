import { StyleSheet, Text, View } from 'react-native';

const DIAS_DEFAULT = [
  { dia: 'S', progresso: 0.6, atual: false },
  { dia: 'T', progresso: 0.85, atual: false },
  { dia: 'Q', progresso: 0.4, atual: false },
  { dia: 'Q', progresso: 1.0, atual: true },
  { dia: 'S', progresso: 0.0, atual: false },
  { dia: 'S', progresso: 0.0, atual: false },
  { dia: 'D', progresso: 0.0, atual: false },
];

export function CardProgressoSemanal({
  titulo = 'Progresso Semanal',
  dias = DIAS_DEFAULT,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>

      <View style={styles.diasContainer}>
        {dias.map((item, index) => {
          const percentual = Math.min(Math.max(item.progresso, 0), 1) * 100;

          return (
            <View key={index} style={styles.pillBackground}>
              {/* Preenchimento dinâmico de baixo para cima */}
              {percentual > 0 && (
                <View
                  style={[
                    styles.pillFill,
                    { height: `${percentual}%` },
                  ]}
                />
              )}

              {/* Letra do dia da semana */}
              <Text style={[styles.diaText, item.atual && styles.diaAtualText]}>
                {item.dia}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default CardProgressoSemanal;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FAF5FC',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151522',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pillBackground: {
    flex: 1,
    height: 80,
    backgroundColor: '#FCD8CD', // Fundo claro da pílula
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pillFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF5E32', // Preenchimento laranja vibrante
    borderRadius: 28,
  },
  diaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    zIndex: 2,
  },
  diaAtualText: {
    textDecorationLine: 'underline',
  },
});