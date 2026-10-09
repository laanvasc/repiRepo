 import { Platform, ScrollView, StyleSheet } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';


import HeaderAreaView from '@/components/header-area-view';

import { ThemedText } from '@/components/themed-text';

import { ThemedView } from '@/components/themed-view';


import CardXpTotal from '@/components/ui/CardXpTotal';

import MensalCard from '@/components/ui/MensalCard';

import { NotificationButton } from '@/components/ui/NotificationButton';

import { WebBadge } from '@/components/web-badge';


import { View } from 'react-native';

import Trofeu from '../../components/ui/Trofeu';


import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';


export default function PerfilScreen() {

  return (

    <ThemedView style={styles.container}>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

        {/* Header Fixo compactado */}

        <ThemedView style={styles.headerContainer}>

          <HeaderAreaView

            title="Meu Perfil"

            buttonIcon={

              <NotificationButton

                onPress={() => console.log('Notificações clicadas!')}

              />

            }

          />

        </ThemedView>


        <ScrollView

          style={styles.scrollView}

          contentContainerStyle={styles.scrollContent}

          showsVerticalScrollIndicator={false}

        >

          <ThemedView style={styles.cardsWrapper}>

            {/* Cards de XP e Mensal */}

            <CardXpTotal

              nivel={7}

              xpTotal={1250}

              xpAtualNivel={250}

              xpNecessarioNivel={500}

            />

            <MensalCard />

          </ThemedView>


          <ThemedView style={styles.sectionsWrapper}>

            <ThemedText>Trofeus</ThemedText>

            <View style={{ flexDirection: 'row', gap: 12 }}>

                {/* Troféu Conquistado */}

                <Trofeu tituloTrofeu="Primeiro Passo" disabled={false} />


                {/* Troféu Bloqueado */}

                <Trofeu tituloTrofeu="Milhar" disabled={true} />


              </View>

          </ThemedView>


          {Platform.OS === 'web' && <WebBadge />}

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

    width: '100%',

    maxWidth: MaxContentWidth,

    alignSelf: 'center',

  },

  headerContainer: {

    width: '100%',

    paddingHorizontal: Spacing.three, // Reduzido de Spacing.four

    backgroundColor: 'transparent',

  },

  scrollView: {

    flex: 1,

    width: '100%',

  },

  scrollContent: {

    paddingHorizontal: Spacing.three, // Reduzido para aproximar as margens das bordas

    paddingTop: Spacing.one, // Reduzido a distância entre o header e o primeiro card

    paddingBottom: BottomTabInset + Spacing.two, // Menor padding inferior

  },

  cardsWrapper: {

    width: '100%',

    gap: Spacing.two, // Espaçamento menor entre os cards

    backgroundColor: 'transparent',

  },

  sectionsWrapper: {

    width: '100%',

    gap: Spacing.three, // Espaçamento menor entre seções

    paddingTop: Spacing.two,

    backgroundColor: 'transparent',

  },

});

