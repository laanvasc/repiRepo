import { useCallback, useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/services/api';

import { router } from 'expo-router';

import HeaderAreaView from '@/components/header-area-view';
import { NotificationButton } from '@/components/ui/NotificationButton';
import ProximaAtividadeCard from '@/components/ui/ProximaAtividadeCard';

import { CardConquistasDesbloqueadas } from '../../components/ui/CardConquistasDesbloqueadas';
import CardDestaquesSemanas from '../../components/ui/CardDestaquesSemana';
import CardOfensiva from '../../components/ui/CardOfensiva';

import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { usuarioId } = useAuth();
  console.log('🏠 HomeScreen renderizada com o usuarioId:', usuarioId);

  const [primeiroNome, setPrimeiroNome] = useState('Usuário');
  const [listaAtividadesFrequentes, setListaAtividadesFrequentes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Função para buscar o nome do utilizador
  const carregarNomeUsuario = async () => {
    if (!usuarioId) return;
    
    try {
      const response = await api.get(`/usuarios/${usuarioId}/nome`);
      const nomeCompleto = typeof response.data === 'string' 
        ? response.data 
        : (response.data?.nome || response.data?.nome_usuario || 'Usuário');
      setPrimeiroNome(nomeCompleto.trim().split(' ')[0]);
    } catch (err) {
      console.error('Erro ao buscar o nome:', err);
    }
  };

  // Função para buscar as atividades frequentes do utilizador
  const carregarAtividades = async () => {
    if (!usuarioId) return;

    try {
      const response = await api.get(`/usuarios/${usuarioId}/atividades-frequentes`);
      setListaAtividadesFrequentes(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar atividades frequentes:', err);
    }
  };

  // Carrega os dados ao iniciar ou mudar o ID do utilizador
  useEffect(() => {
    carregarNomeUsuario();
    carregarAtividades();
  }, [usuarioId]);

  // Função disparada ao puxar o ecrã para cima (Pull-to-Refresh)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      carregarNomeUsuario(),
      carregarAtividades()
    ]);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, [usuarioId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo com espaçamento lateral uniforme */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView 
            title={`Olá, ${primeiroNome}!`} 
            subtitle="Pronto para sua próxima meta?"
            buttonIcon={
              <NotificationButton 
                onPress={() => router.navigate('/notificacoes')} 
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
          <ThemedView style={styles.heroSection}>
            {/* Conteúdo hero */}
          </ThemedView>

          <ThemedView style={styles.cardsContainer}>
            <CardOfensiva usuarioId={usuarioId} /> 
            <ProximaAtividadeCard atividades={listaAtividadesFrequentes} />
            <CardConquistasDesbloqueadas usuarioId={usuarioId} />
            <CardDestaquesSemanas usuarioId={usuarioId} />
          </ThemedView>

          {/* Indicador visual de fim de conteúdo */}
          <ThemedView style={styles.footerContainer}>
            <Text style={styles.footerText}>✨ Chegaste ao fim da página</Text>
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  cardsContainer: {
    width: '100%',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 13,
    color: '#888888',
    opacity: 0.8,
  },
});