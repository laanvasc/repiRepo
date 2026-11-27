import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { api } from '@/services/api';

const MASCOTE_PADRAO = require('../assets/mascote/pose2-mascot2.svg');
const MASCOTE_CONCLUIDO = require('../assets/mascote/pose2-mascot3.svg');

const MASCOTES_POR_CATEGORIA = {
  corrida: require('../assets/mascote/pose-mascote-corrida.svg'),
  judo: require('../assets/mascote/pose-mascote-judo.svg'),
  yoga: require('../assets/mascote/pose-mascote-yoga.svg'),
  muayThai: require('../assets/mascote/pose-mascote-muay.svg'),
  natacao: require('../assets/mascote/pose-mascote-natacao.svg'),
  jiuJitsu: MASCOTE_PADRAO,
};

function identificarChaveCategoria(dados) {
  if (!dados || typeof dados !== 'object') return null;

  const idCategoria = Number(
    dados?.categoria_atividade ??
      dados?.id_categoria ??
      dados?.categoriaId ??
      (typeof dados?.categoria === 'number' ? dados.categoria : NaN)
  );

  const textoCategoria = String(
    dados?.nome_categoria ??
      dados?.categoria_nome ??
      (typeof dados?.categoria === 'string' ? dados.categoria : '') ??
      ''
  )
    .toLowerCase()
    .trim();

  const nomeAtividade = String(dados?.nome ?? dados?.nome_atividade ?? '')
    .toLowerCase()
    .trim();

  if (idCategoria === 2 || textoCategoria.includes('corrid') || nomeAtividade.includes('corrid')) {
    return 'corrida';
  }

  if (idCategoria === 4 || textoCategoria.includes('nata') || nomeAtividade.includes('nata')) {
    return 'natacao';
  }

  if (idCategoria === 8 || textoCategoria.includes('muay') || nomeAtividade.includes('muay')) {
    return 'muayThai';
  }

  if (idCategoria === 10 || textoCategoria.includes('yoga') || nomeAtividade.includes('yoga')) {
    return 'yoga';
  }

  if (idCategoria === 7 || textoCategoria.includes('jiu') || nomeAtividade.includes('jiu')) {
    return 'jiuJitsu';
  }

  if (textoCategoria.includes('jud') || nomeAtividade.includes('jud')) {
    return 'judo';
  }

  return null;
}

function resolverNomeCategoria(dados, chaveCategoria) {
  const textoDireto =
    dados?.nome_categoria ??
    dados?.categoria_nome ??
    (typeof dados?.categoria === 'string' ? dados.categoria : '');

  if (typeof textoDireto === 'string' && textoDireto.trim()) {
    return textoDireto.trim();
  }

  const nomesPorChave = {
    corrida: 'Corrida',
    judo: 'Judô',
    yoga: 'Yoga',
    muayThai: 'Muay Thai',
    natacao: 'Natação',
    jiuJitsu: 'Jiu-Jitsu',
  };

  return chaveCategoria ? nomesPorChave[chaveCategoria] || null : null;
}

export default function ProximaAtividadeCard({ usuarioId, refreshKey = 0 }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) {
      setLoading(false);
      return;
    }

    let ativo = true;

    async function carregarProxima() {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${usuarioId}/proxima-atividade`);
        if (ativo) {
          setDados(response.data);
        }
      } catch (err) {
        console.error('Erro ao carregar próxima atividade:', err);
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarProxima();

    return () => {
      ativo = false;
    };
  }, [usuarioId, refreshKey]);

  const todasConcluidas = !loading && dados?.status === 'todas_concluidas';

  const semAtividadesAgendadas =
    !loading &&
    !todasConcluidas &&
    (dados?.status === 'sem_atividades_hoje' ||
      dados?.status === 'vazio' ||
      !dados?.nome);

  const tituloCard = todasConcluidas
    ? 'PARABÉNS!'
    : semAtividadesAgendadas
      ? 'SEM ATIVIDADES'
      : 'PRÓXIMA ATIVIDADE';

  const nomeAtividade = loading
    ? 'A carregar...'
    : todasConcluidas
      ? dados?.nome || 'Todas as atividades concluídas!'
      : semAtividadesAgendadas
        ? dados?.mensagem || 'Nenhuma atividade para hoje'
        : dados?.nome;

  const chaveCategoria = identificarChaveCategoria(dados);
  const nomeCategoria =
    !loading && !todasConcluidas && !semAtividadesAgendadas
      ? resolverNomeCategoria(dados, chaveCategoria)
      : null;

  const fonteMascote = todasConcluidas
    ? MASCOTE_CONCLUIDO
    : semAtividadesAgendadas
      ? MASCOTE_PADRAO
      : (chaveCategoria && MASCOTES_POR_CATEGORIA[chaveCategoria]) || MASCOTE_PADRAO;

  return (
    <View
      style={[
        styles.card,
        todasConcluidas && styles.cardConcluido,
        semAtividadesAgendadas && styles.cardVazio,
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            todasConcluidas && styles.titleParabens,
          ]}
        >
          {tituloCard}
        </Text>

        <View style={styles.activityRow}>
          <View style={styles.iconCircle}>
            {loading ? (
              <ActivityIndicator size="small" color="#EE6C42" />
            ) : todasConcluidas ? (
              <Text style={styles.checkEmoji}>🎉</Text>
            ) : semAtividadesAgendadas ? (
              <Text style={styles.checkEmoji}>🗓️</Text>
            ) : (
              <Svg width={28} height={28} viewBox="0 0 48 48">
                <Path
                  d="M4 25H12L17 14L24 34L30 20L34 25H44"
                  fill="none"
                  stroke="#EE6C42"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>

          <View style={styles.activityTextGroup}>
            <Text style={styles.activity}>
              {nomeAtividade}
            </Text>
            {nomeCategoria ? (
              <Text style={styles.categoriaLabel}>
                {nomeCategoria}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <Image
        source={fonteMascote}
        style={styles.mascot}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 152,
    backgroundColor: '#FFB4ED',
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardConcluido: {
    backgroundColor: '#D2F522',
  },
  cardVazio: {
    backgroundColor: '#F3E8FF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 16,
    color: '#000000',
    marginBottom: 8,
  },
  titleParabens: {
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  checkEmoji: {
    fontSize: 18,
  },
  activityTextGroup: {
    flex: 1,
  },
  activity: {
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: '#000000',
  },
  categoriaLabel: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#27272A',
    marginTop: 2,
  },
  mascot: {
    width: 104,
    height: 104,
    marginLeft: 10,
    flexShrink: 0,
  },
});