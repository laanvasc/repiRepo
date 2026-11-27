import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line } from 'react-native-svg';
import { api } from '@/services/api';

const ORANGE = '#EE6C42';
const CORAL_CARD = '#FF5D57';
const LIME = '#DCEB52';
const GRAY = '#D3D3D3';

const CARD_HEIGHT = 420;
const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MASCOTE_MODAL = require('@/components/assets/mascote/pose2-mascot2.svg');
const FUNDO_ONDA_ROSA = require('@/components/assets/fundos/fundo-onda1-rosa.png');

export function MensalCard({ usuarioId }) {
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [dadosMensais, setDadosMensais] = useState({
    ofensivaAtual: 0,
    totalAtividades: 0,
    diasConcluidos: [],
    diasPassados: [],
    weeks: [],
  });

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    let ativo = true;

    async function carregarDadosMensais() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/mensal`);
        const data = response.data || {};

        if (!ativo) return;

        setDadosMensais({
          ofensivaAtual: data.ofensivaAtual ?? 0,
          totalAtividades: data.totalAtividades ?? 0,
          diasConcluidos: data.diasConcluidos ?? [],
          diasPassados: data.diasPassados ?? [],
          weeks: data.weeks ?? [
            ['', '', '', '', 1, 2, 3],
            [4, 5, 6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30],
          ],
        });
      } catch (err) {
        console.error('Erro ao carregar dados mensais:', err.response?.data || err.message);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDadosMensais();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  const linhasGrade = useMemo(() => {
    const totalSlots = 28;
    const colunas = 7;
    const concluidosSet = new Set(
      (dadosMensais.diasConcluidos || []).map((d) => Number(d))
    );
    const quantidadeMarcada = Math.min(
      Math.max(concluidosSet.size || Number(dadosMensais.totalAtividades) || 0, 0),
      totalSlots
    );

    const slots = Array.from({ length: totalSlots }, (_, idx) => ({
      index: idx,
      concluido: idx < quantidadeMarcada,
    }));

    const linhas = [];
    for (let i = 0; i < slots.length; i += colunas) {
      linhas.push(slots.slice(i, i + colunas));
    }
    return linhas;
  }, [dadosMensais.diasConcluidos, dadosMensais.totalAtividades]);

  const textoOfensivaDestaque = useMemo(() => {
    const dias = Number(dadosMensais.ofensivaAtual) || 0;
    if (dias >= 7) {
      const semanas = Math.floor(dias / 7);
      return `${semanas} ${semanas === 1 ? 'Semana' : 'Semanas'} na ofensiva!`;
    }
    return `${dias} ${dias === 1 ? 'Dia' : 'Dias'} na ofensiva!`;
  }, [dadosMensais.ofensivaAtual]);

  const subtituloResumo = useMemo(() => {
    const total = Number(dadosMensais.totalAtividades) || 0;
    return `${total} ${total === 1 ? 'atividade concluída' : 'atividades concluídas'} no mês`;
  }, [dadosMensais.totalAtividades]);

  async function handleCompartilhar() {
    try {
      await Share.share({
        message: `${textoOfensivaDestaque} — ${subtituloResumo} no Repy!`,
      });
    } catch {
      // compartilhamento cancelado
    }
  }

  if (!usuarioId) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.statValue}>Utilizador não identificado.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => setModalVisivel(true)}
      >
        {/* TÍTULO */}
        <Text style={styles.title}>Novembro 2026</Text>

        {/* COMPARTILHAR */}
        <TouchableOpacity
          style={styles.share}
          activeOpacity={0.75}
          onPress={handleCompartilhar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Line x1="7.3" y1="11" x2="16.7" y2="7" stroke="#FFFFFF" strokeWidth="2" />
            <Line x1="7.3" y1="13" x2="16.7" y2="17" stroke="#FFFFFF" strokeWidth="2" />
            <Circle cx="5" cy="12" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <Circle cx="19" cy="6" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <Circle cx="19" cy="18" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          </Svg>
        </TouchableOpacity>

        {/* ESTATÍSTICAS */}
        <View style={[styles.stat, { left: 16 }]}>
          <Text style={styles.statLabel}>Ofensiva</Text>
          <Text style={styles.statValue}>{dadosMensais.ofensivaAtual} dias</Text>
        </View>

        <View style={[styles.stat, { left: 110 }]}>
          <Text style={styles.statLabel}>Concluídas</Text>
          <Text style={styles.statValue}>{dadosMensais.totalAtividades} atividades</Text>
        </View>

        {/* DIAS DA SEMANA */}
        <View style={styles.weekHeader}>
          {weekDays.map((d, i) => (
            <View key={i} style={styles.column}>
              <Text style={styles.weekDay}>{d}</Text>
            </View>
          ))}
        </View>

        {/* CALENDÁRIO INTELIGENTE */}
        <View style={styles.calendar}>
          {dadosMensais.weeks.map((week, w) => (
            <View key={w} style={styles.weekRow}>
              {week.map((n, d) => {
                if (n === '') {
                  return <View key={d} style={styles.column} />;
                }

                const isDone = dadosMensais.diasConcluidos.includes(n);
                const isPast = !isDone && n < 29;

                return (
                  <View key={d} style={styles.column}>
                    <View
                      style={[
                        styles.day,
                        isDone && styles.dayDone,
                        isPast && styles.dayPast,
                      ]}
                    >
                      <Text style={[styles.dayText, isPast && styles.dayTextPast]}>
                        {String(n).padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisivel}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalBackdrop}>
          <Image
            source={FUNDO_ONDA_ROSA}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <View style={styles.modalOverlayTint} />

          <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.modalTopBar}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisivel(false)}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalCenter}>
              <View style={styles.modalCardWrapper}>
                <Image
                  source={MASCOTE_MODAL}
                  style={styles.mascoteDestaque}
                  contentFit="contain"
                />

                <View style={styles.destaqueCard}>
                  <View style={styles.pillsContainer}>
                    {linhasGrade.map((linha, rowIndex) => (
                      <View key={rowIndex} style={styles.pillsRow}>
                        {linha.map((slot) => (
                          <View
                            key={slot.index}
                            style={[
                              styles.pillSlot,
                              slot.concluido ? styles.pillSlotDone : styles.pillSlotEmpty,
                            ]}
                          >
                            {slot.concluido ? (
                              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>

                  <Text style={styles.destaqueTitulo}>{textoOfensivaDestaque}</Text>
                  <Text style={styles.destaqueSubtitulo}>{subtituloResumo}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleCompartilhar}
                activeOpacity={0.85}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

export default MensalCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: ORANGE,
    borderRadius: 20,
    overflow: 'hidden',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    left: 18,
    top: 18,
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  share: {
    position: 'absolute',
    right: 16,
    top: 18,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: {
    position: 'absolute',
    top: 56,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 15,
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  weekHeader: {
    position: 'absolute',
    top: 120,
    left: 3,
    right: 3,
    flexDirection: 'row',
  },
  weekDay: {
    fontSize: 13,
    lineHeight: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  calendar: {
    position: 'absolute',
    top: 155,
    left: 3,
    right: 3,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  day: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dayDone: {
    backgroundColor: LIME,
    transform: [{ scale: 1.15 }],
  },
  dayPast: {
    backgroundColor: GRAY,
    transform: [{ scale: 1.25 }],
  },
  dayText: {
    fontSize: 10,
    lineHeight: 12,
    color: ORANGE,
    fontWeight: 'bold',
  },
  dayTextPast: {
    color: '#444444',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#FCE7F3',
  },
  modalOverlayTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 247, 255, 0.22)',
  },
  modalSafeArea: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  modalTopBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modalCenter: {
    flex: 1,
    width: '100%',
    maxWidth: 368,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  mascoteDestaque: {
    width: 168,
    height: 152,
    marginBottom: -32,
    zIndex: 2,
  },
  destaqueCard: {
    width: '100%',
    backgroundColor: CORAL_CARD,
    borderRadius: 26,
    paddingTop: 44,
    paddingBottom: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  pillsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 22,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    width: '100%',
  },
  pillSlot: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSlotDone: {
    backgroundColor: LIME,
  },
  pillSlotEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  destaqueTitulo: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  destaqueSubtitulo: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
  },
  shareButton: {
    marginTop: 22,
    width: '100%',
    backgroundColor: '#F45828',
    paddingVertical: 15,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F45828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});