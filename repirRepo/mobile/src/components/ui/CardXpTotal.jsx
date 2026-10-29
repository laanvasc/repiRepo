import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { api } from '@/services/api'; // Importa a tua instância centralizada do Axios

async function fetchUsuarioXp(usuarioId) {
  try {
    console.log(`A chamar API de XP para o ID: ${usuarioId}`);
    const response = await api.get(`/usuarios/${usuarioId}/xp`);
    console.log('Dados de XP recebidos com sucesso:', response.data);
    return response.data;
  } catch (err) {
    console.error('Erro detalhado de conexão:', err.response?.data || err.message);
    throw err;
  }
}

export function CardXpTotal({ usuarioId }) {
  const [dados, setDados] = useState(null);
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
        const data = await fetchUsuarioXp(usuarioId);
        setDados(data);
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
        <Text style={styles.legendaText}>Utilizador não identificado.</Text>
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

  if (erro || !dados) {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.legendaText}>Erro ao carregar dados de XP.</Text>
      </View>
    );
  }

  // Extrai os dados retornados do NestJS com valores de fallback seguros
  const xpTotal = dados.xp ?? 0;
  const nivel = dados.nivel ?? 1;
  const xpAtualNivel = dados.xpAtualNivel ?? 0;
  const xpNecessarioNivel = dados.xpNecessarioNivel ?? 1000;

  // Cálculo da barra de progresso e XP restante
  const progresso = Math.min(Math.max(xpAtualNivel / xpNecessarioNivel, 0), 1) * 100;
  const xpRestante = Math.max(xpNecessarioNivel - xpAtualNivel, 0);

  return (
    <View style={styles.card}>
      {/* Título do Nível */}
      <Text style={styles.nivelText}>Nível {nivel}</Text>

      {/* Subtítulo XP Total */}
      <Text style={styles.xpTotalText}>
        {Number(xpTotal).toLocaleString('pt-BR')} XP total
      </Text>

      {/* Barra de Progresso */}  
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
      </View>

      {/* Legenda XP para o Próximo Nível */}
      <Text style={styles.legendaText}>
        {xpRestante} XP para o Nível {nivel + 1}
      </Text>
    </View>
  );
}

export default CardXpTotal;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FF5733',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 8,
    minHeight: 140,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nivelText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  xpTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#F3F8BD',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D2F500',
    borderRadius: 5,
  },
  legendaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});