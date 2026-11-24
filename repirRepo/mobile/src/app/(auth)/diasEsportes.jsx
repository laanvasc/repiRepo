import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const CATALOGO_CORES = {
  judo: { nome: 'Judô', bg: '#C6F200' },
  musculacao: { nome: 'Musculação', bg: '#FFA16C' },
  corrida: { nome: 'Corrida', bg: '#F7A8F5' },
  yoga: { nome: 'Yoga', bg: '#C6F200' },
  'muay-thai': { nome: 'Muay Thai', bg: '#FF5252' },
  natacao: { nome: 'Natação', bg: '#FFA16C' },
  'jiu-jitsu': { nome: 'Jiu-Jitsu', bg: '#F7A8F5' },
  boxe: { nome: 'Boxe', bg: '#FF5252' },
};

function extrairIdDeValor(valor) {
  if (!valor) return null;

  if (typeof valor === 'number' && Number.isFinite(valor) && valor > 0) {
    return String(valor);
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim();
    if (!limpo) return null;

    if (/^\d+$/.test(limpo)) {
      return limpo;
    }

    try {
      const parsed = JSON.parse(limpo);
      return extrairIdDeValor(parsed);
    } catch {
      return null;
    }
  }

  if (typeof valor === 'object') {
    const direto =
      valor?.usuario?.id ??
      valor?.usuario?.id_usuario ??
      valor?.user?.id ??
      valor?.user?.id_usuario ??
      valor?.id ??
      valor?.id_usuario ??
      valor?.idUsuario ??
      null;

    if (direto !== null && direto !== undefined && String(direto).trim() !== '') {
      return String(direto);
    }
  }

  return null;
}

export default function DiasEsportesScreen() {
  const params = useLocalSearchParams();
  const authContext = useAuth?.() || {};

  const usuarioObj =
    authContext?.usuario ??
    authContext?.user ??
    authContext?.dadosUsuario ??
    null;

  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function buscarIdNoStorage() {
      try {
        const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
        const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;

        if (!AsyncStorage?.getAllKeys || !AsyncStorage?.multiGet) return;

        const keys = await AsyncStorage.getAllKeys();
        if (!keys || keys.length === 0) return;

        const entries = await AsyncStorage.multiGet(keys);
        for (const [, rawValue] of entries) {
          const idEncontrado = extrairIdDeValor(rawValue);
          if (idEncontrado && ativo) {
            setUsuarioIdStorage(idEncontrado);
            return;
          }
        }
      } catch (err) {
        console.log('Erro ao ler AsyncStorage:', err?.message || err);
      }
    }

    buscarIdNoStorage();

    return () => {
      ativo = false;
    };
  }, []);

  const usuarioIdParam = useMemo(() => {
    return (
      extrairIdDeValor(params?.usuarioId) ??
      extrairIdDeValor(params?.id_usuario) ??
      extrairIdDeValor(params?.idUsuario) ??
      extrairIdDeValor(params?.usuario) ??
      null
    );
  }, [params?.usuarioId, params?.id_usuario, params?.idUsuario, params?.usuario]);

  const usuarioId =
    extrairIdDeValor(usuarioObj) ??
    usuarioIdParam ??
    usuarioIdStorage ??
    null;

  const esportesLista = useMemo(() => {
    try {
      const brutoEsportes = Array.isArray(params?.esportes)
        ? params.esportes[0]
        : params?.esportes;

      if (brutoEsportes) {
        const parsed = JSON.parse(String(brutoEsportes));
        if (Array.isArray(parsed)) {
          return parsed.map((item) => {
            if (typeof item === 'object' && item !== null) {
              const base = CATALOGO_CORES[item.id] || {};
              return {
                id: item.id,
                nome: item.nome || base.nome || item.id,
                bg: base.bg || item.bg || '#FFA16C',
              };
            }
            const base = CATALOGO_CORES[item] || { nome: item, bg: '#FFA16C' };
            return { id: item, nome: base.nome, bg: base.bg };
          });
        }
      }

      const brutoIds = Array.isArray(params?.esportesIds)
        ? params.esportesIds[0]
        : params?.esportesIds;

      if (brutoIds) {
        const ids = JSON.parse(String(brutoIds));
        if (Array.isArray(ids)) {
          return ids.map((id) => {
            const base = CATALOGO_CORES[id] || { nome: id, bg: '#FFA16C' };
            return { id, nome: base.nome, bg: base.bg };
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

  useEffect(() => {
    if (Object.keys(diasAcumuladosParam).length > 0) {
      setDiasPorAtividade(diasAcumuladosParam);
    }
  }, [diasAcumuladosParam]);

  function irParaEscolherDiaAtividades(esporteFoco) {
    router.push({
      pathname: '/(auth)/escolherDiaAtividades',
      params: {
        idAtividade: String(esporteFoco?.id_atividade ?? esporteFoco?.id ?? ''),
        esporte: JSON.stringify(esporteFoco),
        esportes: JSON.stringify(esportesLista),
        diasPorAtividade: JSON.stringify(diasPorAtividade),
        ...(usuarioId ? { usuarioId: String(usuarioId) } : {}),
      },
    });
  }

  async function handleContinuar() {
    console.log('Debug usuarioId:', {
      usuarioId,
      usuarioObj,
      paramsUsuarioId: params?.usuarioId,
      usuarioIdStorage,
    });

    const entradasComDias = Object.entries(diasPorAtividade).filter(
      ([, dias]) => Array.isArray(dias) && dias.length > 0
    );

    if (entradasComDias.length === 0) {
      Alert.alert(
        'Atenção',
        'Selecione pelo menos uma atividade e os dias da semana antes de continuar.'
      );
      return;
    }

    if (!usuarioId) {
      Alert.alert('Erro', 'Usuário não identificado para salvar a rotina.');
      return;
    }

    const idUsuarioNum = Number(usuarioId);

    const jsonConsolidado = {
      id_usuario: idUsuarioNum,
      atividades_frequentes: entradasComDias.map(([idAtiv, dias]) => ({
        id_usuario: idUsuarioNum,
        id_atividade: Number(idAtiv),
        repete_seg: dias.includes('Seg'),
        repete_ter: dias.includes('Ter'),
        repete_qua: dias.includes('Qua'),
        repete_qui: dias.includes('Qui'),
        repete_sex: dias.includes('Sex'),
        repete_sab: dias.includes('Sáb'),
        repete_dom: dias.includes('Dom'),
      })),
    };

    console.log(
      'JSON consolidado enviado para atividade_frequente:',
      JSON.stringify(jsonConsolidado, null, 2)
    );

    setSalvando(true);
    try {
      const resposta = await api.post(
        `/usuarios/${idUsuarioNum}/atividades-frequentes`,
        jsonConsolidado
      );

      console.log('Salvo com sucesso no banco:', resposta?.data);

      router.replace('/');
    } catch (err) {
      console.log(
        'Erro ao salvar atividades frequentes:',
        err?.response?.status,
        err?.response?.data || err?.message
      );
      Alert.alert(
        'Erro ao salvar',
        'Não foi possível enviar sua rotina ao banco de dados. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function handlePular() {
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
              source={require('@/components/assets/mascote/pose2-mascot2.svg')}
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
            {esportesLista.map((esporte) => (
              <TouchableOpacity
                key={esporte.id}
                style={[styles.accordionCard, { backgroundColor: esporte.bg }]}
                onPress={() => irParaEscolherDiaAtividades(esporte)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionHeader}>
                  <View style={styles.leftGroup}>
                    <View style={styles.whiteCircle}>
                      <Image
                        source={require('@/components/assets/mascote/pose2-mascot2.svg')}
                        style={styles.circleMascot}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.sportTitle}>{esporte.nome}</Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
              </TouchableOpacity>
            ))}
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
    width: 36,
    height: 36,
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