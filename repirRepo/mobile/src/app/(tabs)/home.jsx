import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/services/api';

import HeaderAreaView from '@/components/header-area-view';
import { NotificationButton } from '@/components/ui/NotificationButton';
import ProximaAtividadeCard from '@/components/ui/ProximaAtividadeCard';

import { CardConquistasDesbloqueadas } from '../../components/ui/CardConquistasDesbloqueadas';
import CardDestaquesSemanas from '../../components/ui/CardDestaquesSemana';
import CardOfensiva from '../../components/ui/CardOfensiva';
import CardProgressoSemanal from '../../components/ui/CardProgressoSemana';
import CardSemanaQuantAtividades from '../../components/ui/CardSemanaQuantAtividades';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const usuarioLogadoId = params.usuarioId ? Number(params.usuarioId) : null;

  const [primeiroNome, setPrimeiroNome] = useState('Usuário');

  // Busca o nome do usuário logado ao carregar a Home
  useEffect(() => {
    async function carregarNomeUsuario() {
      if (!usuarioLogadoId) return;
      try {
        const response = await api.get(`/usuarios/${usuarioLogadoId}/nome`);
        // O backend pode retornar um objeto ou string direta. Vamos tratar ambos:
        const nomeCompleto = typeof response.data === 'string' 
          ? response.data 
          : (response.data?.nome || response.data?.nome_usuario || 'Usuário');
        
        // Pega apenas o primeiro nome (ex: "João Silva" vira "João")
        const apenasPrimeiro = nomeCompleto.trim().split(' ')[0];
        setPrimeiroNome(apenasPrimeiro);
      } catch (err) {
        console.error('Erro ao buscar o nome do usuário:', err);
      }
    }

    carregarNomeUsuario();
  }, [usuarioLogadoId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header dinâmico exibindo apenas o primeiro nome */}
          <HeaderAreaView 
            title={`Olá, ${primeiroNome}!`} 
            subtitle="Pronto para sua próxima meta?"
            buttonIcon={
              <NotificationButton onPress={() => console.log('Notificações clicadas!')} />
            }
          />

          <ThemedView style={styles.heroSection}>
            {/* Conteúdo hero */}
          </ThemedView>

          <ThemedView style={styles.cardsContainer}>
            <CardOfensiva usuarioId={usuarioLogadoId} /> 
            <CardSemanaQuantAtividades usuarioId={usuarioLogadoId} />
            <CardProgressoSemanal usuarioId={usuarioLogadoId} />
            <ProximaAtividadeCard usuarioId={usuarioLogadoId} />
            <CardConquistasDesbloqueadas usuarioId={usuarioLogadoId} />
            <CardDestaquesSemanas usuarioId={usuarioLogadoId} />
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
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
  cardsContainer: {
    width: '100%',
    gap: Spacing.three,
  },
});