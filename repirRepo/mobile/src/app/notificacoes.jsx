import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import CardNotificacao from '@/components/ui/CardNotificacao';
import { WebBadge } from '@/components/web-badge';
import { api } from '@/services/api';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function NotificacoesScreen({ route }) {
  // Podes receber o usuarioId por route.params ou definir o ID ativo do utilizador logado
  const usuarioId = route?.params?.usuarioId || 1; 

  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarNotificacoes() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/notificacoes`);
        setNotificacoes(response.data);
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarNotificacoes();
  }, [usuarioId]);

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
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF5E32" />
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