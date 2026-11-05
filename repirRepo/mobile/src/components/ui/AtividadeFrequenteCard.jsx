import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Importação com o alias no topo
import mascotePadrao from '@/components/assets/mascote/pose1-mascot1.png'; // ajuste para o caminho da imagem existente caso necessário

export default function AtividadeFrequenteCard({
  titulo,
  categoria,
  onPress,
  isLoading = false,
  disabled = false,
  iconeAtividade,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isLoading}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {/* Ícone Circular da Esquerda */}
      <View style={styles.iconContainer}>
        <Image
          source={iconeAtividade || mascotePadrao}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo / Título Principal e Categoria */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.textWrapper}>
            <Text style={styles.titleText} numberOfLines={1}>
              {titulo || 'Atividade'}
            </Text>
            {categoria ? (
              <View style={styles.categoriaBadge}>
                <Text style={styles.categoriaText} numberOfLines={1}>
                  {categoria}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Ícone de Fechar (✕) à direita */}
      <View style={styles.actionContainer}>
        <Text style={styles.actionIcon}>✕</Text>
      </View>
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
  actionContainer: {
    paddingRight: 8,
  },
  actionIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});