import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const ORANGE = '#EE6C42';
const PINK = '#F0B4A4';
const LIME = '#DCEB52';

// 5 semanas precisam de mais altura que as 4 do Figma (284)
const CARD_HEIGHT = 318;

// Outubro de 2026 começa numa quinta-feira
const weeks = [
  [27, 28, 29, 30, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
];

// Dias do mês anterior (esmaecidos)
const pastDays = [
  [true, true, true, true, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false],
];

// Dias concluídos (fica verde-limão)
const doneDays = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12];

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function MensalCard() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.card}>
      {/* ONDAS DE FUNDO */}
      <Svg width={370} height={CARD_HEIGHT} style={StyleSheet.absoluteFill}>
        {/* onda superior (atrás do título) */}
        <Path
          d="M0 0 H370 V64 C300 64 250 20 190 20 C130 20 80 62 0 62 Z"
          fill={PINK}
        />
        {/* faixa do meio (atrás dos dias) */}
        <Path
          d="M0 145 C70 145 130 102 193 102 C255 102 300 145 370 145
             V237 C300 237 255 195 193 195 C130 195 70 237 0 237 Z"
          fill={PINK}
        />
      </Svg>

      {/* TÍTULO */}
      <Text style={styles.title}>Outubro 2026</Text>

      {/* COMPARTILHAR */}
      <View style={styles.share}>
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Line x1="7.3" y1="11" x2="16.7" y2="7" stroke="#FFFFFF" strokeWidth="2" />
          <Line x1="7.3" y1="13" x2="16.7" y2="17" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="5" cy="12" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="19" cy="6" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="19" cy="18" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </Svg>
      </View>

      {/* ESTATÍSTICAS */}
      <View style={[styles.stat, { left: 22 }]}>
        <Text style={styles.statLabel}>Ofensiva</Text>
        <Text style={styles.statValue}>13 dias</Text>
      </View>

      <View style={[styles.stat, { left: 125 }]}>
        <Text style={styles.statLabel}>Concluídas</Text>
        <Text style={styles.statValue}>350 atividades</Text>
      </View>

      {/* DIAS DA SEMANA */}
      <View style={styles.weekHeader}>
        {weekDays.map((d, i) => (
          <View key={i} style={styles.column}>
            <Text style={styles.weekDay}>{d}</Text>
          </View>
        ))}
      </View>

      {/* CALENDÁRIO */}
      <View style={styles.calendar}>
        {weeks.map((week, w) => (
          <View key={w} style={styles.weekRow}>
            {week.map((n, d) => {
              const past = pastDays[w][d];
              const done = !past && doneDays.includes(n);
              return (
                <View key={d} style={styles.column}>
                  <View
                    style={[
                      styles.day,
                      done && styles.dayDone,
                      past && styles.dayPast,
                    ]}
                  >
                    <Text style={styles.dayText}>
                      {String(n).padStart(2, '0')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 370,
    height: CARD_HEIGHT,
    backgroundColor: ORANGE,
    borderRadius: 24,
    overflow: 'hidden',
  },

  title: {
    position: 'absolute',
    left: 22,
    top: 19,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
    color: '#FFFFFF',
    textTransform: 'none',
  },

  share: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stat: {
    position: 'absolute',
    top: 57,
  },

  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 19,
    color: '#FFFFFF',
    textTransform: 'none',
  },

  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    textTransform: 'none',
  },

  weekHeader: {
    position: 'absolute',
    top: 113,
    left: 3,
    right: 3,
    flexDirection: 'row',
  },

  weekDay: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  calendar: {
    position: 'absolute',
    top: 138,
    left: 3,
    right: 3,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  day: {
    width: 18,
    height: 26,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  dayDone: {
    backgroundColor: LIME,
  },

  dayPast: {
    opacity: 0.4,
  },

  dayText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    lineHeight: 13,
    color: ORANGE,
    textTransform: 'none',
    includeFontPadding: false,
  },
});