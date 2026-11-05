import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '../context/AuthContext'; // <-- Importa o AuthProvider

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider> {/* <-- Envolve toda a aplicação para gerir o ID globalmente */}
      <ThemeProvider value={theme}>
        <View style={styles.container}>
          <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>

          <AnimatedSplashOverlay />
        </View>
      </ThemeProvider>
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
});