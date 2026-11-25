import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

function extrairIdDeValor(valor) {
  if (!valor) return null;

  if (typeof valor === 'number' && Number.isFinite(valor) && valor > 0) {
    return String(valor);
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim();
    if (!limpo) return null;
    if (/^\d+$/.test(limpo)) return limpo;
    try {
      return extrairIdDeValor(JSON.parse(limpo));
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

export default function CadastroConcluidoScreen() {
  const params = useLocalSearchParams();
  const authContext = useAuth?.() || {};

  const usuarioId = useMemo(() => {
    return (
      extrairIdDeValor(params?.usuarioId) ??
      extrairIdDeValor(params?.id_usuario) ??
      extrairIdDeValor(params?.idUsuario) ??
      extrairIdDeValor(params?.usuario) ??
      extrairIdDeValor(authContext?.usuario ?? authContext?.user ?? null) ??
      null
    );
  }, [
    params?.usuarioId,
    params?.id_usuario,
    params?.idUsuario,
    params?.usuario,
    authContext?.usuario,
    authContext?.user,
  ]);

  useEffect(() => {
    console.log('[CadastroConcluido] ID referenciado na montagem:', {
      usuarioId,
      params,
      authUsuario: authContext?.usuario ?? authContext?.user ?? null,
    });
  }, [usuarioId, params, authContext?.usuario, authContext?.user]);

  useEffect(() => {
    if (!usuarioId) return;

    let ativo = true;
    async function persistirId() {
      try {
        const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
        const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
        if (ativo && AsyncStorage?.setItem) {
          await AsyncStorage.setItem('usuarioId', String(usuarioId));
          console.log('[CadastroConcluido] usuarioId salvo no AsyncStorage:', String(usuarioId));
        }
      } catch (err) {
        console.log('[CadastroConcluido] Erro ao salvar usuarioId no AsyncStorage:', err?.message || err);
      }
    }

    persistirId();
    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  function handleVamosLa() {
    console.log('[CadastroConcluido] Navegando para escolherEsportes com usuarioId:', usuarioId);
    router.replace({
      pathname: '/(auth)/escolherEsportes',
      params: usuarioId ? { usuarioId: String(usuarioId) } : undefined,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.container}>
          {/* Título principal */}
          <Text style={styles.title}>Cadastro Concluído!</Text>

          {/* Card / Banner do Mascote */}
          <View style={styles.bannerCard}>
            <Image
              source={require('@/components/assets/fundos/fundo-onda1-rosa.png')}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
            <Image
              source={require('@/components/assets/mascote/pose2-mascot2.svg')}
              style={styles.mascotImage}
              contentFit="contain"
            />
          </View>

          {/* Balões de fala do mascote */}
          <View style={styles.chatContainer}>
            <View style={styles.firstBubbleWrapper}>
              <View style={styles.speechTail} />
              <View style={[styles.speechBubble, styles.bubbleMedium]}>
                <Text style={styles.speechText}>
                  E aí! Eu sou o Repy e vou ser seu parceiro por aqui!
                </Text>
              </View>
            </View>

            <View style={[styles.speechBubble, styles.bubbleWide]}>
              <Text style={styles.speechText}>
                Pra começar, me conta quais modalidades fazem parte da sua rotina, ou quais você quer experimentar.
              </Text>
            </View>

            <View style={[styles.speechBubble, styles.bubbleCompact]}>
              <Text style={styles.speechText}>
                Aí eu deixo tudo preparado para você, vamos lá?
              </Text>
            </View>
          </View>

          {/* Ações inferiores */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVamosLa}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Vamos lá</Text>
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
    paddingTop: 24,
    paddingBottom: 28,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 18,
    textAlign: 'left',
  },
  bannerCard: {
    width: '100%',
    height: 225,
    backgroundColor: '#D6EC17',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 195,
    height: 195,
  },
  chatContainer: {
    marginTop: 22,
    gap: 14,
    alignItems: 'flex-start',
  },
  firstBubbleWrapper: {
    position: 'relative',
    paddingTop: 10,
    alignSelf: 'flex-start',
  },
  speechTail: {
    position: 'absolute',
    top: 0,
    left: 24,
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
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  bubbleMedium: {
    maxWidth: '88%',
  },
  bubbleWide: {
    width: '96%',
  },
  bubbleCompact: {
    maxWidth: '82%',
  },
  speechText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1E293B',
    fontWeight: '400',
  },
  actionsContainer: {
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});