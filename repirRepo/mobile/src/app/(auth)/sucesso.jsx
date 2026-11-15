import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function SucessoScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>

          <Text style={styles.title}>Tudo pronto!</Text>
          <Text style={styles.subtitle}>
            Conta criada com sucesso. Agora você pode fazer login e começar a usar o aplicativo.
          </Text>

          <View style={styles.buttonContainer}>
            <Button 
              titulo="Continuar" 
              onPress={() => router.replace('/(auth)/login')} 
            />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing.two,
  },
});