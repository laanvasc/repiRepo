import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import CardXpTotal from '@/components/ui/CardXpTotal';
import MensalCard from '@/components/ui/MensalCard';
import { WebBadge } from '@/components/web-badge';
import Trofeu from '../../components/ui/Trofeu';

import CardProgressoSemanal from '../../components/ui/CardProgressoSemana';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const AVATAR_PADRAO = require('@/components/assets/mascote/pose1-mascot1.png');

function normalizarId(valor) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  if (!texto || texto === 'undefined' || texto === 'null') return null;
  return texto;
}

function extrairAnoCriacao(payload) {
  if (!payload || typeof payload !== 'object') {
    return String(new Date().getFullYear());
  }

  const rawDate =
    payload.data_criacao ??
    payload.criado_em ??
    payload.created_at ??
    payload.createdAt ??
    payload.dataCadastro ??
    payload.data_cadastro ??
    null;

  if (rawDate) {
    const matchAno = String(rawDate).match(/\b(19|20)\d{2}\b/);
    if (matchAno) return matchAno[0];

    const parsed = new Date(rawDate);
    if (!Number.isNaN(parsed.getTime())) {
      return String(parsed.getFullYear());
    }
  }

  if (payload.ano_criacao || payload.ano) {
    const matchAnoDireto = String(payload.ano_criacao || payload.ano).match(/\b(19|20)\d{2}\b/);
    if (matchAnoDireto) return matchAnoDireto[0];
  }

  return String(new Date().getFullYear());
}

function extrairNomeUsuario(data, fallback = '') {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }
  if (data && typeof data === 'object') {
    const encontrado =
      data.nome ||
      data.nome_usuario ||
      data.nomeUsuario ||
      data.usuario?.nome ||
      data.user?.nome ||
      '';
    if (typeof encontrado === 'string' && encontrado.trim()) {
      return encontrado.trim();
    }
  }
  return fallback;
}

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
  const params = useLocalSearchParams();
  const auth = useAuth?.() || {};

  const usuarioIdContexto = normalizarId(
    auth?.usuarioId ?? auth?.usuario?.id ?? auth?.user?.id ?? null
  );

  const nomeContexto = useMemo(() => {
    return extrairNomeUsuario(auth?.usuario ?? auth?.user ?? auth, '');
  }, [auth]);

  const usuarioIdParam = useMemo(() => {
    return (
      normalizarId(params?.usuarioId) ??
      normalizarId(params?.id_usuario) ??
      normalizarId(params?.idUsuario) ??
      null
    );
  }, [params?.usuarioId, params?.id_usuario, params?.idUsuario]);

  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState(nomeContexto);
  const [anoCriacao, setAnoCriacao] = useState(() => String(new Date().getFullYear()));
  const [progressoSemanal, setProgressoSemanal] = useState([]);
  const [conquistas, setConquistas] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerVisivelRef = useRef(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (nomeContexto) {
      setNomeUsuario((prev) => prev || nomeContexto);
    }
  }, [nomeContexto]);

  useEffect(() => {
    let ativo = true;

    async function carregarStorageId() {
      try {
        const salvo = await AsyncStorage.getItem('@usuarioId');
        const idLimpo = normalizarId(salvo);
        if (ativo) {
          setUsuarioIdStorage(idLimpo);
        }

        const usuarioSalvoRaw =
          (await AsyncStorage.getItem('@usuario')) ??
          (await AsyncStorage.getItem('usuario'));

        if (usuarioSalvoRaw && ativo) {
          try {
            const usuarioSalvo = JSON.parse(usuarioSalvoRaw);
            const nomeSalvo = extrairNomeUsuario(usuarioSalvo, '');
            if (nomeSalvo) {
              setNomeUsuario((prev) => prev || nomeSalvo);
            }
          } catch {
            // ignora se não for JSON
          }
        }
      } catch (err) {
        console.error('Erro ao ler @usuarioId do AsyncStorage no Perfil:', err);
      }
    }

    carregarStorageId();

    return () => {
      ativo = false;
    };
  }, [usuarioIdContexto, params?.usuarioId]);

  // Prioriza o ID do contexto de autenticação, depois o storage e por último o parâmetro da rota
  const usuarioId = usuarioIdContexto ?? usuarioIdStorage ?? usuarioIdParam ?? null;

  const carregarDadosPerfil = useCallback(async ({ isPullToRefresh = false, showFullOverlay = false } = {}) => {
    setRefreshKey((prev) => prev + 1);

    if (!usuarioId) {
      setNomeUsuario(nomeContexto || '');
      setAnoCriacao(String(new Date().getFullYear()));
      setProgressoSemanal([]);
      setConquistas([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else if (showFullOverlay) {
        setLoading(true);
      }

      // 1. Carregar nome e metadados do utilizador
      const resNome = await api.get(`/usuarios/${usuarioId}/nome`);
      const nomeApi = extrairNomeUsuario(resNome.data, nomeContexto);
      if (nomeApi) {
        setNomeUsuario(nomeApi);
      }
      setAnoCriacao(extrairAnoCriacao(resNome.data));

      // 2. Carregar progresso semanal real do utilizador
      const resProgresso = await api.get(`/usuarios/${usuarioId}/progresso-semanal`);
      setProgressoSemanal(Array.isArray(resProgresso.data) ? resProgresso.data : []);

      // 3. Carregar conquistas / troféus reais do utilizador
      const resConquistas = await api.get(`/usuarios/${usuarioId}/conquistas`);
      setConquistas(Array.isArray(resConquistas.data) ? resConquistas.data : []);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 300);
    }
  }, [usuarioId, nomeContexto]);

  useFocusEffect(
    useCallback(() => {
      carregarDadosPerfil({ isPullToRefresh: false, showFullOverlay: false });
    }, [carregarDadosPerfil])
  );

  const onRefresh = useCallback(async () => {
    await carregarDadosPerfil({ isPullToRefresh: true, showFullOverlay: false });
  }, [carregarDadosPerfil]);

  const handleScroll = useCallback((event) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;

    // Histerese (85 para mostrar, 55 para ocultar) evita alternância rápida perto do limiar
    let proximoEstado = headerVisivelRef.current;
    if (!headerVisivelRef.current && offsetY > 85) {
      proximoEstado = true;
    } else if (headerVisivelRef.current && offsetY < 55) {
      proximoEstado = false;
    }

    if (proximoEstado !== headerVisivelRef.current) {
      headerVisivelRef.current = proximoEstado;
      Animated.timing(headerAnim, {
        toValue: proximoEstado ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [headerAnim]);

  const irParaConfiguracoes = useCallback(() => {
    router.navigate('/configuracoes');
  }, []);

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Barra sobreposta suave ao rolar para baixo, sem deslocar o ScrollView */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.stickyHeader,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <View style={styles.stickyInner} pointerEvents="auto">
            <Text style={styles.stickyTitle} numberOfLines={1}>
              {nomeUsuario}
            </Text>
            <SettingsButton onPress={irParaConfiguracoes} />
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5733"
              colors={['#FF5733']}
            />
          }
        >
          {/* Cabeçalho superior: Imagem + Nome + Ano de criação + Configurações */}
          <View style={styles.topProfileHeader}>
            <View style={styles.profileLeft}>
              <View style={styles.avatarCircle}>
                <Image
                  source={AVATAR_PADRAO}
                  style={styles.avatarImage}
                  contentFit="contain"
                />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={2}>
                  {nomeUsuario}
                </Text>
                <Text style={styles.profileSince}>
                  Aqui desde {anoCriacao}
                </Text>
              </View>
            </View>

            <SettingsButton onPress={irParaConfiguracoes} />
          </View>

          <ThemedView style={styles.cardsWrapper}>
            {usuarioId ? (
              <CardXpTotal
                key={`xp-${usuarioId}-${refreshKey}`}
                usuarioId={usuarioId}
                refreshKey={refreshKey}
              />
            ) : null}

            {/* Passando os dados dinâmicos da semana do utilizador logado */}
            <CardProgressoSemanal
              key={`semanal-${usuarioId}-${refreshKey}`}
              titulo="Progresso Semanal"
              dias={progressoSemanal}
              refreshKey={refreshKey}
            />

            {usuarioId ? (
              <MensalCard
                key={`mensal-${usuarioId}-${refreshKey}`}
                usuarioId={usuarioId}
                refreshKey={refreshKey}
              />
            ) : null}
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            <ThemedText type="subtitle">Troféus</ThemedText>
            <View style={styles.trofeusGrid}>
              {conquistas.length > 0 ? (
                conquistas.map((item) => {
                  const isDesbloqueado = !!item.data_desbloqueio || (item.progresso_atual >= (item.meta || 100));

                  return (
                    <Trofeu
                      key={item.id_conquista || item.id}
                      tituloTrofeu={item.titulo || item.nome_conquista}
                      disabled={!isDesbloqueado}
                    />
                  );
                })
              ) : (
                <>
                  <Trofeu tituloTrofeu="Primeiro Passo" disabled={false} />
                  <Trofeu tituloTrofeu="Milhar" disabled={true} />
                </>
              )}
            </View>
          </ThemedView>

          <ThemedView style={styles.footerContainer}>
            <ThemedText style={styles.footerText}>✨ Chegaste ao fim do perfil</ThemedText>
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>

        {/* OVERLAY DE CARREGAMENTO DE TELA INTEIRA */}
        {loading && (
          <View style={styles.overlayCarregamento}>
            <ActivityIndicator size="large" color="#FF5733" />
            <Text style={styles.textoCarregamento}>A carregar o perfil...</Text>
          </View>
        )}
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
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: Spacing.four,
    paddingTop: 6,
  },
  stickyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 28,
    backgroundColor: '#FFF7FF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  stickyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 12,
  },
  topProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one,
    gap: 12,
  },
  profileLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FF5733',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 62,
    height: 62,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 26,
  },
  profileSince: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
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
    gap: Spacing.two,
    paddingTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  trofeusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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