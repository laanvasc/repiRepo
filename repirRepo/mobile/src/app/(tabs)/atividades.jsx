import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Platform, ScrollView, StyleSheet, ActivityIndicator, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';
import Button from '@/components/ui/Button';
import AtividadeFrequenteCard from '@/components/ui/AtividadeFrequenteCard';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AtividadesScreen() {
  const { usuarioId } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarAtividadesFrequentes() {
      if (!usuarioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/atividades-frequentes`);
        setAtividades(response.data || []);
      } catch (err) {
        console.error('Erro ao carregar atividades frequentes:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarAtividadesFrequentes();
  }, [usuarioId]);

  const handleFinalizarAtividades = async () => {
    if (!usuarioId) return;

    try {
      await api.post(`/usuarios/${usuarioId}/atualizar-ofensiva`);
      Alert.alert('Sucesso', 'Atividades diárias registadas com sucesso!');
    } catch (err) {
      console.error('Erro ao finalizar atividades:', err);
      Alert.alert('Erro', 'Não foi possível concluir as atividades.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Imagem de Fundo cobrindo absolutamente todo o ecrã */}
      <Image
        source={require('@/components/assets/fundos/fundo-onda1-rosa.png')}
        style={[StyleSheet.absoluteFillObject, styles.backgroundImage]}
        contentFit="cover"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <HeaderAreaView
          title="Suas atividades"
          buttonIcon={
            <NotificationButton
              onPress={() => console.log('Notificações clicadas!')}
            />
          }
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#FF5E32" />
            </View>
          ) : (
            <ThemedView style={styles.cardsContainer}>
              {atividades.length > 0 ? (
                atividades.map((item) => (
                  <AtividadeFrequenteCard
                    key={item.id_atividade_frequente}
                    titulo={item.nome_atividade}
                    categoria={item.categoria}
                    onPress={() => console.log('Atividade clicada:', item.id_atividade_frequente)}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhuma atividade frequente encontrada.</Text>
              )}
            </ThemedView>
          )}

          <ThemedView style={styles.buttonContainer}>
            <Button titulo="Finalizar atividades diárias" onPress={handleFinalizarAtividades} />
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
  backgroundImage: {
    // width: '100%',
    // height: '100%',
    // transform: [{ scale: 1.05 }],
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingVertical: Spacing.two,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  cardsContainer: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
    width: '100%',
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    marginTop: Spacing.two,
    width: '100%',
  },
  loaderContainer: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginTop: Spacing.two,
    fontWeight: '600',
  },
});