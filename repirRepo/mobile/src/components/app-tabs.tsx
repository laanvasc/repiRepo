import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      // Ajuste de cores da label ativa/inativa
      labelStyle={{
        selected: { color: '#FF5733' }, // Cor ativa da imagem
        default: { color: '#8E8E93' },  // Cor inativa
      }}
      // Estilo de tint dos ícones nativos
      tintColor="#FF5733"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="atividades">
        <NativeTabs.Trigger.Label>Atividades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')} // Atualize a imagem aqui se tiver
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="metas">
        <NativeTabs.Trigger.Label>Metas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')} // Atualize a imagem aqui se tiver
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')} // Atualize a imagem aqui se tiver
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* 
        NOTA: Não declare um <NativeTabs.Trigger name="(auth)" /> aqui.
        Por padrão, o NativeTabs ignora rotas não declaradas nos triggers,
        então (auth) não aparecerá na barra inferior!
      */}
    </NativeTabs>
  );
}