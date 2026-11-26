import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MetaCard from '@/components/ui/MetaCard';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

function normalizarId(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === 'undefined' || texto === 'null') return null;
  return texto;
}

function formatarTempoRestanteDia(agora = new Date()) {
  const fimDoDia = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    23,
    59,
    59,
    999
  );

  const diffMs = Math.max(0, fimDoDia.getTime() - agora.getTime());
  const horas = Math.ceil(diffMs / 3600000);
  const horasFormatadas = String(horas).padStart(2, '0');

  return `Restam ${horasFormatadas}H`;
}

export default function MetaScreen() {
  const params = useLocalSearchParams();
  const auth = useAuth?.() || {};

  const usuarioIdContexto = normalizarId(
    auth?.usuarioId ?? auth?.usuario?.id ?? auth?.user?.id ?? null
  );

  const usuarioIdParam = useMemo(() => {
    return (
      normalizarId(params?.usuarioId) ??
      normalizarId(params?.id_usuario) ??
      normalizarId(params?.idUsuario) ??
      null
    );
  }, [params?.usuarioId, params?.id_usuario, params?.idUsuario]);

  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);
  const [metas, setMetas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tempoRestanteDia, setTempoRestanteDia] = useState(() => formatarTempoRestanteDia());

  useEffect(() => {
    setTempoRestanteDia(formatarTempoRestanteDia());

    const intervalo = setInterval(() => {
      setTempoRestanteDia(formatarTempoRestanteDia());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarStorageId() {
      try {
        const salvo = await AsyncStorage.getItem('@usuarioId');
        const idLimpo = normalizarId(salvo);
        if (ativo) {
          setUsuarioIdStorage(idLimpo);
        }
      } catch (err) {
        console.error('Erro ao ler @usuarioId do AsyncStorage em Metas:', err);
      }
    }

    carregarStorageId();

    return () => {
      ativo = false;
    };
  }, [usuarioIdContexto, params?.usuarioId]);

  const usuarioId = usuarioIdContexto ?? usuarioIdStorage ?? usuarioIdParam ?? null;

  const carregarMetas = useCallback(async ({ isPullToRefresh = false } = {}) => {
    if (!usuarioId) {
      setMetas(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(`/usuarios/${usuarioId}/metas-progresso`);
      setMetas(response.data);
    } catch (err) {
      console.error('Erro ao carregar metas e progresso:', err.response?.data || err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      setTempoRestanteDia(formatarTempoRestanteDia());
      carregarMetas({ isPullToRefresh: false });
    }, [carregarMetas])
  );

  const handleOpenNotificacoes = () => {
    router.navigate('/notificacoes');
  };

  const onRefresh = useCallback(async () => {
    setTempoRestanteDia(formatarTempoRestanteDia());
    await carregarMetas({ isPullToRefresh: true });
  }, [carregarMetas]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title="Metas"
            subtitle="Acompanhe o seu progresso diário e semanal"
            buttonIcon={
              <NotificationButton onPress={handleOpenNotificacoes} />
            }
          />
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5733"
              colors={['#FF5733']}
            />
          }
        >
          <ThemedView style={styles.titleContainer}>
            {/* Seção: Metas do Dia */}
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle} themeColor="textSecondary">
                Metas do dia
              </ThemedText>
              <Text style={styles.countdownText}>{tempoRestanteDia}</Text>
            </View>

            <ThemedView style={styles.cardsContainer}>
              <MetaCard
                tituloMeta={`Concluir ${metas?.progresso_diario?.meta || 3} atividades hoje`}
                progresso={`${metas?.progresso_diario?.realizadas || 0}/${metas?.progresso_diario?.meta || 3}`}
                concluido={metas?.progresso_diario?.concluido || false}
                onPress={() => console.log('Meta diária clicada')}
              />
            </ThemedView>

            {/* Seção: Metas da Semana */}
            <ThemedText style={styles.sectionTitle} themeColor="textSecondary">
              Metas da semana
            </ThemedText>

            <ThemedView style={styles.cardsContainer}>
              <MetaCard
                tituloMeta={`Completar ${metas?.progresso_semanal?.meta || 15} atividades esta semana`}
                progresso={`${metas?.progresso_semanal?.realizadas || 0}/${metas?.progresso_semanal?.meta || 15}`}
                concluido={metas?.progresso_semanal?.concluido || false}
                onPress={() => console.log('Meta semanal clicada')}
              />
            </ThemedView>
          </ThemedView>

          {/* Indicador visual de fim de conteúdo */}
          <ThemedView style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>✨ Chegaste ao fim das metas</ThemedText>
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>

        {/* OVERLAY DE CARREGAMENTO DE TELA INTEIRA */}
        {loading && (
          <View style={styles.overlayCarregamento}>
            <ActivityIndicator size="large" color="#FF5733" />
            <Text style={styles.textoCarregamento}>A carregar as metas...</Text>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  titleContainer: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  cardsContainer: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 13,
    color: '#888888',
    opacity: 0.8,
  },
  overlayCarregamento: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF7FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    gap: 12,
  },
  textoCarregamento: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});