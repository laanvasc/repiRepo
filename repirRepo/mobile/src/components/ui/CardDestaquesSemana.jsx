import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';

const CORAL_CARD = '#FF5D57';
const LIME = '#DCEB52';

const FUNDO_ONDA_VERDE = require('@/components/assets/fundos/fundo-onda1-verde.png');
const FUNDO_ONDA_ROSA = require('@/components/assets/fundos/fundo-onda1-rosa.png');
const MASCOTE_DESTAQUES = require('@/components/assets/mascote/pose2-mascot3.svg');

function normalizarDestaques(raw) {
  return {
    treinos: Number(raw?.treinos ?? 0) || 0,
    xp: Number(raw?.xp ?? 0) || 0,
    diasOfensiva: Number(raw?.diasOfensiva ?? 0) || 0,
  };
}

export function CardDestaquesSemanas({ usuarioId, onShare }) {
  const [dados, setDados] = useState({ treinos: 0, xp: 0, diasOfensiva: 0 });
  const [loading, setLoading] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    let ativo = true;

    async function carregarDestaques() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/destaques-semanais`);
        if (ativo) {
          setDados(normalizarDestaques(response.data));
        }
      } catch (err) {
        console.error('Erro ao carregar destaques semanais:', err);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDestaques();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  const mensagemCompartilhar = useMemo(() => {
    return `Destaques da semana no Repy: ${dados.treinos} treinos completos, +${dados.xp} XP e ${dados.diasOfensiva} dias na ofensiva!`;
  }, [dados.treinos, dados.xp, dados.diasOfensiva]);

  async function handleCompartilhar() {
    if (typeof onShare === 'function') {
      onShare(dados);
      return;
    }

    try {
      await Share.share({
        message: mensagemCompartilhar,
      });
    } catch {
      // compartilhamento cancelado
    }
  }

  return (
    <>
      <Pressable
        style={styles.card}
        onPress={() => setModalVisivel(true)}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.08)' }}
      >
        {/* Imagem de fundo ajustada para preencher todo o card */}
        <Image
          source={FUNDO_ONDA_VERDE}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>DESTAQUES DA SEMANA</Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              handleCompartilhar();
            }}
            hitSlop={8}
            style={styles.shareButton}
          >
            <Text style={styles.shareIcon}>➦</Text>
          </Pressable>
        </View>

        {/* Conteúdo Principal / Estado de Carregamento */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#000000" />
            <Text style={styles.loaderText}>A carregar destaques...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.mascotContainer}>
              <Image
                source={MASCOTE_DESTAQUES}
                contentFit="contain"
                style={styles.mascot}
              />
            </View>

            <View style={styles.statsContainer}>
              {/* Item 1: Treinos */}
              <View style={styles.statItem}>
                <View style={[styles.badge, styles.pinkBadge]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.statText}>{dados.treinos} treinos completos</Text>
              </View>

              {/* Item 2: XP */}
              <View style={styles.statItem}>
                <View style={[styles.badge, styles.greenBadge]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.statText}>+{dados.xp}xp</Text>
              </View>

              {/* Item 3: Ofensiva */}
              <View style={styles.statItem}>
                <View style={[styles.badge, styles.pinkBadge]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
                <Text style={styles.statText}>{dados.diasOfensiva} dias na ofensiva</Text>
              </View>
            </View>
          </View>
        )}
      </Pressable>

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
                  source={MASCOTE_DESTAQUES}
                  style={styles.mascoteDestaque}
                  contentFit="contain"
                />

                <View style={styles.destaqueCard}>
                  <Text style={styles.destaqueBadgeLabel}>DESTAQUES DA SEMANA</Text>
                  <Text style={styles.destaqueTitulo}>{dados.treinos} treinos completos!</Text>

                  <View style={styles.modalStatsList}>
                    <View style={styles.modalStatRow}>
                      <View style={[styles.badge, styles.limeBadge]}>
                        <Ionicons name="checkmark" size={16} color="#1A2E05" />
                      </View>
                      <Text style={styles.modalStatText}>
                        {dados.treinos} {dados.treinos === 1 ? 'treino concluído' : 'treinos concluídos'}
                      </Text>
                    </View>

                    <View style={styles.modalStatRow}>
                      <View style={[styles.badge, styles.limeBadge]}>
                        <Ionicons name="flash" size={16} color="#1A2E05" />
                      </View>
                      <Text style={styles.modalStatText}>+{dados.xp} XP na semana</Text>
                    </View>

                    <View style={styles.modalStatRow}>
                      <View style={[styles.badge, styles.limeBadge]}>
                        <Ionicons name="flame" size={16} color="#1A2E05" />
                      </View>
                      <Text style={styles.modalStatText}>
                        {dados.diasOfensiva} {dados.diasOfensiva === 1 ? 'dia na ofensiva' : 'dias na ofensiva'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.shareModalButton}
                onPress={handleCompartilhar}
                activeOpacity={0.85}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                <Text style={styles.shareModalButtonText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

export default CardDestaquesSemanas;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#D2F522',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  shareButton: {
    padding: 4,
  },
  shareIcon: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mascotContainer: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 120,
    height: 120,
  },
  statsContainer: {
    width: '60%',
    gap: 12,
    paddingLeft: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinkBadge: {
    backgroundColor: '#FFB5E8',
  },
  greenBadge: {
    backgroundColor: '#A8D900',
  },
  limeBadge: {
    backgroundColor: LIME,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  statText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    flexShrink: 1,
  },
  loaderContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
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
    width: 164,
    height: 148,
    marginBottom: -30,
    zIndex: 2,
  },
  destaqueCard: {
    width: '100%',
    backgroundColor: CORAL_CARD,
    borderRadius: 26,
    paddingTop: 42,
    paddingBottom: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  destaqueBadgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 6,
  },
  destaqueTitulo: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStatsList: {
    width: '100%',
    gap: 12,
  },
  modalStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  modalStatText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  shareModalButton: {
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
  shareModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});