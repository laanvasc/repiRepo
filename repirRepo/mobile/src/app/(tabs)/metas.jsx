import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';

import HeaderAreaView from '@/components/header-area-view';
import MetaCard from '@/components/ui/MetaCard';
import { NotificationButton } from '@/components/ui/NotificationButton';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function MetaScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Fixo no topo */}
        <HeaderAreaView
          title="Metas"
          subtitle="Acompanhe o seu progresso diário"
          buttonIcon={
            <NotificationButton onPress={() => console.log('Notificações clicadas!')} />
          }
        />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              Exemplo Texto
            </ThemedText>

            <ThemedView style={styles.cardsContainer}>
              <MetaCard 
                tituloMeta="Fazer 3 atividades" 
                onPress={() => console.log("testando")} 
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
      paddingBottom: BottomTabInset + Spacing.three,
      maxWidth: MaxContentWidth,
    },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    gap: 8,
  },
  centerText: {
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 12,
  },
  sectionsWrapper: {
    marginTop: 16,
  },
});