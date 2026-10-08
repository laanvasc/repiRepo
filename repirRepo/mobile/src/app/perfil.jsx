import { Platform, ScrollView, StyleSheet } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '../components/header-area-view';
import { NotificationButton } from '../components/ui/NotificationButton';

import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

import { ThemedView } from '@/components/themed-view';

import MensalCard from '../components/ui/MensalCard';


export default function PerfilScreen() {
    return (

          <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
          <HeaderAreaView 
                    title="Meu Perfil" 
                    // aqui vai ficar um tres botões de configuração
                    buttonIcon={
                      <NotificationButton onPress={() => console.log('Notificações clicadas!')} />
                    }
                  />      
         <ScrollView>

      

      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          

          
        </ThemedView>

        <ThemedView>
          <MensalCard />
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          
          

          
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
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
  

  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});
