import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { api } from '@/services/api';

const PALETA_CARDS = ['#F7A8F5', '#C6F200', '#FF5252', '#F45828', '#C6F200'];
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

export default function EscolherDiaAtividadesScreen() {
  const params = useLocalSearchParams();

  // Recupera o que já estava selecionado anteriormente em diasEsportes
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
    const brutoCat = Array.isArray(params?.categoria)
      ? params.categoria[0]
      : params?.categoria;

    if (brutoCat !== undefined && brutoCat !== null && String(brutoCat).trim() !== '') {
      const num = Number(brutoCat);
      if (!Number.isNaN(num) && num > 0) {
        return num;
      }
    }

    return null;
  }, [params?.categoria]);

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

  const [atividadesRelacionadas, setAtividadesRelacionadas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estrutura: { [id_atividade]: ['Seg', 'Qua'] }
  const [diasPorAtividade, setDiasPorAtividade] = useState(selecaoInicial);

  useEffect(() => {
    setDiasPorAtividade(selecaoInicial);
  }, [selecaoInicial]);

  useEffect(() => {
    let ativo = true;

    async function carregarAtividadesRelacionadas() {
      setCarregando(true);
      setErro('');

      try {
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
  }, [idAtividadeNumerico, categoriaInformada, termoBuscaEsporte]);

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

  function handleContinuar() {
    // Retorna para diasEsportes preservando os esportes e a seleção acumulada
    router.replace({
      pathname: '/(auth)/diasEsportes',
      params: {
        esportes: Array.isArray(params?.esportes) ? params.esportes[0] : (params?.esportes || '[]'),
        diasPorAtividade: JSON.stringify(diasPorAtividade),
      },
    });
  }

  function handlePular() {
    router.replace('/(tabs)');
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
                    <Image
                      source={require('@/components/assets/mascote/pose2-mascot2.svg')}
                      style={styles.cardMascot}
                      contentFit="contain"
                    />

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
              style={styles.primaryButton}
              onPress={handleContinuar}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Continuar</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  cardMascot: {
    width: 72,
    height: 72,
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