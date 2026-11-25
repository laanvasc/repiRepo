import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
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

function normalizarId(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === 'undefined' || texto === 'null') return null;
  return texto;
}

// Define categoria exibida, cor de fundo, borda e texto de cada card
const getCategoryStyle = (item, index = 0) => {
  const numId = Number(
    item?.categoria_atividade ?? item?.id_categoria ?? item?.categoria
  );
  const nome = String(item?.nome_atividade || item?.nome || '').toLowerCase();

  if (numId === 2) {
    return {
      bg: '#FF5252',
      border: '#E03E3E',
      text: '#FFFFFF',
      categoria: 'Corrida',
    };
  }

  if (numId === 4) {
    return {
      bg: '#FFA16C',
      border: '#E8854C',
      text: '#FFFFFF',
      categoria: 'Natação',
    };
  }

  if (numId === 7) {
    if (nome.includes('jiu')) {
      return {
        bg: '#F7A8F5',
        border: '#D982D7',
        text: '#FFFFFF',
        categoria: 'Jiu-Jitsu',
      };
    }
    return {
      bg: '#22C55E',
      border: '#16A34A',
      text: '#FFFFFF',
      categoria: 'Judô',
    };
  }

  if (numId === 8) {
    return {
      bg: '#FF5252',
      border: '#E03E3E',
      text: '#FFFFFF',
      categoria: 'Muay Thai',
    };
  }

  if (numId === 10) {
    return {
      bg: '#3B82F6',
      border: '#2563EB',
      text: '#FFFFFF',
      categoria: 'Yoga',
    };
  }

  const fallback = [
    { bg: '#FF5252', border: '#E03E3E', text: '#FFFFFF', categoria: 'Corrida' },
    { bg: '#FFA16C', border: '#E8854C', text: '#FFFFFF', categoria: 'Natação' },
    { bg: '#22C55E', border: '#16A34A', text: '#FFFFFF', categoria: 'Judô' },
    { bg: '#3B82F6', border: '#2563EB', text: '#FFFFFF', categoria: 'Yoga' },
  ];

  return fallback[Math.abs(Number(index) || 0) % fallback.length];
};

export default function AtividadesScreen() {
  const params = useLocalSearchParams();
  const auth = useAuth?.() || {};

  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarStorageId = useCallback(async () => {
    try {
      const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
      const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
      const salvo = await AsyncStorage?.getItem?.('usuarioId');
      const idLimpo = normalizarId(salvo);
      if (idLimpo) {
        setUsuarioIdStorage(idLimpo);
      }
      return idLimpo;
    } catch (err) {
      console.error('Erro ao ler usuarioId do AsyncStorage em Atividades:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    carregarStorageId();
  }, [carregarStorageId, params?.usuarioId]);

  const usuarioIdParam = useMemo(() => {
    return (
      normalizarId(params?.usuarioId) ??
      normalizarId(params?.id_usuario) ??
      normalizarId(params?.idUsuario) ??
      null
    );
  }, [params?.usuarioId, params?.id_usuario, params?.idUsuario]);

  const usuarioIdContexto = normalizarId(
    auth?.usuarioId ?? auth?.usuario?.id ?? auth?.user?.id ?? null
  );

  // Prioriza o ID da rota, depois o AsyncStorage e por último o AuthContext
  const usuarioId = usuarioIdParam ?? usuarioIdStorage ?? usuarioIdContexto ?? null;

  const diaAtualInfo = useMemo(() => {
    const idxDia = new Date().getDay();
    return MAPA_DIAS_SEMANA[idxDia] || MAPA_DIAS_SEMANA[3];
  }, []);

  const refetchAtividades = useCallback(async ({ isPullToRefresh = false } = {}) => {
    const idAtual = usuarioId ?? (await carregarStorageId());

    if (!idAtual) {
      setAtividades([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(`/usuarios/${idAtual}/atividades-frequentes`);
      setAtividades(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar atividades frequentes:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioId, carregarStorageId]);

  useFocusEffect(
    useCallback(() => {
      refetchAtividades({ isPullToRefresh: false });
    }, [refetchAtividades])
  );

  const onRefresh = useCallback(() => {
    refetchAtividades({ isPullToRefresh: true });
  }, [refetchAtividades]);

  const handleFinalizarAtividades = async () => {
    const idAtual = usuarioId ?? (await carregarStorageId());
    if (!idAtual) return;

    try {
      await api.post(`/usuarios/${idAtual}/atualizar-ofensiva`);
      await refetchAtividades({ isPullToRefresh: true });
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

          {/* <TouchableOpacity
            style={styles.addBottomButton}
            onPress={() => router.push('/cadastrarAtividade')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FF5733" />
            <Text style={styles.addBottomButtonText}>Adicionar nova atividade</Text>
          </TouchableOpacity> */}

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