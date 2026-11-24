import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/services/api';

import { router, useFocusEffect } from 'expo-router';

import HeaderAreaView from '@/components/header-area-view';
import { NotificationButton } from '@/components/ui/NotificationButton';
import ProximaAtividadeCard from '@/components/ui/ProximaAtividadeCard';

import { CardConquistasDesbloqueadas } from '../../components/ui/CardConquistasDesbloqueadas';
import CardDestaquesSemanas from '../../components/ui/CardDestaquesSemana';
import CardOfensiva from '../../components/ui/CardOfensiva';

import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { usuarioId } = useAuth();

  const [primeiroNome, setPrimeiroNome] = useState('Usuário');
  const [listaAtividadesFrequentes, setListaAtividadesFrequentes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dadosCarregando, setDadosCarregando] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const carregarNomeUsuario = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const response = await api.get(`/usuarios/${usuarioId}/nome`);
      const nomeCompleto = typeof response.data === 'string'
        ? response.data
        : (response.data?.nome || response.data?.nome_usuario || 'Usuário');
      setPrimeiroNome(nomeCompleto.trim().split(' ')[0]);
    } catch (err) {
      console.error('Erro ao buscar o nome:', err);
    }
  }, [usuarioId]);

  const carregarAtividades = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const response = await api.get(`/usuarios/${usuarioId}/atividades-frequentes`);
      setListaAtividadesFrequentes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao buscar atividades frequentes:', err);
    }
  }, [usuarioId]);

  const refetchHome = useCallback(async ({ isPullToRefresh = false } = {}) => {
    if (!usuarioId) {
      setPrimeiroNome('Usuário');
      setListaAtividadesFrequentes([]);
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
        carregarNomeUsuario(),
        carregarAtividades(),
      ]);

      // Incrementa a chave para forçar o refetch interno dos cards filhos
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Erro ao carregar dados da home:', err);
    } finally {
      setDadosCarregando(false);
      setRefreshing(false);
    }
  }, [usuarioId, carregarNomeUsuario, carregarAtividades]);

  useFocusEffect(
    useCallback(() => {
      refetchHome({ isPullToRefresh: false });
    }, [refetchHome])
  );

  const onRefresh = useCallback(() => {
    refetchHome({ isPullToRefresh: true });
  }, [refetchHome]);

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

          <ThemedView style={styles.cardsContainer}>
            <CardOfensiva key={`ofensiva-${refreshKey}`} usuarioId={usuarioId} />
            <ProximaAtividadeCard key={`proxima-${refreshKey}`} usuarioId={usuarioId} />
            <CardConquistasDesbloqueadas key={`conquistas-${refreshKey}`} usuarioId={usuarioId} />
            <CardDestaquesSemanas key={`destaques-${refreshKey}`} usuarioId={usuarioId} />
          </ThemedView>

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