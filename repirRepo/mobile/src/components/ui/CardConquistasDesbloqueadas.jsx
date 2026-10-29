import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { api } from '@/services/api'; // Importa a tua instância centralizada do Axios

async function fetchConquistasUsuario(usuarioId) {
  try {
    console.log(`A chamar API de conquistas para o ID: ${usuarioId}`);
    const response = await api.get(`/usuarios/${usuarioId}/conquistas`);
    console.log('Conquistas do utilizador recebidas com sucesso:', response.data);
    return response.data;
  } catch (err) {
    console.error('Erro detalhado de conexão:', err.message);
    throw err;
  }
}

export function CardConquistasDesbloqueadas({ usuarioId, titulo = 'Melhores conquistas' }) {
  const [conquistas, setConquistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

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

  if (!usuarioId) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.conquistaNome}>Utilizador não identificado.</Text>
      </View>
    );
  }

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

      {conquistas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ainda não tens nenhuma conquista desbloqueada. Continua a treinar!</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {conquistas.map((item, index) => {
            const nomeConquista = item.conquista?.nome_conquista || item.nome_conquista;
            const progresso = item.progresso_atual;
            const keyId = item.id_usuario_conquista || item.id_conquista || index;

            return (
              <View key={keyId} style={styles.itemContainer}>
                <View style={[styles.circle, { backgroundColor: item.corFundo || '#FF5E32' }]}>
                  <Image
                    source={item.icone || require('@/components/assets/trofeus/trofeu1.png')}
                    contentFit="contain"
                    style={styles.trophyIcon}
                  />
                </View>

                <Text style={styles.conquistaNome} numberOfLines={2}>
                  {nomeConquista}
                </Text>
                
                {progresso !== undefined && (
                  <Text style={styles.progressoText}>Progresso: {progresso}</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
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
  progressoText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});