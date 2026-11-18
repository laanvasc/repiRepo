import { StyleSheet, Text, View } from 'react-native';

export function CardProgressoSemanal({
  titulo = 'Progresso Semanal',
  dias = [],
}) {
  const listaDias = Array.isArray(dias) ? dias : [];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>

      <View style={styles.diasContainer}>
        {listaDias.map((item, index) => {
          const meta = item.metaDiaria > 0 ? item.metaDiaria : 3;
          const realizadas = Math.max(item.atividadesFeitas || 0, 0);
          
          const percentual = Math.min(Math.max(realizadas / meta, 0), 1) * 100;

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
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
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
    backgroundColor: '#FCD8CD',
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
    backgroundColor: '#FF5E32',
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