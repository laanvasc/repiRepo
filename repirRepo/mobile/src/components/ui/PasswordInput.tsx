import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInputProps } from 'react-native';

import InputText from '@/components/ui/InputText';

type PasswordInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
};

export function PasswordInput({
  label,
  value,
  onChangeText,
  error,
  autoComplete,
  textContentType,
}: PasswordInputProps) {
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