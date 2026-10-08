import { Platform, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';

import MetaCard from '../components/ui/MetaCard';



export default function MetaScreen() {
    return (
         <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Metas</ThemedText>
          <ThemedText style={styles.centerText} themeColor="textSecondary">
            Exemplo Texto
          </ThemedText>

          <ThemedView>
            <MetaCard tituloMeta='Fazer 3 atividades' onPress={console.log("testando")}/>
            <MetaCard tituloMeta='Fazer 3 atividades'/>
            <MetaCard tituloMeta='Fazer 3 atividades'/>
            <MetaCard tituloMeta='Fazer 3 atividades'/>
          </ThemedView>
          
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          

          
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
    );
}

const styles = StyleSheet.create({
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
