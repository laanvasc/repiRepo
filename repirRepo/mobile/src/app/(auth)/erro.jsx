import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function ErroScreen() {
  // Pega nos parâmetros passados na rota (ex: ?mensagem=...)
  const { titulo, mensagem } = useLocalSearchParams();

  // Textos padrão caso nenhum parâmetro seja passado diretamente
  const tituloErro = titulo || 'Ocorreu um erro';
  const mensagemErro = mensagem || 'Não foi possível concluir a tua solicitação neste momento. Por favor, tenta novamente.';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={80} color="#EF4444" />
          </View>

          <Text style={styles.title}>{tituloErro}</Text>
          <Text style={styles.subtitle}>{mensagemErro}</Text>

          <View style={styles.buttonContainer}>
            <Button 
              titulo="Tentar Novamente" 
              onPress={() => router.back()} 
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