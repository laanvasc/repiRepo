import { useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';

import InputCheckboxModalidade from '@/components/ui/InputCheckboxModalidade';
import InputText from '@/components/ui/InputText';
import { WebBadge } from '@/components/web-badge';
import HorarioSeletorInput from '../../components/ui/HorarioSeletorInput';
import SeletorDiasSemana from '../../components/ui/SeletorDiaSemana';

import Button from '@/components/ui/Button';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function CadastrarAtividadeScreen() {
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [diasRepeticao, setDiasRepeticao] = useState(['ter', 'qua', 'sex']);
  const toggleDia = (id) => {
  setDiasRepeticao((prev) =>
    prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
  );
};
  const [horarioValue, setHorario] = useState('18:00');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Fixo no topo */}
        <HeaderAreaView title="Cadastrar Atividade" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <ThemedView style={styles.titleContainer}>
            {/* Campo de Nome da Atividade */}
            <InputText
              label="Nome da atividade"
              placeholder="Ex: Corrida matinal"
              autoCapitalize="words"
              autoCorrect={true}
              value={nomeAtividade}
              onChangeText={setNomeAtividade}
            />

            {/* Select de Modalidade */}
            <InputCheckboxModalidade
              valorSelecionado={modalidade}
              onSelectOption={(value) => setModalidade(value)}
            />

            <SeletorDiasSemana
                diasSelecionados={diasRepeticao}
                onToggleDia={toggleDia}
                />

            <HorarioSeletorInput
            horarioValue={horarioValue}
            onChangeHorario={(value) => setHorario(value)}
            />

            <Button titulo="Criar Atividade" ></Button>




            <ThemedView style={styles.cardsContainer}>
             
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.sectionsWrapper}>
            {/* Outras seções se necessário */}
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
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  cardsContainer: {
    gap: 12,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  sectionsWrapper: {
    marginTop: 16,
    backgroundColor: 'transparent',
  },
});