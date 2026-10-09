import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import CardAtividade from '@/components/ui/CardAtividade';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';

import Button from '@/components/ui/Button';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AtividadesScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Imagem de Fundo da Tela */}
      <Image
        source={require('@/components/assets/fundos/fundo-onda1-rosa.png')}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Fixo */}
        <HeaderAreaView
          title="Suas atividades"
          buttonIcon={
            <NotificationButton
              onPress={() => console.log('Notificações clicadas!')}
            />
          }
        />

        {/* Conteúdo com Scroll */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.cardsContainer}>
            {/* Lista de Exemplo de Cards com as Variações */}
            <CardAtividade
              titulo="Treino Abdominal"
              categoria="Corrida"
              concluido={true}
            />
            <CardAtividade
              titulo="Treino de Peito"
              categoria="Musculação"
              concluido={true}
            />
            <CardAtividade
              titulo="Esteira"
              categoria="Musculação"
              concluido={false}
            />
            <CardAtividade
              titulo="Corrida"
              categoria="Aerobica"
              concluido={false}
            />
          </ThemedView>
          <ThemedView>
            <Button titulo="Finalizar atividades diárias"/>
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
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingVertical: Spacing.two,
  },
  cardsContainer: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingTop: Spacing.three,
    backgroundColor: 'transparent',
  },
});