import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import CardMetasCompletas from '@/components/ui/CardMetasCompletas';
import MetaCard from '@/components/ui/MetaCard';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function MetaScreen() {
  const { usuarioId } = useAuth();
  const [metas, setMetas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarMetas = async () => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/usuarios/${usuarioId}/metas-progresso`);
      setMetas(response.data);
    } catch (err) {
      console.error('Erro ao carregar metas e progresso:', err.response?.data || err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    carregarMetas();
  }, [usuarioId]);

  const handleOpenNotificacoes = () => {
    router.navigate('/notificacoes');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarMetas();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, [usuarioId]);

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
            {/* Card de Progresso Semanal Geral (Carregado dinamicamente do backend) */}
            <CardMetasCompletas 
              realizadas={metas?.progresso_semanal?.realizadas || 0} 
              meta={metas?.progresso_semanal?.meta || 15} 
            />

            {/* Seção: Metas do Dia */}
            <ThemedText style={styles.sectionTitle} themeColor="textSecondary">
              Metas do dia
            </ThemedText>

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
  sectionTitle: {
    marginTop: Spacing.one,
    fontWeight: '700',
    fontSize: 16,
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