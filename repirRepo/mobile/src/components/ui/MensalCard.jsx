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

// Altura reduzida de 318 para 250
const CARD_HEIGHT = 250;

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
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 370 318"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        {/* onda superior */}
        <Path
          d="M0 0 H370 V64 C300 64 250 20 190 20 C130 20 80 62 0 62 Z"
          fill={PINK}
        />
        {/* faixa do meio */}
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
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Line x1="7.3" y1="11" x2="16.7" y2="7" stroke="#FFFFFF" strokeWidth="2" />
          <Line x1="7.3" y1="13" x2="16.7" y2="17" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="5" cy="12" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="19" cy="6" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <Circle cx="19" cy="18" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </Svg>
      </View>

      {/* ESTATÍSTICAS */}
      <View style={[styles.stat, { left: 16 }]}>
        <Text style={styles.statLabel}>Ofensiva</Text>
        <Text style={styles.statValue}>13 dias</Text>
      </View>

      <View style={[styles.stat, { left: 110 }]}>
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
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: ORANGE,
    borderRadius: 20,
    overflow: 'hidden',
  },

  title: {
    position: 'absolute',
    left: 16,
    top: 12,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
  },

  share: {
    position: 'absolute',
    right: 14,
    top: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stat: {
    position: 'absolute',
    top: 42,
  },

  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 15,
    color: '#FFFFFF',
  },

  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
  },

  weekHeader: {
    position: 'absolute',
    top: 86,
    left: 3,
    right: 3,
    flexDirection: 'row',
  },

  weekDay: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  calendar: {
    position: 'absolute',
    top: 108,
    left: 3,
    right: 3,
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  day: {
    width: 15,
    height: 22,
    borderRadius: 8,
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
    fontSize: 9,
    lineHeight: 11,
    color: ORANGE,
    includeFontPadding: false,
  },
});