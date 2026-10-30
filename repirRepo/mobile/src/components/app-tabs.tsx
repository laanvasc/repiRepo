import { Tabs, router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF5733',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.background }],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Início */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={[styles.tabBarLabel, { color }]}></Text> : null,
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/tabIcons/icone_home3x.png')}
              style={[styles.tabIcon, { tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* 2. Atividades */}
      <Tabs.Screen
        name="atividades"
        options={{
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={[styles.tabBarLabel, { color }]}></Text> : null,
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/tabIcons/icone_atividades3x.png')}
              style={[styles.tabIcon, { tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* 3. Botão Central Flutuante (+) REMOVIDO
      <Tabs.Screen
        name="cadastrarAtividade"
        options={{
          title: '',
          tabBarButton: ({ children, ref, ...props }) => (
            <Pressable
              {...props}
              style={styles.floatingButtonContainer}
              onPress={() => {
                router.push('/(tabs)/cadastrarAtividade');
              }}
            >
              <View style={styles.floatingButton}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
            </Pressable>
          ),
        }}
      /> */}

      {/* 4. Metas */}
      <Tabs.Screen
        name="metas"
        options={{
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={[styles.tabBarLabel, { color }]}></Text> : null,
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/tabIcons/icone_metas3x.png')}
              style={[styles.tabIcon, { tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* 5. Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          tabBarLabel: ({ focused, color }) =>
            focused ? <Text style={[styles.tabBarLabel, { color }]}></Text> : null,
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../../assets/images/tabIcons/icone_perfil3x.png')}
              style={[styles.tabIcon, { tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* --- TELAS OCULTAS DA TABBAR --- */}
      <Tabs.Screen
        name="notificacoes"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="registrarAtividade"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  floatingButtonContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  floatingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5733',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '400',
    marginTop: -2,
  },
});