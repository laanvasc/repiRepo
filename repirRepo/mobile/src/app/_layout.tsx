import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;

  return (
    <ThemeProvider value={theme}>
      <View style={styles.container}>
        <AnimatedSplashOverlay />
        <Stack initialRouteName="(auth)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        WebkitTapHighlightColor: 'transparent',
      },
    }),
  },
});