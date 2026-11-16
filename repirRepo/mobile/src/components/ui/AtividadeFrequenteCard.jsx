import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Importação com o alias no topo
import mascotePadrao from '@/components/assets/mascote/pose1-mascot1.png';

function formatarHorario(horario) {
  if (!horario) return null;
  if (typeof horario === 'string') {
    const match = horario.match(/(\d{2}:\d{2})/);
    if (match) return match[1];
  }
  return String(horario);
}

export default function AtividadeFrequenteCard({
  titulo,
  categoria,
  horario,
  onPress,
  onRemove,
  isLoading = false,
  disabled = false,
  concluida = false, // Nova prop para indicar se já foi realizada hoje
  iconeAtividade,
  cardStyle,
  textColor,
  actionColor,
  categoriaBadgeStyle,
  categoriaTextStyle,
  iconContainerStyle,
  style,
}) {
  const formattedHorario = formatarHorario(horario);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.card,
        cardStyle,
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {/* Ícone Circular da Esquerda */}
      <View style={[styles.iconContainer, iconContainerStyle]}>
        <Image
          source={iconeAtividade || mascotePadrao}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo / Título Principal, Categoria e Horário */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator color={textColor || '#FFFFFF'} />
        ) : (
          <View style={styles.textWrapper}>
            <Text
              style={[styles.titleText, textColor ? { color: textColor } : null]}
              numberOfLines={1}
            >
              {titulo || 'Atividade'}
            </Text>

            {(categoria || formattedHorario) ? (
              <View style={styles.badgesRow}>
                {categoria ? (
                  <View style={[styles.categoriaBadge, categoriaBadgeStyle]}>
                    <Text
                      style={[styles.categoriaText, categoriaTextStyle]}
                      numberOfLines={1}
                    >
                      {categoria}
                    </Text>
                  </View>
                ) : null}

                {formattedHorario ? (
                  <View style={styles.horarioBadge}>
                    <Text style={styles.horarioText} numberOfLines={1}>
                      {formattedHorario}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Lado Direito: Se concluída, mostra o check verde; senão, mantém a ação normal (✕ ou onRemove) */}
      {concluida ? (
        <View style={styles.actionContainer}>
          <Ionicons name="checkmark-circle" size={26} color="#22C55E" />
        </View>
      ) : (
        <Pressable
          onPress={(e) => {
            if (onRemove) {
              e.stopPropagation?.();
              onRemove();
            } else if (onPress) {
              onPress();
            }
          }}
          hitSlop={8}
          style={styles.actionContainer}
        >
          <Text
            style={[
              styles.actionIcon,
              actionColor
                ? { color: actionColor }
                : textColor
                ? { color: textColor }
                : null,
            ]}
          >
            ✕
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 72,
    backgroundColor: '#FF5252',
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: 38,
    height: 38,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  textWrapper: {
    gap: 3,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoriaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A4A4A',
  },
  horarioBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  horarioText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionContainer: {
    paddingRight: 8,
    paddingLeft: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});