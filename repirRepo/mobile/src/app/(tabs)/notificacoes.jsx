import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import CardNotificacao from '@/components/ui/CardNotificacao';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const MOCK_NOTIFICACOES = [
  {
    id: '1',
    titulo: 'Lembrete: Corrida às 18h hoje',
    tempo: 'Há 10 min',
    lida: false,
  },
  {
    id: '2',
    titulo: 'Meta semanal concluída! 🎉',
    tempo: 'Há 2 horas',
    lida: false,
  },
  {
    id: '3',
    titulo: 'Nova conquista: 7 Dias Seguidos',
    tempo: 'Ontem',
    lida: true,
  },
  {
    id: '4',
    titulo: 'Não esqueça: Yoga amanhã às 7h',
    tempo: 'Ontem',
    lida: true,
  },
];

export default function NotificacoesScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header da Tela */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView title="Notificações" />
        </ThemedView>

        {/* Lista de Notificações com Scroll */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.listContainer}>
            {MOCK_NOTIFICACOES.map((item) => (
              <CardNotificacao
                key={item.id}
                titulo={item.titulo}
                tempo={item.tempo}
                lida={item.lida}
              />
            ))}
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
});