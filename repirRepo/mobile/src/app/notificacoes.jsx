import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import CardNotificacao from '@/components/ui/CardNotificacao';
import { WebBadge } from '@/components/web-badge';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function NotificacoesScreen() {
  const { usuarioId: authUsuarioId } = useAuth();
  const params = useLocalSearchParams();
  const usuarioId = authUsuarioId ?? params?.usuarioId ?? null;

  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarNotificacoes = useCallback(async () => {
    if (!usuarioId) {
      setNotificacoes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/usuarios/${usuarioId}/notificacoes`);
      setNotificacoes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setNotificacoes([]);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarNotificacoes();
    setRefreshing(false);
  }, [carregarNotificacoes]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header da Tela */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView title="Notificações" showBackButton={true} />
        </ThemedView>

        {/* Lista de Notificações com Scroll */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5E32"
              colors={['#FF5E32']}
            />
          }
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF5E32" />
            </View>
          ) : !usuarioId ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Inicie sessão para ver as suas notificações.</Text>
            </View>
          ) : notificacoes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Sem notificações no momento.</Text>
            </View>
          ) : (
            <ThemedView style={styles.listContainer}>
              {notificacoes.map((item) => (
                <CardNotificacao
                  key={item.id}
                  titulo={item.titulo}
                  tempo={item.tempo}
                  lida={item.lida}
                />
              ))}
            </ThemedView>
          )}

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.three,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.two,
  },
  listContainer: {
    width: '100%',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_600SemiBold',
  },
});