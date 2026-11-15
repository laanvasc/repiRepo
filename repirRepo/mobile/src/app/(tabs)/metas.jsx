import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import CardMetasCompletas from '@/components/ui/CardMetasCompletas';
import MetaCard from '@/components/ui/MetaCard';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function MetaScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleOpenNotificacoes = () => {
    router.navigate('/notificacoes');
  };

  // Função simulada ou real para atualizar dados ao puxar o ecrã
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Aqui podes chamar a API de metas se houver no futuro (ex: await carregarMetas())
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo com espaçamento lateral uniforme */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title="Metas"
            subtitle="Acompanhe o seu progresso diário"
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
            {/* Card de Progresso Semanal */}
            <CardMetasCompletas />

            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Metas da semana
            </ThemedText>

            <ThemedView style={styles.cardsContainer}>
              <MetaCard
                tituloMeta="Fazer 3 atividades"
                onPress={() => console.log('testando')}
              />
            </ThemedView>
          </ThemedView>

          {/* Indicador visual de fim de conteúdo */}
          <ThemedView style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>✨ Chegaste ao fim das metas</ThemedText>
          </ThemedView>

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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four, // Alinhado perfeitamente com o scrollContent
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
  centerText: {
    marginVertical: Spacing.one,
    fontWeight: '700',
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
});