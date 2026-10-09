import React from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import CardMetasCompletas from '@/components/ui/CardMetasCompletas';
import CardXpTotal from '@/components/ui/CardXpTotal';
import MetaCard from '@/components/ui/MetaCard';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function MetaScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo no topo */}
        <HeaderAreaView
          title="Metas"
          subtitle="Acompanhe o seu progresso diário"
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <ThemedView style={styles.titleContainer}>
            {/* Card de Progresso Semanal */}
            <CardMetasCompletas />

            {/* Card de XP Total */}
            <CardXpTotal
              nivel={7}
              xpTotal={1250}
              xpAtualNivel={250}
              xpNecessarioNivel={500}
            />

            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Metas da semana
            </ThemedText>

            <ThemedView style={styles.cardsContainer}>
              <MetaCard
                tituloMeta="Fazer 3 atividades"
                onPress={() => console.log('testando')}
              />
              <MetaCard tituloMeta="Fazer 3 atividades" />
              <MetaCard tituloMeta="Fazer 3 atividades" />
              <MetaCard tituloMeta="Fazer 3 atividades" />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            {/* Outras seções se necessário */}
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
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: BottomTabInset + Spacing.four, // Inset correto aplicado apenas ao Scroll
  },
  titleContainer: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  centerText: {
    marginVertical: 12,
    fontWeight: '700',
  },
  cardsContainer: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  sectionsWrapper: {
    marginTop: 16,
    backgroundColor: 'transparent',
  },
});