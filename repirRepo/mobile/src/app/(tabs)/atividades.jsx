import { Platform, ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { NotificationButton } from '@/components/ui/NotificationButton';

import { BottomTabInset } from '@/constants/theme';


export default function AtividadesScreen() {
    return (
      
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <HeaderAreaView
                title="Suas atividades"
                buttonIcon={
                  <NotificationButton onPress={() => console.log('Notificações clicadas!')} />
                }
              />

                <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          

      
          
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
