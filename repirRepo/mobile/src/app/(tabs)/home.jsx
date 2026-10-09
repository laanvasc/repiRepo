import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import HeaderAreaView from '@/components/header-area-view';
import { NotificationButton } from '@/components/ui/NotificationButton';
import ProximaAtividadeCard from '@/components/ui/ProximaAtividadeCard';

import { CardConquistasDesbloqueadas } from '../../components/ui/CardConquistasDesbloqueadas';
import CardDestaquesSemanas from '../../components/ui/CardDestaquesSemana';
import CardOfensiva from '../../components/ui/CardOfensiva';
import CardProgressoSemanal from '../../components/ui/CardProgressoSemana';
import CardSemanaQuantAtividades from '../../components/ui/CardSemanaQuantAtividades';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header dentro do ScrollView para rolar junto com a página */}
          <HeaderAreaView 
            title="Olá, João!" 
            subtitle="Pronto para sua próxima meta?"
            buttonIcon={
              <NotificationButton onPress={() => console.log('Notificações clicadas!')} />
            }
          />

          <ThemedView style={styles.heroSection}>
            {/* Conteúdo hero */}
          </ThemedView>

          <ThemedText type="code" style={styles.code}>
            
            

            <CardOfensiva/>

            <CardSemanaQuantAtividades/>

            <CardProgressoSemanal/>
            
            <ProximaAtividadeCard />

            <CardConquistasDesbloqueadas/>

            <CardDestaquesSemanas/>
          </ThemedText>

          

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four, // Garante as margens laterais uniformes para todo o conteúdo (inclusive o header)
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  code: {
    textTransform: 'uppercase',
    gap: Spacing.three,
  },
});