import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const MASCOTE_FALLBACK = require('@/components/assets/mascote/pose2-mascot2.svg');

const ESPORTES = [
  {
    id: 'judo',
    nome: 'Judô',
    bg: '#F7D6F0',
    checkBg: '#FF5E32',
    imagem: require('@/components/assets/mascote/pose-mascote-judo.svg'),
    styleKey: 'mascotJudo',
  },
  {
    id: 'corrida',
    nome: 'Corrida',
    bg: '#C6F200',
    checkBg: '#FF5E32',
    imagem: require('@/components/assets/mascote/pose-mascote-corrida.svg'),
    styleKey: 'mascotCorrida',
  },
  {
    id: 'yoga',
    nome: 'Yoga',
    bg: '#FFA4A4',
    checkBg: '#FF5E32',
    imagem: require('@/components/assets/mascote/pose-mascote-yoga.svg'),
    styleKey: 'mascotYoga',
  },
  {
    id: 'muay-thai',
    nome: 'Muay Thai',
    bg: '#FFA4A4',
    checkBg: '#FF5E32',
    imagem: require('@/components/assets/mascote/pose-mascote-muay.svg'),
    styleKey: 'mascotMuayThai',
  },
  {
    id: 'natacao',
    nome: 'Natação',
    bg: '#F7D6F0',
    checkBg: '#FF5E32',
    imagem: require('@/components/assets/mascote/pose-mascote-natacao.svg'),
    styleKey: 'mascotNatacao',
  },
  // {
  //   id: 'jiu-jitsu',
  //   nome: 'Jiu-Jitsu',
  //   bg: '#C6F200',
  //   checkBg: '#FF5E32',
  //   imagem: MASCOTE_FALLBACK,
  //   styleKey: 'mascotJiuJitsu',
  // },
];

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

export default function EscolherEsportesScreen() {
  const params = useLocalSearchParams();
  const authContext = useAuth?.() || {};
  const [selecionados, setSelecionados] = useState([]);
  const [usuarioIdStorage, setUsuarioIdStorage] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function buscarUsuarioIdNoStorage() {
      try {
        const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
        const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;

        if (!AsyncStorage?.getAllKeys || !AsyncStorage?.multiGet) return;

        const keys = await AsyncStorage.getAllKeys();
        if (!keys || keys.length === 0) return;

        const entries = await AsyncStorage.multiGet(keys);
        for (const [, rawValue] of entries) {
          const encontrado = extrairIdDeValor(rawValue);
          if (encontrado && ativo) {
            setUsuarioIdStorage(encontrado);
            return;
          }
        }
      } catch {
        // ignora falha de leitura no storage
      }
    }

    buscarUsuarioIdNoStorage();

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
    usuarioIdParam ??
    extrairIdDeValor(authContext?.usuario ?? authContext?.user ?? null) ??
    usuarioIdStorage ??
    null;

  function toggleEsporte(id) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleContinuar() {
    if (selecionados.length === 0) {
      Alert.alert(
        'Nenhuma atividade selecionada',
        'Escolha pelo menos uma atividade/esporte para continuar.'
      );
      return;
    }

    const esportesEscolhidos = ESPORTES
      .filter((item) => selecionados.includes(item.id))
      .map(({ imagem: _imagem, styleKey: _styleKey, ...resto }) => resto);

    router.push({
      pathname: '/(auth)/diasEsportes',
      params: {
        esportesIds: JSON.stringify(selecionados),
        esportes: JSON.stringify(esportesEscolhidos),
        ...(usuarioId ? { usuarioId: String(usuarioId) } : {}),
      },
    });
  }

  const semSelecao = selecionados.length === 0;

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
              <Text style={styles.speechText}>Bora escolher seus esportes?</Text>
            </View>
          </View>

          {/* Grade de Esportes */}
          <View style={styles.grid}>
            {ESPORTES.map((esporte) => {
              const ativo = selecionados.includes(esporte.id);
              const estiloEspecifico = styles[esporte.styleKey];
              return (
                <TouchableOpacity
                  key={esporte.id}
                  style={[
                    styles.card,
                    { backgroundColor: esporte.bg },
                    ativo && styles.cardSelecionado,
                  ]}
                  onPress={() => toggleEsporte(esporte.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radioCircle, ativo && styles.radioCircleAtivo]}>
                    {ativo && <View style={styles.radioInnerDot} />}
                  </View>

                  <View style={styles.cardMascotWrapper}>
                    <Image
                      source={esporte.imagem || MASCOTE_FALLBACK}
                      style={[styles.cardMascot, estiloEspecifico]}
                      contentFit="contain"
                    />
                  </View>

                  <Text style={styles.cardTitle}>{esporte.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ações */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, semSelecao && styles.primaryButtonDisabled]}
              onPress={handleContinuar}
              disabled={semSelecao}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
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
    backgroundColor: '#D6EC17',
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
    marginBottom: 20,
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
  },
  speechText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  card: {
    width: '47.6%',
    borderRadius: 24,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 182,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelecionado: {
    borderColor: '#1E293B',
  },
  radioCircle: {
    alignSelf: 'flex-end',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleAtivo: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  radioInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#D2F500',
  },
  cardMascotWrapper: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    marginTop: -6,
  },
  cardMascot: {
    width: 112,
    height: 112,
  },
  // Estilos individuais por esporte — ajuste livremente cada um:
  mascotJudo: {
    transform: [{ scale: 1.5 }, { translateX: 0 }, { translateY: 0 }],
  },
  mascotCorrida: {
    transform: [{ scale: 1.20 }, { translateX: 0 }, { translateY: 0 }],
  },
  mascotYoga: {
    transform: [{ scale: 1.20 }, { translateX: 0 }, { translateY: 0 }],
  },
  mascotMuayThai: {
    transform: [{ scale: 1.5 }, { translateX: 0 }, { translateY: 0 }],
  },
  mascotNatacao: {
    transform: [{ scale: 1.20 }, { translateX: 0 }, { translateY: 0 }],
  },
  mascotJiuJitsu: {
    transform: [{ scale: 1 }, { translateX: 0 }, { translateY: 0 }],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0F172A',
    marginTop: 2,
    textAlign: 'center',
  },
  actions: {
    marginTop: 28,
    alignItems: 'center',
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
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});