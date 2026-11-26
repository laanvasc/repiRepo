import { Image } from 'expo-image';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import metaIconDefault from '@/components/assets/icones/meta-icon.svg';

function resolverPercentual({ atual, meta, progresso, concluido }) {
  if (concluido) return 100;

  const numAtual = Number(atual);
  const numMeta = Number(meta);

  if (Number.isFinite(numAtual) && Number.isFinite(numMeta) && numMeta > 0) {
    return Math.min(100, Math.max(0, (numAtual / numMeta) * 100));
  }

  if (typeof progresso === 'string' && progresso.includes('/')) {
    const [rawA, rawM] = progresso.split('/');
    const parsedA = Number(rawA);
    const parsedM = Number(rawM);
    if (Number.isFinite(parsedA) && Number.isFinite(parsedM) && parsedM > 0) {
      return Math.min(100, Math.max(0, (parsedA / parsedM) * 100));
    }
  }

  return 0;
}

export default function MetaCard({
  tituloMeta = 'Fazer 3 atividades',
  categoriaMeta,
  onPress,
  isLoading = false,
  disabled = false,
  variante = 'test',
  iconeMeta,
  concluido = false,
  atual,
  meta,
  progresso,
  mostrarBarra = true,
}) {
  const sourceIcone = iconeMeta || metaIconDefault;

  const percentual = useMemo(
    () => resolverPercentual({ atual, meta, progresso, concluido }),
    [atual, meta, progresso, concluido]
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.card,
        concluido ? styles.cardConcluido : styles.cardPendente,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.rowContent}>
        {/* Ícone à esquerda: com círculo branco quando concluído, solto quando pendente */}
        <View
          style={[
            styles.iconContainer,
            concluido ? styles.iconContainerConcluido : styles.iconContainerPendente,
          ]}
        >
          <Image
            source={sourceIcone}
            style={styles.iconImage}
            contentFit="contain"
          />
        </View>

        {/* Conteúdo / Título */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <ActivityIndicator color={concluido ? '#0F172A' : '#888888'} />
          ) : (
            <Text
              style={[
                styles.titleText,
                concluido ? styles.titleTextConcluido : styles.titleTextPendente,
              ]}
            >
              {tituloMeta}
            </Text>
          )}
        </View>

        {/* Contador opcional à direita quando progresso for informado */}
        {progresso ? (
          <Text
            style={[
              styles.progressLabel,
              concluido ? styles.titleTextConcluido : styles.titleTextPendente,
            ]}
          >
            {progresso}
          </Text>
        ) : null}
      </View>

      {/* Barra inferior de progressão */}
      {mostrarBarra ? (
        <View
          style={[
            styles.progressTrack,
            concluido ? styles.trackConcluido : styles.trackPendente,
          ]}
        >
          <View
            style={[
              styles.progressFill,
              concluido ? styles.fillConcluido : styles.fillPendente,
              { width: `${percentual}%` },
            ]}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 72,
    borderRadius: 41,
    borderWidth: 1.5,
    borderColor: '#888888',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardPendente: {
    backgroundColor: '#FFFFFF',
  },
  cardConcluido: {
    backgroundColor: '#C6F200',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainerPendente: {
    backgroundColor: 'transparent',
  },
  iconContainerConcluido: {
    backgroundColor: '#FFFFFF',
  },
  iconImage: {
    width: 48,
    height: 48,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  titleTextPendente: {
    color: '#888888',
  },
  titleTextConcluido: {
    color: '#0F172A',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    paddingRight: 8,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  trackPendente: {
    backgroundColor: '#EFEFEF',
  },
  trackConcluido: {
    backgroundColor: 'rgba(15, 23, 42, 0.14)',
  },
  progressFill: {
    height: '100%',
  },
  fillPendente: {
    backgroundColor: '#C6F200',
  },
  fillConcluido: {
    backgroundColor: '#0F172A',
  },
});