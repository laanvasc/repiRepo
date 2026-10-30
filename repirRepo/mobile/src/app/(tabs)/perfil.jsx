import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import CardXpTotal from '@/components/ui/CardXpTotal';
import MensalCard from '@/components/ui/MensalCard';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';
import Trofeu from '../../components/ui/Trofeu';

import { useAuth } from '@/context/AuthContext'; // <-- Importa o hook de autenticação
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/services/api';

export default function PerfilScreen() {
  const { usuarioId } = useAuth(); // <-- Obtém o ID do utilizador logado globalmente
  const [nomeUsuario, setNomeUsuario] = useState('Meu Perfil');

  // Busca o nome do perfil de forma dinâmica usando o ID do contexto
  useEffect(() => {
    async function carregarNomePerfil() {
      if (!usuarioId) return;
      try {
        const response = await api.get(`/usuarios/${usuarioId}/nome`);
        const nomeCompleto = typeof response.data === 'string' 
          ? response.data 
          : (response.data?.nome || response.data?.nome_usuario || 'Meu Perfil');
        setNomeUsuario(nomeCompleto);
      } catch (err) {
        console.error('Erro ao carregar nome para o perfil:', err);
      }
    }
    carregarNomePerfil();
  }, [usuarioId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo compactado */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title={nomeUsuario}
            buttonIcon={
              <NotificationButton
                onPress={() => console.log('Notificações clicadas!')}
              />
            }
          />
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.cardsWrapper}>
            {/* Cards puxam dinamicamente através do usuarioId global */}
            <CardXpTotal usuarioId={usuarioId} />
            <MensalCard usuarioId={usuarioId} />
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            <ThemedText type="subtitle">Troféus</ThemedText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Troféu Conquistado */}
                <Trofeu tituloTrofeu="Primeiro Passo" disabled={false} />

                {/* Troféu Bloqueado */}
                <Trofeu tituloTrofeu="Milhar" disabled={true} />
            </View>
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
  cardsWrapper: {
    width: '100%',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
  sectionsWrapper: {
    width: '100%',
    gap: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
});