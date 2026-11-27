import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

const PALETA_CARDS = ['#F7A8F5', '#C6F200', '#FF5252', '#F45828', '#C6F200'];
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const CHAVES_USUARIO_PRIORITARIAS = [
  'usuarioId',
  'id_usuario',
  'usuario',
  'user',
  'dadosUsuario',
];

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

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

async function lerEntradasStorage(AsyncStorage, keys) {
  if (typeof AsyncStorage?.multiGet === 'function') {
    return AsyncStorage.multiGet(keys);
  }
  if (typeof AsyncStorage?.getMany === 'function') {
    const manyResult = await AsyncStorage.getMany(keys);
    if (Array.isArray(manyResult)) return manyResult;
    if (manyResult && typeof manyResult === 'object') {
      return Object.entries(manyResult);
    }
  }
  const pares = [];
  for (const key of keys) {
    const val = await AsyncStorage.getItem(key);
    pares.push([key, val]);
  }
  return pares;
}

async function buscarIdPrioritarioNoStorage(AsyncStorage) {
  for (const chave of CHAVES_USUARIO_PRIORITARIAS) {
    try {
      const valor = await AsyncStorage.getItem(chave);
      const id = extrairIdDeValor(valor);
      if (id) return id;
    } catch {
      // ignora chave inexistente ou mal formatada
    }
  }

  if (!AsyncStorage?.getAllKeys) return null;

  const keys = await AsyncStorage.getAllKeys();
  if (!keys || keys.length === 0) return null;

  const keysFiltradas = keys.filter(
    (k) =>
      !CHAVES_USUARIO_PRIORITARIAS.includes(k) &&
      !/atividade|esporte|catalogo|cache|expo/i.test(String(k))
  );

  if (keysFiltradas.length === 0) return null;

  const entries = await lerEntradasStorage(AsyncStorage, keysFiltradas);
  for (const [, rawValue] of entries) {
    const idEncontrado = extrairIdDeValor(rawValue);
    if (idEncontrado) return idEncontrado;
  }

  return null;
}

export default function EscolherDiaAtividadesScreen() {
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

    async function carregarUsuarioStorage() {
      try {
        const AsyncStorageModule = await import('@react-native-async-storage/async-storage');
        const AsyncStorage = AsyncStorageModule?.default || AsyncStorageModule;
        const idEncontrado = await buscarIdPrioritarioNoStorage(AsyncStorage);
        if (idEncontrado && ativo) {
          setUsuarioIdStorage(idEncontrado);
        }
      } catch (err) {
        console.log('Erro ao ler AsyncStorage:', err?.message || err);
      }
    }

    carregarUsuarioStorage();

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
    extrairIdDeValor(usuarioObj) ??
    usuarioIdStorage ??
    null;

  const selecaoInicial = useMemo(() => {
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

  const atividadesPreCarregadas = useMemo(() => {
    try {
      const bruto = Array.isArray(params?.atividadesCategoria)
        ? params.atividadesCategoria[0]
        : params?.atividadesCategoria;
      if (bruto) {
        const parsed = JSON.parse(String(bruto));
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignora erro de parse
    }
    return null;
  }, [params?.atividadesCategoria]);

  const idAtividadeNumerico = useMemo(() => {
    const brutoId = Array.isArray(params?.idAtividade)
      ? params.idAtividade[0]
      : params?.idAtividade;

    if (brutoId !== undefined && brutoId !== null && String(brutoId).trim() !== '') {
      const num = Number(brutoId);
      if (!Number.isNaN(num) && num > 0) {
        return num;
      }
    }

    try {
      const brutoEsporte = Array.isArray(params?.esporte)
        ? params.esporte[0]
        : params?.esporte;

      if (brutoEsporte) {
        const parsed = JSON.parse(String(brutoEsporte));
        const candidato = parsed?.id_atividade ?? parsed?.idAtividade ?? parsed?.id;
        if (candidato !== undefined && candidato !== null && String(candidato).trim() !== '') {
          const num = Number(candidato);
          if (!Number.isNaN(num) && num > 0) {
            return num;
          }
        }
      }
    } catch {
      // ignora
    }

    return null;
  }, [params?.idAtividade, params?.esporte]);

  const categoriaInformada = useMemo(() => {
    const brutoCat = Array.isArray(params?.categoriaId)
      ? params.categoriaId[0]
      : Array.isArray(params?.categoria)
        ? params.categoria[0]
        : (params?.categoriaId ?? params?.categoria);

    if (brutoCat !== undefined && brutoCat !== null && String(brutoCat).trim() !== '') {
      const num = Number(brutoCat);
      if (!Number.isNaN(num) && num > 0) {
        return num;
      }
    }

    try {
      const brutoEsporte = Array.isArray(params?.esporte)
        ? params.esporte[0]
        : params?.esporte;
      if (brutoEsporte) {
        const parsed = JSON.parse(String(brutoEsporte));
        const cat = parsed?.categoriaId ?? parsed?.categoria_atividade;
        const num = Number(cat);
        if (!Number.isNaN(num) && num > 0) {
          return num;
        }
      }
    } catch {
      // ignora
    }

    return null;
  }, [params?.categoriaId, params?.categoria, params?.esporte]);

  const termoBuscaEsporte = useMemo(() => {
    const brutoId = Array.isArray(params?.idAtividade)
      ? params.idAtividade[0]
      : params?.idAtividade;

    try {
      const brutoEsporte = Array.isArray(params?.esporte)
        ? params.esporte[0]
        : params?.esporte;

      if (brutoEsporte) {
        const parsed = JSON.parse(String(brutoEsporte));
        return parsed?.nome_atividade || parsed?.nome || parsed?.id || String(brutoId || '');
      }
    } catch {
      // ignora
    }

    return String(brutoId || '');
  }, [params?.idAtividade, params?.esporte]);

  const [atividadesRelacionadas, setAtividadesRelacionadas] = useState(
    atividadesPreCarregadas || []
  );
  const [carregando, setCarregando] = useState(!atividadesPreCarregadas);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [diasPorAtividade, setDiasPorAtividade] = useState(selecaoInicial);

  useEffect(() => {
    setDiasPorAtividade(selecaoInicial);
  }, [selecaoInicial]);

  useEffect(() => {
    if (atividadesPreCarregadas && atividadesPreCarregadas.length > 0) {
      setAtividadesRelacionadas(atividadesPreCarregadas);
      setCarregando(false);
      setErro('');
      return;
    }

    let ativo = true;

    async function carregarAtividadesRelacionadas() {
      setCarregando(true);
      setErro('');

      try {
        if (categoriaInformada) {
          try {
            const resCat = await api.get(`/usuarios/atividades/categoria/${categoriaInformada}`);
            const dadosCat = resCat?.data;
            const listaCat = Array.isArray(dadosCat?.atividades)
              ? dadosCat.atividades
              : Array.isArray(dadosCat)
                ? dadosCat
                : [];

            if (!ativo) return;
            setAtividadesRelacionadas(listaCat);
            return;
          } catch {
            // fallback para relacionadas / catálogo
          }
        }

        if (idAtividadeNumerico) {
          try {
            const res = await api.get(`/usuarios/atividades/${idAtividadeNumerico}/relacionadas`);
            const dados = res?.data;
            const lista = Array.isArray(dados?.atividades)
              ? dados.atividades
              : Array.isArray(dados)
                ? dados
                : [];

            if (!ativo) return;
            setAtividadesRelacionadas(lista);
            return;
          } catch {
            // fallback para o catálogo
          }
        }

        const catalogoRes = await api.get('/usuarios/catalogo-atividades');
        const catalogo = Array.isArray(catalogoRes?.data) ? catalogoRes.data : [];

        if (!ativo) return;

        let atividadeBase = null;

        if (idAtividadeNumerico) {
          atividadeBase = catalogo.find(
            (item) => Number(item.id_atividade) === Number(idAtividadeNumerico)
          );
        }

        if (!atividadeBase && termoBuscaEsporte) {
          const termoNorm = normalizarTexto(termoBuscaEsporte);
          atividadeBase = catalogo.find((item) => {
            const nomeNorm = normalizarTexto(item?.nome_atividade);
            return termoNorm && (nomeNorm.includes(termoNorm) || termoNorm.includes(nomeNorm));
          });
        }

        if (!atividadeBase) {
          setErro('Nenhuma atividade relacionada encontrada para a seleção atual.');
          setAtividadesRelacionadas([]);
          return;
        }

        const categoriaBase = atividadeBase.categoria_atividade;
        const relacionadas = catalogo.filter(
          (item) => Number(item.categoria_atividade) === Number(categoriaBase)
        );

        setAtividadesRelacionadas(relacionadas);
      } catch (err) {
        console.log(
          'Erro ao carregar atividades relacionadas:',
          err?.response?.status,
          err?.response?.data || err?.message
        );
        if (ativo) {
          setErro('Não foi possível carregar as atividades relacionadas.');
          setAtividadesRelacionadas([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarAtividadesRelacionadas();

    return () => {
      ativo = false;
    };
  }, [atividadesPreCarregadas, idAtividadeNumerico, categoriaInformada, termoBuscaEsporte]);

  function toggleDiaAtividade(idAtividade, dia) {
    setDiasPorAtividade((prev) => {
      const atuais = prev[idAtividade] || [];
      const atualizados = atuais.includes(dia)
        ? atuais.filter((d) => d !== dia)
        : [...atuais, dia];

      const proximo = { ...prev };
      if (atualizados.length === 0) {
        delete proximo[idAtividade];
      } else {
        proximo[idAtividade] = atualizados;
      }
      return proximo;
    });
  }

  async function handleContinuar() {
    console.log('Debug usuarioId em escolherDiaAtividades:', {
      usuarioId,
      usuarioIdParam,
      usuarioObj,
      usuarioIdStorage,
    });

    const idsDestaTela = new Set(
      atividadesRelacionadas.map((a) => String(a.id_atividade ?? a.id))
    );

    const entradasDestaTela = Object.entries(diasPorAtividade).filter(
      ([idAtiv, dias]) =>
        idsDestaTela.has(String(idAtiv)) && Array.isArray(dias) && dias.length > 0
    );

    if (entradasDestaTela.length === 0) {
      Alert.alert(
        'Atenção',
        'Selecione pelo menos um dia da semana para uma atividade antes de continuar.'
      );
      return;
    }

    if (!usuarioId) {
      Alert.alert('Erro', 'Usuário não identificado para salvar as atividades.');
      return;
    }

    console.log('ORIGEM DO ID:', {
  usuarioIdParam,
  authUsuario: usuarioObj,
  usuarioIdStorage,
  paramsCompletos: params,
});

    const idUsuarioNum = Number(usuarioId);

    const jsonConsolidado = {
      id_usuario: idUsuarioNum,
      atividades_frequentes: entradasDestaTela.map(([idAtiv, dias]) => ({
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
      'Enviando atividades de escolherDiaAtividades:',
      JSON.stringify(jsonConsolidado, null, 2)
    );

    setSalvando(true);
    try {
      const resposta = await api.post(
        `/usuarios/${idUsuarioNum}/atividades-frequentes`,
        jsonConsolidado
      );

      console.log('Salvo com sucesso no banco:', resposta?.data);

      router.replace({
        pathname: '/(auth)/diasEsportes',
        params: {
          esportes: Array.isArray(params?.esportes)
            ? params.esportes[0]
            : (params?.esportes || '[]'),
          diasPorAtividade: JSON.stringify(diasPorAtividade),
          usuarioId: String(idUsuarioNum),
        },
      });
    } catch (err) {
      console.log(
        'Erro ao salvar atividades frequentes:',
        err?.response?.status,
        err?.response?.data || err?.message
      );
      Alert.alert(
        'Erro ao salvar',
        'Não foi possível salvar suas atividades no banco de dados. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function handlePular() {
    router.replace({
      pathname: '/(auth)/diasEsportes',
      params: {
        esportes: Array.isArray(params?.esportes)
          ? params.esportes[0]
          : (params?.esportes || '[]'),
        diasPorAtividade: JSON.stringify(diasPorAtividade),
        ...(usuarioId ? { usuarioId: String(usuarioId) } : {}),
      },
    });
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
                Escolha as atividades que deseja fazer em cada esporte escolhido para sua rotina!
              </Text>
            </View>
          </View>

          {/* Lista de atividades relacionadas vindas do backend */}
          {carregando ? (
            <View style={styles.feedbackBox}>
              <ActivityIndicator size="large" color="#F45828" />
              <Text style={styles.feedbackText}>Buscando atividades relacionadas...</Text>
            </View>
          ) : erro ? (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{erro}</Text>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {atividadesRelacionadas.map((atividade, index) => {
                const idAtiv = atividade.id_atividade ?? atividade.id;
                const bgCard = PALETA_CARDS[index % PALETA_CARDS.length];
                const diasMarcados = diasPorAtividade[idAtiv] || [];

                return (
                  <View
                    key={String(idAtiv)}
                    style={[styles.activityCard, { backgroundColor: bgCard }]}
                  >
                    <View style={styles.cardRight}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {atividade.nome_atividade || atividade.nome}
                      </Text>

                      <View style={styles.daysRow}>
                        {DIAS_SEMANA.map((dia) => {
                          const ativo = diasMarcados.includes(dia);
                          return (
                            <TouchableOpacity
                              key={dia}
                              style={[styles.dayBadge, ativo && styles.dayBadgeAtivo]}
                              onPress={() => toggleDiaAtividade(idAtiv, dia)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.dayBadgeText, ativo && styles.dayBadgeTextAtivo]}>
                                {dia}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

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

            {/* <Pressable onPress={handlePular} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Pular</Text>
            </Pressable> */}
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 18,
    maxWidth: 310,
  },
  speechText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1E293B',
    fontWeight: '500',
  },
  feedbackBox: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
  cardsList: {
    gap: 16,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardRight: {
    flex: 1,
    gap: 10,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayBadge: {
    width: 34,
    height: 46,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeAtivo: {
    backgroundColor: '#0F172A',
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  dayBadgeTextAtivo: {
    color: '#FFFFFF',
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