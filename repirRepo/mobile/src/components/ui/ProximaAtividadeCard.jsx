import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { api } from '@/services/api';

export default function ProximaAtividadeCard({ usuarioId }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    async function carregarProxima() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/proxima-atividade`);
        setDados(response.data);
      } catch (err) {
        console.error('Erro ao carregar próxima atividade:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarProxima();
  }, [usuarioId]);

  const todasConcluidas = dados?.status === 'todas_concluidas' || dados?.status === 'sem_atividades_hoje';
  const nomeAtividade = dados?.nome || (todasConcluidas ? 'Todas as atividades concluídas!' : 'Nenhuma atividade pendente');

  return (
    <View style={[styles.card, todasConcluidas && styles.cardConcluido]}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {todasConcluidas ? 'PARABÉNS!' : 'PRÓXIMA ATIVIDADE'}
        </Text>

        <View style={styles.activityRow}>
          <View style={styles.iconCircle}>
            {loading ? (
              <ActivityIndicator size="small" color="#EE6C42" />
            ) : todasConcluidas ? (
              <Text style={styles.checkEmoji}>🎉</Text>
            ) : (
              <Svg width={28} height={28} viewBox="0 0 48 48">
                <Path
                  d="M4 25H12L17 14L24 34L30 20L34 25H44"
                  fill="none"
                  stroke="#EE6C42"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>

          <Text style={styles.activity} numberOfLines={1}>
            {loading ? 'A carregar...' : nomeAtividade}
          </Text>
        </View>
      </View>

      <Image
        source={
          todasConcluidas
            ? require('../assets/mascote/pose2-mascot3.svg')
            : require('../assets/mascote/pose2-mascot2.svg')
        }
        style={styles.mascot}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 126,
    backgroundColor: '#FFB4ED',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardConcluido: {
    backgroundColor: '#D2F522',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 16,
    color: '#000000',
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkEmoji: {
    fontSize: 18,
  },
  activity: {
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 18,
    color: '#000000',
    flexShrink: 1,
  },
  mascot: {
    width: 95,
    height: 95,
    marginLeft: 8,
  },
});