import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import CategoriaAtividadeCard from '@/components/ui/CategoriaAtividadeCard';
import { NotificationButton } from '@/components/ui/NotificationButton';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const MAPA_DIAS_SEMANA = {
  0: { key: 'repete_dom', label: 'Domingo' },
  1: { key: 'repete_seg', label: 'Segunda-feira' },
  2: { key: 'repete_ter', label: 'Terça-feira' },
  3: { key: 'repete_qua', label: 'Quarta-feira' },
  4: { key: 'repete_qui', label: 'Quinta-feira' },
  5: { key: 'repete_sex', label: 'Sexta-feira' },
  6: { key: 'repete_sab', label: 'Sábado' },
};

const MASCOTE_PADRAO = require('@/components/assets/mascote/pose2-mascot2.svg');

const IMAGENS_CATEGORIA = {
  Corrida: require('@/components/assets/mascote/pose-mascote-corrida.svg'),
  'Judô': require('@/components/assets/mascote/pose-mascote-judo.svg'),
  'Jiu-Jitsu': MASCOTE_PADRAO,
  'Muay Thai': require('@/components/assets/mascote/pose-mascote-muay.svg'),
  'Natação': require('@/components/assets/mascote/pose-mascote-natacao.svg'),
  Yoga: require('@/components/assets/mascote/pose-mascote-yoga.svg'),
};

function normalizarId(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === 'undefined' || texto === 'null') return null;
  return texto;
}

const getCategoryMeta = (item, index = 0) => {
  const numId = Number(
    item?.categoria_atividade ?? item?.id_categoria ?? item?.categoria
  );
  const nome = String(item?.nome_atividade || item?.nome || '').toLowerCase();

  if (numId === 2) {
    return {
      key: 'corrida',
      categoria: 'Corrida',
      bg: '#FF5D57',
      imagem: IMAGENS_CATEGORIA.Corrida,
    };
  }

  if (numId === 4) {
    return {
      key: 'natacao',
      categoria: 'Natação',
      bg: '#FF5D57',
      imagem: IMAGENS_CATEGORIA['Natação'],
    };
  }

  if (numId === 7) {
    if (nome.includes('jiu')) {
      return {
        key: 'jiu-jitsu',
        categoria: 'Jiu-Jitsu',
        bg: '#FF5D57',
        imagem: IMAGENS_CATEGORIA['Jiu-Jitsu'],
      };
    }
    return {
      key: 'judo',
      categoria: 'Judô',
      bg: '#FF5D57',
      imagem: IMAGENS_CATEGORIA['Judô'],
    };
  }

  if (numId === 8) {
    return {
      key: 'muay-thai',
      categoria: 'Muay Thai',
      bg: '#FF5D57',
      imagem: IMAGENS_CATEGORIA['Muay Thai'],
    };
  }

  if (numId === 10) {
    return {
      key: 'yoga',
      categoria: 'Yoga',
      bg: '#FF5D57',
      imagem: IMAGENS_CATEGORIA.Yoga,
    };
  }

  const fallback = [
    { key: 'corrida', categoria: 'Corrida', bg: '#FF5D57', imagem: IMAGENS_CATEGORIA.Corrida },
    { key: 'judo', categoria: 'Judô', bg: '#FF5D57', imagem: IMAGENS_CATEGORIA['Judô'] },
    { key: 'yoga', categoria: 'Yoga', bg: '#FF5D57', imagem: IMAGENS_CATEGORIA.Yoga },
    { key: 'natacao', categoria: 'Natação', bg: '#FF5D57', imagem: IMAGENS_CATEGORIA['Natação'] },
  ];

  return fallback[Math.abs(Number(index) || 0) % fallback.length];
};

export default function AtividadesScreen() {
  const params = useLocalSearchParams();
  const auth = useAuth?.() || {};

  const usuarioIdContexto = normalizarId(
    auth?.usuarioId ?? auth?.usuario?.id ?? auth?.user?.id ?? null
  );

  const usuarioIdParam = useMemo(() => {
    return (
      normalizarId(params?.usuarioId) ??
      normalizarId(params?.id_usuario) ??
      normalizarId(params?.idUsuario) ??
      null
    );
  }, [params?.usuarioId, params?.id_usuario, params?.idUsuario]);

  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaSelecionadaKey, setCategoriaSelecionadaKey] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarStorageId() {
      try {
        const salvo = await AsyncStorage.getItem('@usuarioId');
        const idLimpo = normalizarId(salvo);
        if (ativo) {
          setUsuarioIdStorage(idLimpo);
        }
      } catch (err) {
        console.error('Erro ao ler @usuarioId do AsyncStorage em Atividades:', err);
      }
    }

    carregarStorageId();

    return () => {
      ativo = false;
    };
  }, [usuarioIdContexto, params?.usuarioId]);

  const usuarioId = usuarioIdContexto ?? usuarioIdStorage ?? usuarioIdParam ?? null;

  const diaAtualInfo = useMemo(() => {
    const idxDia = new Date().getDay();
    return MAPA_DIAS_SEMANA[idxDia] || MAPA_DIAS_SEMANA[4];
  }, []);

  const refetchAtividades = useCallback(async ({ isPullToRefresh = false } = {}) => {
    if (!usuarioId) {
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

      const response = await api.get(`/usuarios/${usuarioId}/atividades-frequentes`);
      setAtividades(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar atividades frequentes:', err.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioId]);

  useFocusEffect(
    useCallback(() => {
      refetchAtividades({ isPullToRefresh: false });
    }, [refetchAtividades])
  );

  const onRefresh = useCallback(() => {
    refetchAtividades({ isPullToRefresh: true });
  }, [refetchAtividades]);

  const atividadesDoDia = useMemo(() => {
    return atividades.filter((item) => Boolean(item?.[diaAtualInfo.key]) === true);
  }, [atividades, diaAtualInfo.key]);

  const categoriasDoDia = useMemo(() => {
    const mapa = new Map();

    atividadesDoDia.forEach((item, index) => {
      const meta = getCategoryMeta(item, index);
      if (!mapa.has(meta.key)) {
        mapa.set(meta.key, {
          key: meta.key,
          titulo: meta.categoria,
          corFundo: meta.bg,
          imagem: meta.imagem,
          concluidas: 0,
          total: 0,
          itens: [],
        });
      }

      const grupo = mapa.get(meta.key);
      grupo.total += 1;
      if (Boolean(item?.realizada_hoje)) {
        grupo.concluidas += 1;
      }
      grupo.itens.push(item);
    });

    return Array.from(mapa.values());
  }, [atividadesDoDia]);

  const categoriaAberta = useMemo(() => {
    if (!categoriaSelecionadaKey) return null;
    return categoriasDoDia.find((c) => c.key === categoriaSelecionadaKey) || null;
  }, [categoriasDoDia, categoriaSelecionadaKey]);

  function handleAbrirAtividade(item) {
    if (Boolean(item?.realizada_hoje)) {
      Alert.alert('Atividade concluída', 'Você já concluiu esta atividade hoje.');
      return;
    }

    setCategoriaSelecionadaKey(null);
    router.push({
      pathname: '/registrarAtividade',
      params: {
        id_atividade: item.id_atividade,
        nome_atividade: item.nome_atividade,
        horario: item.horario || 'Horário flexível',
      },
    });
  }

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

            {categoriasDoDia.length > 0 ? (
              <View style={styles.grid}>
                {categoriasDoDia.map((cat) => (
                  <CategoriaAtividadeCard
                    key={cat.key}
                    titulo={cat.titulo}
                    concluidas={cat.concluidas}
                    total={cat.total}
                    corFundo={cat.corFundo}
                    imagem={cat.imagem}
                    onPress={() => setCategoriaSelecionadaKey(cat.key)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma atividade agendada para {diaAtualInfo.label.toLowerCase()}.
              </Text>
            )}
          </ThemedView>

          <ThemedView style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>✨ Chegaste ao fim das atividades</ThemedText>
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>

        <Modal
          visible={Boolean(categoriaAberta)}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoriaSelecionadaKey(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{categoriaAberta?.titulo}</Text>
                  <Text style={styles.modalSubtitle}>
                    {categoriaAberta?.concluidas ?? 0} de {categoriaAberta?.total ?? 0} concluídas hoje
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCategoriaSelecionadaKey(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {categoriaAberta?.itens?.map((item) => {
                  const concluida = Boolean(item?.realizada_hoje);
                  return (
                    <TouchableOpacity
                      key={item.id_atividade_frequente}
                      style={[
                        styles.atividadeItem,
                        concluida && styles.atividadeItemConcluida,
                      ]}
                      onPress={() => handleAbrirAtividade(item)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.atividadeInfo}>
                        <Text style={styles.atividadeNome}>
                          {item.nome_atividade || 'Atividade'}
                        </Text>
                        <Text style={styles.atividadeStatus}>
                          {concluida ? 'Concluída hoje' : 'Toque para registrar'}
                        </Text>
                      </View>

                      <Ionicons
                        name={concluida ? 'checkmark-circle' : 'chevron-forward'}
                        size={22}
                        color={concluida ? '#16A34A' : '#FF5D57'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
    gap: Spacing.three,
    backgroundColor: 'transparent',
    width: '100%',
  },
  diaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF7FF',
    borderRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  modalList: {
    maxHeight: 320,
  },
  atividadeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  atividadeItemConcluida: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  atividadeInfo: {
    flex: 1,
    marginRight: 10,
  },
  atividadeNome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  atividadeStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
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