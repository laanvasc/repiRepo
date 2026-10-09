import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Importação com o alias no topo
import mascotePadrao from '@/components/assets/mascote/pose1-mascot1.png'; // ajuste para o caminho da imagem existente caso necessário

export default function MetaCard({
  tituloMeta = 'Fazer 40 minutos de cárdio',
  categoriaMeta,
  onPress,
  isLoading = false,
  disabled = false,
  variante = 'test',
  iconeMeta,
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
          source={iconeMeta || mascotePadrao}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo / Título */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.titleText}>{tituloMeta}</Text>
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
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
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