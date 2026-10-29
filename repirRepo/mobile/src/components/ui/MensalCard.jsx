import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { api } from '@/services/api';

const ORANGE = '#EE6C42';
const PINK = '#F0B4A4';
const LIME = '#DCEB52';
const GRAY = '#D3D3D3'; 

const CARD_HEIGHT = 370;
const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function MensalCard({ usuarioId }) {
  const [loading, setLoading] = useState(true);
  const [dadosMensais, setDadosMensais] = useState({
    ofensivaAtual: 0,
    totalAtividades: 0,
    diasConcluidos: [],
    diasPassados: [],
    weeks: [],
  });

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    async function carregarDadosMensais() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/mensal`);
        const data = response.data;

        setDadosMensais({
          ofensivaAtual: data.ofensivaAtual ?? 0,
          totalAtividades: data.totalAtividades ?? 0,
          diasConcluidos: data.diasConcluidos ?? [], 
          diasPassados: data.diasPassados ?? [],    
          weeks: data.weeks ?? [      
            [27, 28, 29, 30, 1, 2, 3],
            [4, 5, 6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30, 31],
          ],
        });
      } catch (err) {
        console.error('Erro ao carregar dados mensais:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosMensais();
  }, [usuarioId]);

  if (!usuarioId) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.statValue}>Utilizador não identificado.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

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
        <Path
          d="M0 0 H370 V64 C300 64 250 20 190 20 C130 20 80 62 0 62 Z"
          fill={PINK}
        />
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
        <Text style={styles.statValue}>{dadosMensais.ofensivaAtual} dias</Text>
      </View>

      <View style={[styles.stat, { left: 110 }]}>
        <Text style={styles.statLabel}>Concluídas</Text>
        <Text style={styles.statValue}>{dadosMensais.totalAtividades} atividades</Text>
      </View>

      {/* DIAS DA SEMANA */}
      <View style={styles.weekHeader}>
        {weekDays.map((d, i) => (
          <View key={i} style={styles.column}>
            <Text style={styles.weekDay}>{d}</Text>
          </View>
        ))}
      </View>

      {/* CALENDÁRIO INTELIGENTE */}
      <View style={styles.calendar}>
        {dadosMensais.weeks.map((week, w) => (
          <View key={w} style={styles.weekRow}>
            {week.map((n, d) => {
              const isDone = dadosMensais.diasConcluidos.includes(n);
              const isPast = !isDone && n < 29; 

              return (
                <View key={d} style={styles.column}>
                  <View
                    style={[
                      styles.day,
                      isDone && styles.dayDone,   
                      isPast && styles.dayPast,   
                    ]}
                  >
                    <Text style={[styles.dayText, isPast && styles.dayTextPast]}>
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

export default MensalCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: ORANGE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    left: 18,
    top: 18,
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  share: {
    position: 'absolute',
    right: 16,
    top: 18,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: {
    position: 'absolute',
    top: 56,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 15,
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  weekHeader: {
    position: 'absolute',
    top: 120,
    left: 3,
    right: 3,
    flexDirection: 'row',
  },
  weekDay: {
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  calendar: {
    position: 'absolute',
    top: 155,
    left: 3,
    right: 3,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  // Transformado em círculo perfeito (largura e altura iguais a 28, borderRadius 14)
  day: {
    width: 28,  
    height: 28, 
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dayDone: {
    backgroundColor: LIME,
    transform: [{ scale: 1.15 }], 
  },
  dayPast: {
    backgroundColor: GRAY,
    transform: [{ scale: 1.25 }], 
  },
  dayText: {
    fontSize: 10,
    lineHeight: 12,
    color: ORANGE,
    fontWeight: 'bold',
  },
  dayTextPast: {
    color: '#444444', 
  },
});