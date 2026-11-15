import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// Importação do ícone local (ajuste o caminho de acordo com a sua estrutura de pastas)
import NotificacaoIcone from '../assets/icones/icone-notificacao3x.png';

export function NotificationButton({ onPress, hasUnread = false }) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.navigate('/notificacoes');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handlePress} 
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Notificações"
    >
      {/* Ícone usando a imagem local */}
      <Image 
        source={NotificacaoIcone} 
        style={styles.icon} 
        resizeMode="contain" 
      />
      
      {/* Indicador opcional de notificação não lida */}
      {hasUnread && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}

export default NotificationButton;

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: '#FF5733', // Opcional: aplica a cor do tema se a imagem for um PNG monocromático
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});