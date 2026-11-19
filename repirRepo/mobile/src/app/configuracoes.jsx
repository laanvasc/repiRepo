import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function ConfiguracoesScreen() {
  // Caso o teu AuthContext tenha uma função signOut ou setUsuarioId, podes desestruturar aqui:
  const auth = useAuth();

  const executarLogout = async () => {
    try {
      // Limpa o estado do utilizador no contexto, se existir função de saída
      if (auth?.signOut) {
        await auth.signOut();
      } else if (auth?.logout) {
        await auth.logout();
      } else if (auth?.setUsuarioId) {
        auth.setUsuarioId(null);
      }

      // Redireciona substituindo o histórico de navegação para evitar voltar atrás
      router.replace('/(auth)/login'); 
      // Nota: Se a tua rota de login for apenas '/login', altera para router.replace('/login')
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  };

  const handleSair = () => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('Tem a certeza que deseja sair da sua conta?');
      if (confirmar) {
        executarLogout();
      }
    } else {
      Alert.alert(
        'Sair da conta',
        'Tem a certeza que deseja encerrar a sua sessão?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: executarLogout,
          },
        ]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView
            title="Configurações"
            subtitle="Gerencie as suas preferências"
            showBackButton={true}
          />
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText style={styles.placeholderText}>
            Página de Configurações em construção...
          </ThemedText>

          {/* Espaçador para empurrar o botão de sair para a parte inferior */}
          <View style={styles.spacer} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSair}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <Ionicons name="log-out-outline" size={22} color="#FF5733" />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>
        </ThemedView>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    backgroundColor: 'transparent',
  },
  placeholderText: {
    fontSize: 15,
    opacity: 0.7,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FF5733',
    backgroundColor: 'rgba(255, 87, 51, 0.08)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5733',
  },
});