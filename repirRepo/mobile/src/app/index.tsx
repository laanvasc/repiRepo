import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import { useState } from 'react';

import Button from '../components/ui/Button';
import InputText from '../components/ui/InputText';
import Trofeu from '../components/ui/Trofeu';
import MetaCard from '../components/ui/MetaCard';
import ProximaAtividadeCard from '../components/ui/ProximaAtividadeCard';
import MensalCard from '../components/ui/MensalCard'; 


// function getDevMenuHint() {
//   if (Platform.OS === 'web') {
//     return <ThemedText type="small">use browser devtools</ThemedText>;
//   }
//   if (Device.isDevice) {
//     return (
//       <ThemedText type="small">
//         shake device or press <ThemedText type="code">m</ThemedText> in terminal
//       </ThemedText>
//     );
//   }
//   const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
//   return (
//     <ThemedText type="small">
//       press <ThemedText type="code">{shortcut}</ThemedText>
//     </ThemedText>
//   );
// }

export default function HomeScreen() {

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          {/* coloque o icnoe aqyuio */}
          <AnimatedIcon /> 
          <ThemedText type="title" style={styles.title}>
            texto
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          <Button
          titulo="textotexto"
          
          onPress={()=> console.log("testando")}
          />
          <InputText 
            label="E-mail"
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Trofeu
            tituloTrofeu="123"
          />
          <MetaCard tituloMeta='123'/>

          <ProximaAtividadeCard />

          <MensalCard />

          
          
        </ThemedText>


        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
