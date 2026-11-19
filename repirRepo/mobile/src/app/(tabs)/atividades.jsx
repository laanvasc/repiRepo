import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AtividadeFrequenteCard from '@/components/ui/AtividadeFrequenteCard';
import Button from '@/components/ui/Button';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

// Mapeia getDay() (0 = Domingo ... 6 = Sábado) para a chave booleana e o rótulo do dia
const MAPA_DIAS_SEMANA = {
  0: { key: 'repete_dom', label: 'Domingo' },
  1: { key: 'repete_seg', label: 'Segunda-feira' },
  2: { key: 'repete_ter', label: 'Terça-feira' },
  3: { key: 'repete_qua', label: 'Quarta-feira' },
  4: { key: 'repete_qui', label: 'Quinta-feira' },
  5: { key: 'repete_sex', label: 'Sexta-feira' },
  6: { key: 'repete_sab', label: 'Sábado' },
};

// Função auxiliar para definir cores e metadados baseados na categoria_atividade ou no nome da atividade
const getCategoryStyle = (item, index = 0) => {
  const catId = item?.categoria_atividade ?? item?.categoria;
  const numId = Number(catId);
  const nomeAtividade = (item?.nome_atividade || '').toLowerCase();
  const catTexto = String(catId || '').toLowerCase();

  // 1. Cardio (Coral / Vermelho vibrante)
  if (
    numId === 1 ||
    catTexto.includes('cardio') ||
    nomeAtividade.includes('corrida') ||
    nomeAtividade.includes('caminhada') ||
    nomeAtividade.includes('bike') ||
    nomeAtividade.includes('ciclismo') ||
    nomeAtividade.includes('esteira')
  ) {
    return {
      bg: '#FF5252',
      border: '#E03E3E',
      text: '#FFFFFF',
      categoria: 'Cardio',
    };
  }

  // 2. Força (Verde vibrante)
  if (
    numId === 2 ||
    catTexto.includes('força') ||
    catTexto.includes('forca') ||
    nomeAtividade.includes('musculação') ||
    nomeAtividade.includes('musculacao') ||
    nomeAtividade.includes('treino') ||
    nomeAtividade.includes('peso') ||
    nomeAtividade.includes('quadriceps') ||
    nomeAtividade.includes('supino') ||
    nomeAtividade.includes('perna')
  ) {
    return {
      bg: '#22C55E',
      border: '#16A34A',
      text: '#FFFFFF',
      categoria: 'Força',
    };
  }

  // 3. Flexibilidade (Azul vibrante)
  if (
    numId === 3 ||
    catTexto.includes('flex') ||
    nomeAtividade.includes('yoga') ||
    nomeAtividade.includes('alongamento') ||
    nomeAtividade.includes('pilates')
  ) {
    return {
      bg: '#3B82F6',
      border: '#2563EB',
      text: '#FFFFFF',
      categoria: 'Flexibilidade',
    };
  }

  // 4. Recuperação (Roxo / Púrpura vibrante)
  if (
    numId === 4 ||
    catTexto.includes('recupera') ||
    nomeAtividade.includes('descanso') ||
    nomeAtividade.includes('massagem') ||
    nomeAtividade.includes('sauna')
  ) {
    return {
      bg: '#A855F7',
      border: '#9333EA',
      text: '#FFFFFF',
      categoria: 'Recuperação',
    };
  }

  // Fallback dinâmico alternando entre as cores das 4 categorias para visual diferenciado
  const paletaFallback = [
    { bg: '#FF5252', border: '#E03E3E', text: '#FFFFFF', categoria: 'Cardio' },
    { bg: '#22C55E', border: '#16A34A', text: '#FFFFFF', categoria: 'Força' },
    { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF', categoria: 'Flexibilidade' },
    { bg: '#A855F7', border: '#9333EA', text: '#FFFFFF', categoria: 'Recuperação' },
  ];

  const chosenIndex = typeof index === 'number' && !isNaN(index)
    ? Math.abs(index) % paletaFallback.length
    : (Math.abs(Number(item?.id_atividade_frequente || item?.id_atividade || 0)) % paletaFallback.length);

  return paletaFallback[chosenIndex];
};

export default function AtividadesScreen() {
  const { usuarioId } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const diaAtualInfo = useMemo(() => {
    const idxDia = new Date().getDay();
    return MAPA_DIAS_SEMANA[idxDia] || MAPA_DIAS_SEMANA[3];
  }, []);

  const carregarAtividadesFrequentes = async () => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/usuarios/${usuarioId}/atividades-frequentes`);
      setAtividades(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar atividades frequentes:', err.response?.data || err.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    carregarAtividadesFrequentes();
  }, [usuarioId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarAtividadesFrequentes();
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
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

  // Filtra apenas as atividades frequentes agendadas para o dia da semana atual
  const atividadesDoDia = useMemo(() => {
    return atividades.filter((item) => Boolean(item?.[diaAtualInfo.key]) === true);
  }, [atividades, diaAtualInfo.key]);

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/components/assets/fundos/fundo-onda1-rosa.png')}
        style={[StyleSheet.absoluteFillObject, styles.backgroundImage]}
        contentFit="cover"
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title="Suas atividades"
            buttonIcon={
              <NotificationButton
                onPress={() => router.push('/notificacoes')}
              />
            }
          />
        </ThemedView>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5733"
              colors={['#FF5733']}
            />
          }
        >
          <ThemedView style={styles.cardsContainer}>
            <ThemedText type="subtitle" style={styles.diaTitle}>
              {diaAtualInfo.label}
            </ThemedText>

            {atividadesDoDia.length > 0 ? (
              atividadesDoDia.map((item, index) => {
                const catStyle = getCategoryStyle(item, index);

                return (
                  <AtividadeFrequenteCard
                    key={item.id_atividade_frequente}
                    titulo={item.nome_atividade}
                    horario={item.horario}
                    categoria={catStyle.categoria}
                    concluida={item.realizada_hoje}
                    cardStyle={{
                      backgroundColor: catStyle.bg,
                      borderColor: catStyle.border,
                    }}
                    textColor={catStyle.text}
                    onPress={() => {
                      if (item.realizada_hoje) {
                        return;
                      }

                      router.push({
                        pathname: '/registrarAtividade',
                        params: {
                          id_atividade: item.id_atividade,
                          nome_atividade: item.nome_atividade,
                          horario: item.horario || 'Horário flexível',
                        },
                      });
                    }}
                  />
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma atividade agendada para {diaAtualInfo.label.toLowerCase()}.
              </Text>
            )}
          </ThemedView>

          <TouchableOpacity
            style={styles.addBottomButton}
            onPress={() => router.push('/cadastrarAtividade')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FF5733" />
            <Text style={styles.addBottomButtonText}>Adicionar nova atividade</Text>
          </TouchableOpacity>

          {/* <ThemedView style={styles.buttonContainer}>
            <Button titulo="Finalizar atividades diárias" onPress={handleFinalizarAtividades} />
          </ThemedView> */}

          <ThemedView style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>✨ Chegaste ao fim das atividades</ThemedText>
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>

        {/* OVERLAY DE CARREGAMENTO DE TELA INTEIRA */}
        {loading && (
          <View style={styles.overlayCarregamento}>
            <ActivityIndicator size="large" color="#FF5733" />
            <Text style={styles.textoCarregamento}>A carregar as atividades...</Text>
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {},
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  cardsContainer: {
    gap: Spacing.two,
    backgroundColor: 'transparent',
    width: '100%',
  },
  diaTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  addBottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF5733',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: Spacing.one,
  },
  addBottomButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF5733',
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    marginTop: Spacing.one,
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginTop: Spacing.two,
    fontWeight: '600',
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
  overlayCarregamento: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF7FF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    gap: 12,
  },
  textoCarregamento: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});