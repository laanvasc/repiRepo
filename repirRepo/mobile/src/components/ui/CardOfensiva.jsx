import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ImageBackground, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import {
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { api } from '../../services/api';

const MASCOTE_OFENSIVA_ATIVA = require('@/components/assets/mascote/pose1-mascot1.svg');
const MASCOTE_OFENSIVA_ZERADA = require('@/components/assets/mascote/pose-chorando.svg');

async function fetchDadosOfensiva(usuarioId) {
  const [resOfensiva, resAtividades] = await Promise.all([
    api.get(`/usuarios/${usuarioId}/ofensiva`),
    api.get(`/usuarios/${usuarioId}/atividades-frequentes`).catch(() => ({ data: [] })),
  ]);

  const listaAtividades = Array.isArray(resAtividades.data) ? resAtividades.data : [];
  const concluiuAlgumaHoje = listaAtividades.some((item) => item.realizada_hoje === true);

  return {
    ofensivaAtual: resOfensiva.data?.ofensivaAtual ?? 0,
    concluiuAlgumaHoje,
  };
}

export function CardOfensiva({ usuarioId }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    let ativo = true;

    async function carregarDados() {
      try {
        setLoading(true);
        setErro(false);
        const resposta = await fetchDadosOfensiva(usuarioId);
        if (ativo) {
          setDados(resposta);
        }
      } catch (err) {
        console.error('Erro ao carregar ofensiva:', err);
        if (ativo) {
          setErro(true);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (erro || !dados) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.label}>Erro ao carregar ofensiva.</Text>
      </View>
    );
  }

  // Só mantém a ofensiva ativa visível se o utilizador tiver concluído ao menos 1 atividade hoje
  const diasOfensiva = dados.concluiuAlgumaHoje ? (dados.ofensivaAtual ?? 0) : 0;
  const isZerada = diasOfensiva === 0;
  const fonteMascote = isZerada ? MASCOTE_OFENSIVA_ZERADA : MASCOTE_OFENSIVA_ATIVA;

  return (
    <ImageBackground
      source={require('@/components/assets/fundos/fundo-onda1-verde.png')}
      style={styles.card}
      imageStyle={styles.cardImage}
      resizeMode="cover"
    >
      <View style={styles.leftContent}>
        <Text style={styles.number}>{diasOfensiva}</Text>
        <Text style={styles.label}>DIAS DE OFENSIVA</Text>
      </View>

      <View style={styles.rightContent}>
        <Image
          source={fonteMascote}
          contentFit="contain"
          style={[styles.mascot, isZerada && styles.mascotChorando]}
        />
      </View>
    </ImageBackground>
  );
}

export default CardOfensiva;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#D2F522',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    overflow: 'hidden',
    marginVertical: 8,
    minHeight: 140,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    borderRadius: 0,
    width: 'auto',
    height: 'auto',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  number: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 94,
    fontWeight: '900',
    color: '#000000',
    lineHeight: 76,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginTop: 4,
    letterSpacing: 0.5,
    fontFamily: 'Inter_600SemiBold',
  },
  rightContent: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  mascot: {
    width: 140,
    height: 140,
  },
  mascotChorando: {
    transform: [{ scale: 1.25 }],
  },
});