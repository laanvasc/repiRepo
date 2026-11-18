import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function CardMetasCompletas({
  titulo = 'Meta Semanal\nde atividades',
  // Novas props para contar metas (ex: 1 de 2 metas concluídas)
  metasConcluidas = null, 
  totalMetas = null,
  // Props de fallback baseadas em atividades individuais
  realizadas = 0,
  meta = 15,
}) {
  const raio = 34;
  const larguraTraco = 9;
  const tamanho = (raio + larguraTraco) * 2;
  const circumference = 2 * Math.PI * raio;

  // Se forem passadas metas específicas, usa-as; senão, usa a contagem por atividades
  const usandoMetasQuantitativas = metasConcluidas !== null && totalMetas !== null;
  
  const atual = usandoMetasQuantitativas ? Math.max(metasConcluidas, 0) : Math.max(realizadas, 0);
  const total = usandoMetasQuantitativas ? Math.max(totalMetas, 1) : (meta > 0 ? meta : 15);

  const percentagemProgresso = Math.min(Math.max(atual / total, 0), 1);
  const desvioTraco = circumference * (1 - percentagemProgresso);
  
  // Verifica se o total foi atingido
  const concluido = atual >= total && total > 0;
  const faltam = total - atual;

  // Subtítulo dinâmico
  let subtituloDinamico = `Faltam ${faltam} para concluir`;
  if (concluido) {
    subtituloDinamico = 'Todas as metas concluídas! 🎉';
  } else if (faltam === 1) {
    subtituloDinamico = 'Falta apenas 1 meta!';
  } else if (atual === 0) {
    subtituloDinamico = 'Nenhuma meta concluída ainda';
  }

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{titulo}</Text>
        <Text style={styles.subtitleText}>{subtituloDinamico}</Text>
      </View>

      <View style={styles.progressContainer}>
        {concluido ? (
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          </View>
        ) : (
          <>
            <Svg width={tamanho} height={tamanho}>
              <Circle
                cx={tamanho / 2}
                cy={tamanho / 2}
                r={raio}
                stroke="#FFFFFF"
                strokeWidth={larguraTraco}
                fill="none"
              />
              <Circle
                cx={tamanho / 2}
                cy={tamanho / 2}
                r={raio}
                stroke="#FF5733"
                strokeWidth={larguraTraco}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={desvioTraco}
                strokeLinecap="round"
                transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
              />
            </Svg>

            <View style={styles.progressTextWrapper}>
              <Text style={styles.progressText}>
                {atual}/{total}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default CardMetasCompletas;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFB7F5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  progressContainer: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  successIconWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 43,
  },
  progressTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});