import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ImageBackground, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import {
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { api } from '../../services/api'; // Importa a tua instância centralizada do Axios

async function fetchUsuarioOfensiva(usuarioId) {
  try {
    console.log(`A chamar API de ofensiva para o ID: ${usuarioId}`);
    const response = await api.get(`/usuarios/${usuarioId}/ofensiva`);
    console.log('Dados de ofensiva recebidos com sucesso:', response.data);
    return response.data;
  } catch (err) {
    console.error('Erro detalhado de conexão:', err.message);
    throw err;
  }
}

export function CardOfensiva({ usuarioId }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    // Se o ID ainda for null ou undefined, nem tenta chamar a API!
    if (!usuarioId) {
      setLoading(false);
      return; 
    }

    async function carregarDados() {
      try {
        setLoading(true);
        setErro(false);
        const resposta = await fetchUsuarioOfensiva(usuarioId);
        setDados(resposta); // <-- Corrigido para usar setDados em vez de setOfensiva
      } catch (err) {
        console.error('Erro ao carregar ofensiva:', err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
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

  const diasOfensiva = dados.ofensivaAtual ?? 0;

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
          source={require('@/components/assets/mascote/pose1-mascot1.svg')}
          contentFit="contain"
          style={styles.mascot}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 140,
    height: 140,
  },
});