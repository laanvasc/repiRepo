import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

// Personalização dos temas
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'transparent',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'transparent',
  },
};

// Componente interno para gerir o estado de autenticação e esconder o splash
function RootNav() {
  const { isLoading } = useAuth();
  const [loadingForced, setLoadingForced] = useState(true);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  // 1. Hook para forçar os 6 segundos de carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingForced(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // 2. Hook para esconder a splash screen nativa quando tudo estiver pronto
  useEffect(() => {
    if (!isLoading && !loadingForced) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, loadingForced]);

  // ATENÇÃO: O retorno condicional fica SEMPRE após todos os hooks acima
  if (isLoading || loadingForced) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5733" />
      </View>
    );
  }

  return (
    <ThemeProvider value={theme}>
      <View style={styles.container}>
        <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        <AnimatedSplashOverlay />
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        webkitTapHighlightColor: 'transparent',
      } as any,
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});