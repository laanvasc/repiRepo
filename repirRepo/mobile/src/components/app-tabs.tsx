import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      // Remove o fundo/pílula de destaque do Android
      indicatorColor="transparent"
      // Define a cor do ícone ativo (substitui o accentColor que não existe na interface)
      tintColor="#FF5733"
      labelStyle={{
        selected: { color: '#FF5733' }, // Cor ativa da legenda
        default: { color: '#8E8E93' },  // Cor inativa
      }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/icone_home3x.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="atividades">
        <NativeTabs.Trigger.Label>Atividades</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/icone_atividades3x.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="metas">
        <NativeTabs.Trigger.Label>Metas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/icone_metas3x.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('../../assets/images/tabIcons/icone_perfil3x.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}