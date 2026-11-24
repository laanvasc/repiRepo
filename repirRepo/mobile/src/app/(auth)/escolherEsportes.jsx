import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';

const ESPORTES = [
  { id: 'judo', nome: 'Judô', bg: '#F7D6F0', checkBg: '#FF5E32' },
  { id: 'musculacao', nome: 'Musculação', bg: '#C6F200', checkBg: '#FF5E32' },
  { id: 'corrida', nome: 'Corrida', bg: '#C6F200', checkBg: '#FF5E32' },
  { id: 'yoga', nome: 'Yoga', bg: '#FFA4A4', checkBg: '#FF5E32' },
  { id: 'muay-thai', nome: 'Muay Thai', bg: '#FFA4A4', checkBg: '#FF5E32' },
  { id: 'natacao', nome: 'Natação', bg: '#F7D6F0', checkBg: '#FF5E32' },
  { id: 'jiu-jitsu', nome: 'Jiu-Jitsu', bg: '#C6F200', checkBg: '#FF5E32' },
  { id: 'boxe', nome: 'Boxe', bg: '#FFA4A4', checkBg: '#FF5E32' },
];

export default function EscolherEsportesScreen() {
  const [selecionados, setSelecionados] = useState([]);

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

    const esportesEscolhidos = ESPORTES.filter((item) => selecionados.includes(item.id));

    router.push({
      pathname: '/(auth)/diasEsportes',
      params: {
        esportesIds: JSON.stringify(selecionados),
        esportes: JSON.stringify(esportesEscolhidos),
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
              source={require('@/components/assets/mascote/pose2-mascot2.svg')}
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

                  <Image
                    source={require('@/components/assets/mascote/pose2-mascot2.svg')}
                    style={styles.cardMascot}
                    contentFit="contain"
                  />

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
    gap: 16,
  },
  card: {
    width: '47.5%',
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 165,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelecionado: {
    borderColor: '#1E293B',
  },
  radioCircle: {
    alignSelf: 'flex-end',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleAtivo: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D2F500',
  },
  cardMascot: {
    width: 92,
    height: 92,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
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