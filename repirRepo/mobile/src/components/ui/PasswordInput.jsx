import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import InputText from '@/components/ui/InputText';

export function PasswordInput({
  label,
  value,
  onChangeText,
  error,
  autoComplete,
  textContentType,
  onFocus,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <InputText
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={error}
        secureTextEntry={!visible}
        autoComplete={autoComplete}
        textContentType={textContentType}
        onFocus={onFocus}
        inputStyle={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        onPress={() => setVisible(!visible)}
        style={styles.toggle}
        hitSlop={10}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#6B7280"
        />
      </Pressable>
    </View>
  );
}

export default PasswordInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  input: {
    paddingRight: 48, // Garante que o texto digitado não passa por baixo do ícone
  },
  toggle: {
    position: 'absolute',
    right: 14,
    // Ajustado para alinhar verticalmente com a caixa de input (geralmente abaixo da label)
    top: 36, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});