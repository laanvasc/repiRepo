import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import InputText from '@/components/ui/InputText';

export function PasswordInput({
  label,
  value,
  onChangeText,
  error,
  autoComplete,
  textContentType,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <InputText
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={error}
        secureTextEntry={!visible}
        autoComplete={autoComplete}
        textContentType={textContentType}
        inputStyle={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        onPress={() => setVisible(!visible)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
      </Pressable>
    </View>
  );
}

// Exportação default para evitar o erro de importação anterior
export default PasswordInput;

const styles = StyleSheet.create({
  input: {
    paddingRight: 88,
  },
  toggle: {
    position: 'absolute',
    right: 16,
    top: 37,
    minHeight: 28,
    justifyContent: 'center',
  },
  toggleText: {
    color: '#FF5E32',
    fontSize: 12,
    fontWeight: '600',
  },
});