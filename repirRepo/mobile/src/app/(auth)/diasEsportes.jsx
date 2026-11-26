import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const MASCOTE_FALLBACK = require('@/components/assets/mascote/pose2-mascot2.svg');

// Mapeia cada esporte para o número exato de `categoria_atividade` no banco
const CATALOGO_CORES = {
  judo: {
    id: 'judo',
    categoriaId: 7,
    nome: 'Judô',
    bg: '#C6F200',
    imagem: require('@/components/assets/mascote/pose-mascote-judo.svg'),
    escala: 1,
  },
  corrida: {
    id: 'corrida',
    categoriaId: 2,
    nome: 'Corrida',
    bg: '#F7A8F5',
    imagem: require('@/components/assets/mascote/pose-mascote-corrida.svg'),
    escala: 1,
  },
  yoga: {
    id: 'yoga',
    categoriaId: 10,
    nome: 'Yoga',
    bg: '#C6F200',
    imagem: require('@/components/assets/mascote/pose-mascote-yoga.svg'),
    escala: 1,
  },
  'muay-thai': {
    id: 'muay-thai',
    categoriaId: 8,
    nome: 'Muay Thai',
    bg: '#FF5252',
    imagem: require('@/components/assets/mascote/pose-mascote-muay.svg'),
    escala: 1,
  },
  natacao: {
    id: 'natacao',
    categoriaId: 4,
    nome: 'Natação',
    bg: '#FFA16C',
    imagem: require('@/components/assets/mascote/pose-mascote-natacao.svg'),
    escala: 1,
  },
  'jiu-jitsu': {
    id: 'jiu-jitsu',
    categoriaId: 7,
    nome: 'Jiu-Jitsu',
    bg: '#F7A8F5',
    imagem: MASCOTE_FALLBACK,
    escala: 1.06,
  },
};

function normalizarId(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === 'undefined' || texto === 'null') return null;
  return /^\d+$/.test(texto) ? texto : null;
}

export default function DiasEsportesScreen() {
  const params = useLocalSearchParams();
  const authContext = useAuth?.() || {};

  const usuarioIdContexto = normalizarId(
    authContext?.usuarioId ?? authContext?.usuario?.id ?? authContext?.user?.id ?? null
  );

  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function buscarIdNoStorage() {
      try {
        const salvo = await AsyncStorage.getItem('@usuarioId');
        const idLimpo = normalizarId(salvo);
        if (ativo) {
          setUsuarioIdStorage(idLimpo);
        }
      } catch (err) {
        console.log('Erro ao ler @usuarioId no DiasEsportes:', err?.message || err);
      }
    }

    buscarIdNoStorage();

    return () => {
      ativo = false;
    };
  }, []);

  const usuarioIdParam = useMemo(() => {
    return (
      normalizarId(params?.usuarioId) ??
      normalizarId(params?.id_usuario) ??
      normalizarId(params?.idUsuario) ??
      null
    );
  }, [params?.usuarioId, params?.id_usuario, params?.idUsuario]);

  // No fluxo de cadastro/onboarding, o ID recebido por parâmetro é o perfil recém-criado
  const usuarioId = usuarioIdParam ?? usuarioIdContexto ?? usuarioIdStorage ?? null;

  const esportesLista = useMemo(() => {
    try {
      const brutoEsportes = Array.isArray(params?.esportes)
        ? params.esportes[0]
        : params?.esportes;

      if (brutoEsportes) {
        const parsed = JSON.parse(String(brutoEsportes));
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => {
              const id = typeof item === 'object' && item !== null ? item.id : item;
              return id !== 'musculacao' && id !== 'boxe';
            })
            .map((item) => {
              if (typeof item === 'object' && item !== null) {
                const base = CATALOGO_CORES[item.id] || {};
                const categoriaId = Number(item.categoriaId ?? base.categoriaId ?? 1);
                return {
                  id: item.id,
                  categoriaId,
                  nome: item.nome || base.nome || item.id,
                  bg: base.bg || item.bg || '#FFA16C',
                  imagem: base.imagem || MASCOTE_FALLBACK,
                  escala: item.escala ?? base.escala ?? 1,
                };
              }
              const base = CATALOGO_CORES[item] || {
                categoriaId: 1,
                nome: item,
                bg: '#FFA16C',
                imagem: MASCOTE_FALLBACK,
                escala: 1,
              };
              return {
                id: item,
                categoriaId: base.categoriaId,
                nome: base.nome,
                bg: base.bg,
                imagem: base.imagem || MASCOTE_FALLBACK,
                escala: base.escala ?? 1,
              };
            });
        }
      }

      const brutoIds = Array.isArray(params?.esportesIds)
        ? params.esportesIds[0]
        : params?.esportesIds;

      if (brutoIds) {
        const ids = JSON.parse(String(brutoIds));
        if (Array.isArray(ids)) {
          return ids
            .filter((id) => id !== 'musculacao' && id !== 'boxe')
            .map((id) => {
              const base = CATALOGO_CORES[id] || {
                categoriaId: 1,
                nome: id,
                bg: '#FFA16C',
                imagem: MASCOTE_FALLBACK,
                escala: 1,
              };
              return {
                id,
                categoriaId: base.categoriaId,
                nome: base.nome,
                bg: base.bg,
                imagem: base.imagem || MASCOTE_FALLBACK,
                escala: base.escala ?? 1,
              };
            });
        }
      }

      return [];
    } catch {
      return [];
    }
  }, [params?.esportes, params?.esportesIds]);

  const diasAcumuladosParam = useMemo(() => {
    try {
      const bruto = Array.isArray(params?.diasPorAtividade)
        ? params.diasPorAtividade[0]
        : params?.diasPorAtividade;
      if (bruto) {
        const parsed = JSON.parse(String(bruto));
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // ignora erro de parse
    }
    return {};
  }, [params?.diasPorAtividade]);

  const [diasPorAtividade, setDiasPorAtividade] = useState(diasAcumuladosParam);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCategoriaId, setBuscandoCategoriaId] = useState(null);

  useEffect(() => {
    if (Object.keys(diasAcumuladosParam).length > 0) {
      setDiasPorAtividade(diasAcumuladosParam);
    }
  }, [diasAcumuladosParam]);

  async function sincronizarSessao(idNum) {
    if (!idNum || Number(idNum) <= 0) return;
    const idLimpo = Number(idNum);

    if (typeof authContext?.entrar === 'function') {
      await authContext.entrar(idLimpo);
    } else {
      await AsyncStorage.setItem('@usuarioId', String(idLimpo));
    }
  }

  async function irParaEscolherDiaAtividades(esporteFoco) {
    const categoriaIdNum = Number(esporteFoco?.categoriaId);
    let atividadesDaCategoria = [];

    setBuscandoCategoriaId(esporteFoco.id);
    try {
      const resposta = await api.get(
        `/usuarios/atividades/categoria/${categoriaIdNum}`
      );
      atividadesDaCategoria = Array.isArray(resposta?.data)
        ? resposta.data
        : resposta?.data?.atividades || [];
      console.log(`Atividades da categoria ${categoriaIdNum}:`, atividadesDaCategoria);
    } catch (err) {
      console.log(
        `Erro ao buscar atividades da categoria ${categoriaIdNum}:`,
        err?.response?.status,
        err?.response?.data || err?.message
      );
    } finally {
      setBuscandoCategoriaId(null);
    }

    const { imagem: _imagem, ...esporteSerializavel } = esporteFoco || {};
    const esportesSerializaveis = esportesLista.map(({ imagem: _img, ...resto }) => resto);

    router.push({
      pathname: '/(auth)/escolherDiaAtividades',
      params: {
        categoriaId: String(categoriaIdNum),
        idAtividade: String(
          atividadesDaCategoria[0]?.id_atividade ??
            esporteFoco?.id_atividade ??
            ''
        ),
        esporte: JSON.stringify(esporteSerializavel),
        esportes: JSON.stringify(esportesSerializaveis),
        atividadesCategoria: JSON.stringify(atividadesDaCategoria),
        diasPorAtividade: JSON.stringify(diasPorAtividade),
        ...(usuarioId ? { usuarioId: String(usuarioId) } : {}),
      },
    });
  }

  async function handleContinuar() {
    setSalvando(true);
    try {
      const idUsuarioNum = usuarioId ? Number(usuarioId) : null;
      console.log('[diasEsportes] handleContinuar usuarioId:', {
        usuarioId,
        usuarioIdParam,
        usuarioIdContexto,
        usuarioIdStorage,
        idUsuarioNum,
      });

      if (idUsuarioNum && idUsuarioNum > 0) {
        await sincronizarSessao(idUsuarioNum);
        router.replace({
          pathname: '/home',
          params: { usuarioId: String(idUsuarioNum) },
        });
        return;
      }

      router.replace('/home');
    } finally {
      setSalvando(false);
    }
  }

  async function handlePular() {
    if (usuarioId) {
      await sincronizarSessao(Number(usuarioId));
      router.replace({
        pathname: '/',
        params: { usuarioId: String(usuarioId) },
      });
      return;
    }
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Banner do Mascote */}
          <View style={styles.bannerCard}>
            <Image
              source={require('@/components/assets/fundos/fundo-onda1-rosa.png')}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
            <Image
              source={MASCOTE_FALLBACK}
              style={styles.mascotBanner}
              contentFit="contain"
            />
          </View>

          {/* Balão de fala */}
          <View style={styles.bubbleWrapper}>
            <View style={styles.speechTail} />
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                Quais dias da semana combinam com sua rotina?
              </Text>
            </View>
          </View>

          {/* Lista estritamente com os esportes escolhidos */}
          <View style={styles.list}>
            {esportesLista.map((esporte) => {
              const carregandoEste = buscandoCategoriaId === esporte.id;
              return (
                <TouchableOpacity
                  key={esporte.id}
                  style={[styles.accordionCard, { backgroundColor: esporte.bg }]}
                  onPress={() => irParaEscolherDiaAtividades(esporte)}
                  disabled={carregandoEste}
                  activeOpacity={0.85}
                >
                  <View style={styles.accordionHeader}>
                    <View style={styles.leftGroup}>
                      <View style={styles.whiteCircle}>
                        <Image
                          source={esporte.imagem || MASCOTE_FALLBACK}
                          style={[
                            styles.circleMascot,
                            esporte.escala && esporte.escala !== 1
                              ? { transform: [{ scale: esporte.escala }] }
                              : null,
                          ]}
                          contentFit="contain"
                        />
                      </View>
                      <Text style={styles.sportTitle}>
                        {carregandoEste ? `${esporte.nome}...` : esporte.nome}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ações */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, salvando && styles.primaryButtonDisabled]}
              onPress={handleContinuar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                {salvando ? 'Salvando...' : 'Continuar'}
              </Text>
            </TouchableOpacity>

            <Pressable onPress={handlePular} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Pular</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7FF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  bannerCard: {
    width: '100%',
    height: 155,
    backgroundColor: '#F46A41',
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingLeft: 18,
  },
  mascotBanner: {
    width: 130,
    height: 130,
  },
  bubbleWrapper: {
    position: 'relative',
    paddingTop: 10,
    marginTop: 10,
    marginBottom: 22,
    alignSelf: 'flex-start',
  },
  speechTail: {
    position: 'absolute',
    top: 0,
    left: 28,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D6DEE8',
  },
  speechBubble: {
    backgroundColor: '#D6DEE8',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    maxWidth: 270,
  },
  speechText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1E293B',
    fontWeight: '500',
  },
  list: {
    gap: 16,
  },
  accordionCard: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  whiteCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleMascot: {
    width: 34,
    height: 34,
  },
  sportTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  actions: {
    marginTop: 28,
    alignItems: 'center',
    gap: 14,
  },
  primaryButton: {
    width: '82%',
    backgroundColor: '#F45828',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: '#F47B53',
    fontSize: 14,
    fontWeight: '500',
  },
});