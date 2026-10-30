import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

import { useAuth } from '@/context/AuthContext'; // <-- 1. Importa o hook de autenticação

export default function HomeScreen() {
  const { usuarioId } = useAuth();
  console.log('🏠 HomeScreen renderizada com o usuarioId:', usuarioId);

  const [primeiroNome, setPrimeiroNome] = useState('Usuário');

  // Busca o nome do usuário logado ao carregar a Home
useEffect(() => {
    let isMounted = true;

    async function carregarNomeUsuario() {
      if (!usuarioId) return; // <-- Garante que só executa se o ID existir
      
      try {
        const response = await api.get(`/usuarios/${usuarioId}/nome`);
        if (isMounted) {
          const nomeCompleto = typeof response.data === 'string' 
            ? response.data 
            : (response.data?.nome || response.data?.nome_usuario || 'Usuário');
          setPrimeiroNome(nomeCompleto.trim().split(' ')[0]);
        }
      } catch (err) {
        if (isMounted) console.error('Erro ao buscar o nome:', err);
      }
    }

    carregarNomeUsuario();

    return () => {
      isMounted = false;
    };
  }, [usuarioId]);

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
            {/* 4. Passa o usuarioId global para todos os cartões */}
            <CardOfensiva usuarioId={usuarioId} /> 
            {/* <CardSemanaQuantAtividades usuarioId={usuarioId} /> */}
            {/* <CardProgressoSemanal usuarioId={usuarioId} /> */}
            <ProximaAtividadeCard usuarioId={usuarioId} />
            <CardConquistasDesbloqueadas usuarioId={usuarioId} />
            <CardDestaquesSemanas usuarioId={usuarioId} />
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