import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/services/api';

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import HeaderAreaView from '@/components/header-area-view';
import { NotificationButton } from '@/components/ui/NotificationButton';
import ProximaAtividadeCard from '@/components/ui/ProximaAtividadeCard';

import { CardConquistasDesbloqueadas } from '../../components/ui/CardConquistasDesbloqueadas';
import CardDestaquesSemanas from '../../components/ui/CardDestaquesSemana';
import CardOfensiva from '../../components/ui/CardOfensiva';

import { useAuth } from '@/context/AuthContext';

const MINIMO_XP_DESTAQUES = 100;

function normalizarId(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === 'undefined' || texto === 'null') return null;
  return texto;
}

function extrairXpUsuario(fonte) {
  if (!fonte || typeof fonte !== 'object') return 0;

  if (Array.isArray(fonte)) {
    const somaDias = fonte.reduce((acc, item) => {
      const valorDia = Number(item?.xp ?? item?.xpGanho ?? item?.xp_ganho ?? 0);
      return acc + (Number.isFinite(valorDia) ? valorDia : 0);
    }, 0);
    return somaDias;
  }

  const candidato =
    fonte.xpTotal ??
    fonte.xp_total ??
    fonte.totalXp ??
    fonte.total_xp ??
    fonte.xp ??
    fonte.pontos ??
    fonte.usuario?.xpTotal ??
    fonte.usuario?.xp_total ??
    fonte.usuario?.xp ??
    fonte.user?.xpTotal ??
    fonte.user?.xp ??
    0;

  const numero = Number(candidato);
  return Number.isFinite(numero) ? numero : 0;
}

export default function HomeScreen() {
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

  useEffect(() => {
    let ativo = true;

    async function lerIdStorage() {
      try {
        const salvo = await AsyncStorage.getItem('@usuarioId');
        const idLimpo = normalizarId(salvo);
        if (ativo) {
          setUsuarioIdStorage(idLimpo);
        }
      } catch (err) {
        console.error('Erro ao ler @usuarioId do AsyncStorage na Home:', err);
      }
    }

    lerIdStorage();

    return () => {
      ativo = false;
    };
  }, [usuarioIdContexto, params?.usuarioId]);

  // Prioriza o ID do contexto de autenticação (atualizado no login/cadastro),
  // depois o storage sincronizado e por último o parâmetro da rota
  const usuarioId = usuarioIdContexto ?? usuarioIdStorage ?? usuarioIdParam ?? null;

  const xpContexto = useMemo(
    () => extrairXpUsuario(auth?.usuario ?? auth?.user ?? auth),
    [auth]
  );

  const [primeiroNome, setPrimeiroNome] = useState('Usuário');
  const [xpUsuario, setXpUsuario] = useState(xpContexto);
  const [refreshing, setRefreshing] = useState(false);
  const [dadosCarregando, setDadosCarregando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (xpContexto > 0) {
      setXpUsuario(xpContexto);
    }
  }, [xpContexto]);

  const carregarNomeUsuario = useCallback(async (idAlvo) => {
    if (!idAlvo) return;
    try {
      const response = await api.get(`/usuarios/${idAlvo}/nome`);
      const nomeCompleto = typeof response.data === 'string'
        ? response.data
        : (response.data?.nome || response.data?.nome_usuario || 'Usuário');
      setPrimeiroNome(nomeCompleto.trim().split(' ')[0]);

      const xpNoNome = extrairXpUsuario(response.data);
      if (xpNoNome > 0) {
        setXpUsuario(xpNoNome);
      }
    } catch (err) {
      console.error('Erro ao buscar o nome:', err);
    }
  }, []);

  const carregarXpUsuario = useCallback(async (idAlvo) => {
    if (!idAlvo) return;
    try {
      const resXp = await api.get(`/usuarios/${idAlvo}/xp`).catch(() => null);
      if (resXp?.data !== null && resXp?.data !== undefined) {
        const valor = typeof resXp.data === 'number' ? resXp.data : extrairXpUsuario(resXp.data);
        setXpUsuario(valor);
        return;
      }

      const resProgresso = await api.get(`/usuarios/${idAlvo}/progresso-semanal`).catch(() => null);
      if (resProgresso?.data !== null && resProgresso?.data !== undefined) {
        setXpUsuario(extrairXpUsuario(resProgresso.data));
      }
    } catch {
      // mantém o valor atual em caso de falha
    }
  }, []);

  const refetchHome = useCallback(async ({ isPullToRefresh = false } = {}) => {
    if (!usuarioId) {
      setPrimeiroNome('Usuário');
      setXpUsuario(0);
      setDadosCarregando(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setDadosCarregando(true);
      }

      await Promise.all([
        carregarNomeUsuario(usuarioId),
        carregarXpUsuario(usuarioId),
      ]);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Erro ao carregar dados da home:', err);
    } finally {
      setDadosCarregando(false);
      setRefreshing(false);
    }
  }, [usuarioId, carregarNomeUsuario, carregarXpUsuario]);

  useFocusEffect(
    useCallback(() => {
      refetchHome({ isPullToRefresh: false });
    }, [refetchHome])
  );

  const onRefresh = useCallback(() => {
    refetchHome({ isPullToRefresh: true });
  }, [refetchHome]);

  const podeExibirDestaquesSemanas = xpUsuario >= MINIMO_XP_DESTAQUES;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title={`Olá, ${primeiroNome}!`}
            subtitle="Pronto para sua próxima meta?"
            buttonIcon={
              <NotificationButton
                onPress={() => router.navigate('/notificacoes')}
              />
            }
          />
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5733"
              colors={['#FF5733']}
            />
          }
        >
          <ThemedView style={styles.heroSection} />

          {usuarioId ? (
            <ThemedView style={styles.cardsContainer}>
              <CardOfensiva key={`ofensiva-${usuarioId}-${refreshKey}`} usuarioId={usuarioId} />
              <ProximaAtividadeCard key={`proxima-${usuarioId}-${refreshKey}`} usuarioId={usuarioId} />
              {/* <CardConquistasDesbloqueadas key={`conquistas-${usuarioId}-${refreshKey}`} usuarioId={usuarioId} /> */}
              {podeExibirDestaquesSemanas ? (
                <CardDestaquesSemanas
                  key={`destaques-${usuarioId}-${refreshKey}`}
                  usuarioId={usuarioId}
                  xp={xpUsuario}
                />
              ) : null}
            </ThemedView>
          ) : null}

          <ThemedView style={styles.footerContainer}>
            <Text style={styles.footerText}>✨ Chegaste ao fim da página</Text>
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>

        {dadosCarregando && (
          <View style={styles.overlayCarregamento}>
            <ActivityIndicator size="large" color="#FF5733" />
            <Text style={styles.textoCarregamento}>A carregar os teus dados...</Text>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  cardsContainer: {
    width: '100%',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
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