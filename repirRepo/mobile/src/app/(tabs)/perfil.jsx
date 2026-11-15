import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import CardXpTotal from '@/components/ui/CardXpTotal';
import MensalCard from '@/components/ui/MensalCard';
import { WebBadge } from '@/components/web-badge';
import Trofeu from '../../components/ui/Trofeu';

import CardProgressoSemanal from '../../components/ui/CardProgressoSemana';
import CardSemanaQuantAtividades from '../../components/ui/CardSemanaQuantAtividades';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

// Botão de Configurações customizado mantendo o design padrão
function SettingsButton({ onPress }) {
  return (
    <TouchableOpacity 
      style={styles.settingsButton} 
      onPress={onPress} 
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Configurações"
    >
      <Ionicons name="settings-outline" size={22} color="#FF5733" />
    </TouchableOpacity>
  );
}

export default function PerfilScreen() {
  const { usuarioId } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState('Meu Perfil');
  const [refreshing, setRefreshing] = useState(false);

  const carregarNomePerfil = async () => {
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
  };

  useEffect(() => {
    carregarNomePerfil();
  }, [usuarioId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarNomePerfil();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, [usuarioId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo com o botão de Configurações */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title={nomeUsuario}
            buttonIcon={
              <SettingsButton
                onPress={() => router.navigate('/configuracoes')}
              />
            }
          />
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5733"
              colors={['#FF5733']}
            />
          }
        >
          <ThemedView style={styles.cardsWrapper}>
            <CardXpTotal usuarioId={usuarioId} />
            <CardSemanaQuantAtividades usuarioId={usuarioId} />
            <CardProgressoSemanal usuarioId={usuarioId} />
            <MensalCard usuarioId={usuarioId} />
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            <ThemedText type="subtitle">Troféus</ThemedText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <Trofeu tituloTrofeu="Primeiro Passo" disabled={false} />
                <Trofeu tituloTrofeu="Milhar" disabled={true} />
            </View>
          </ThemedView>

          <ThemedView style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>✨ Chegaste ao fim do perfil</ThemedText>
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
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.two,
    gap: Spacing.three,
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