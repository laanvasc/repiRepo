import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

export default function Button({ 
  titulo, 
  onPress, 
  variante = 'primeiro', // o primary default
  isLoading = false,
  disabled = false
}) {
  
  return (
    <Pressable 
      onPress={onPress} 
      disabled={disabled || isLoading}
      // Convert style to a function to access the 'pressed' state
      style={({ pressed }) => [
        styles.baseButton, 
        styles[`${variante}Button`],
        disabled && styles.disabledButton,
        pressed && styles.buttonPressed // Applies the scale and opacity when tapped
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variante === 'segunda' ? '#007AFF' : '#FFFFFF'} />
      ) : (
        <Text style={[
          styles.baseText, 
          styles[`${variante}Text`]
        ]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

//AQUI FICA OS TEMAS DO BOTÕES
const styles = StyleSheet.create({
  // aplicado a todos os valorse
  baseButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '500', // Changed from 'medium' to '500' to prevent crashes
  },
  disabledButton: {
    opacity: 0.6,
  },

  // primeiro estilo
  primeiroButton: {
    backgroundColor: '#FF5E32', 
    width: '100%',
    shadowColor: '#FF5E3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, // Shadow for Android
  },
  primeiroText: {
    color: '#FFFFFF',
  },

  // segundo estilo
  segundaButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  segundaText: {
    color: '#007AFF',
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // --- DANGER VARIANT ---
  dangerButton: {
    backgroundColor: '#FF3B30', // Red
  },
  dangerText: {
    color: '#FFFFFF',
  },
});