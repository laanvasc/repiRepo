import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function CardMetasCompletas({
  titulo = 'Meta Semanal\nde atividades',
  subtitulo = 'Falta apenas 1 atividade!',
  completadas = 2,
  total = 6,
}) {
  const radius = 34;
  const strokeWidth = 9;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;

  const progressPercentage = Math.min(Math.max(completadas / total, 0), 1);
  const strokeDashoffset = circumference * (1 - progressPercentage);

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{titulo}</Text>
        <Text style={styles.subtitleText}>{subtitulo}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFFFFF"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FF5733"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={styles.progressTextWrapper}>
          <Text style={styles.progressText}>
            {completadas}/{total}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default CardMetasCompletas;

const styles = StyleSheet.create({
  card: {
    width: '100%', // Ajustado de 120% para 100%
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
    flexShrink: 1, // Evita que textos longos empurrem o círculo para fora
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