import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '@/services/api';

export function CardDestaquesSemanas({ usuarioId, onShare }) {
  const [dados, setDados] = useState({ treinos: 0, xp: 0, diasOfensiva: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    async function carregarDestaques() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/destaques-semanais`);
        setDados(response.data);
      } catch (err) {
        console.error('Erro ao carregar destaques semanais:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDestaques();
  }, [usuarioId]);

  return (
    <View style={styles.card}>
      {/* Imagem de fundo ajustada para preencher todo o card */}
      <Image
        source={require('@/components/assets/fundos/fundo-onda1-verde.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>DESTAQUES DA SEMANA</Text>
        <Pressable onPress={onShare} hitSlop={8} style={styles.shareButton}>
          <Text style={styles.shareIcon}>➦</Text>
        </Pressable>
      </View>

      {/* Conteúdo Principal / Estado de Carregamento */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#000000" />
          <Text style={styles.loaderText}>A carregar destaques...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.mascotContainer}>
            <Image
              source={require('@/components/assets/mascote/pose2-mascot3.svg')}
              contentFit="contain"
              style={styles.mascot}
            />
          </View>

          <View style={styles.statsContainer}>
            {/* Item 1: Treinos */}
            <View style={styles.statItem}>
              <View style={[styles.badge, styles.pinkBadge]}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.statText}>{dados.treinos} treinos completos</Text>
            </View>

            {/* Item 2: XP */}
            <View style={styles.statItem}>
              <View style={[styles.badge, styles.greenBadge]}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.statText}>+{dados.xp}xp</Text>
            </View>

            {/* Item 3: Ofensiva */}
            <View style={styles.statItem}>
              <View style={[styles.badge, styles.pinkBadge]}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
              <Text style={styles.statText}>{dados.diasOfensiva} dias na ofensiva</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default CardDestaquesSemanas;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#D2F522', // Fundo base verde-lima
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  shareButton: {
    padding: 4,
  },
  shareIcon: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mascotContainer: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 120,
    height: 120,
  },
  statsContainer: {
    width: '60%',
    gap: 12,
    paddingLeft: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinkBadge: {
    backgroundColor: '#FFB5E8',
  },
  greenBadge: {
    backgroundColor: '#A8D900',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  statText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    flexShrink: 1,
  },
  loaderContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
});