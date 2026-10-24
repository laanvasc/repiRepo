import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

const API_URL = 'http://192.168.0.119:3000';

async function fetchConquistasUsuario(usuarioId) {
  try {
    const url = `${API_URL}/usuarios/${usuarioId}/conquistas`;
    console.log('A chamar API de conquistas em:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[HTTP ${response.status}] Erro do servidor:`, errorText);
      throw new Error('Erro na resposta do servidor');
    }

    const data = await response.json();
    console.log('Conquistas recebidas com sucesso:', data);
    return data;
  } catch (err) {
    console.error('Erro detalhado de conexão:', err.message);
    throw err;
  }
}

export function CardConquistasDesbloqueadas({ usuarioId = 2, titulo = 'Melhores conquistas' }) {
  const [conquistas, setConquistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setErro(false);
        const data = await fetchConquistasUsuario(usuarioId);
        setConquistas(data);
      } catch (error) {
        console.error('Erro ao ligar ao backend:', error);
        setErro(true);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [usuarioId]);

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="large" color="#151522" />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.conquistaNome}>Erro ao carregar conquistas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {conquistas.map((item, index) => (
          <View key={item.id_conquista || index} style={styles.itemContainer}>
            {/* Você pode mapear cores ou ícones de acordo com o nível/categoria vindos do banco */}
            <View style={[styles.circle, { backgroundColor: item.corFundo || '#FF5E32' }]}>
              <Image
                source={item.icone || require('@/components/assets/trofeus/trofeu1.png')}
                contentFit="contain"
                style={styles.trophyIcon}
              />
            </View>

            <Text style={styles.conquistaNome} numberOfLines={2}>
              {item.nome_conquista}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default CardConquistasDesbloqueadas;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '24%',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151522',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: 16,
    paddingRight: 8,
    alignItems: 'flex-start',
  },
  itemContainer: {
    alignItems: 'center',
    width: 88,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trophyIcon: {
    width: 52,
    height: 52,
  },
  conquistaNome: {
    fontSize: 12,
    fontWeight: '700',
    color: '#151522',
    textAlign: 'center',
    lineHeight: 15,
  },
});