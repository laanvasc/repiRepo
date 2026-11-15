import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import InputCheckboxModalidade from '@/components/ui/InputCheckboxModalidade';
import InputText from '@/components/ui/InputText';
import { WebBadge } from '@/components/web-badge';
import HorarioSeletorInput from '../components/ui/HorarioSeletorInput';
import SeletorDiasSemana from '../components/ui/SeletorDiaSemana';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function CadastrarAtividadeScreen() {
  const { usuarioId } = useAuth();
  
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [diasRepeticao, setDiasRepeticao] = useState(['ter', 'qua', 'sex']);
  const [horarioValue, setHorario] = useState('18:00');
  const [loading, setLoading] = useState(false);

  const toggleDia = (id) => {
    setDiasRepeticao((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleCriarAtividade = async () => {
    if (!nomeAtividade.trim()) {
      Alert.alert('Atenção', 'Por favor, insere o nome da atividade.');
      return;
    }

    if (!usuarioId) {
      Alert.alert('Erro', 'Utilizador não identificado.');
      return;
    }

    try {
      setLoading(true);

      // Converte o array de dias selecionados nos nomes exatos que o teu backend/base de dados espera (repete_seg, repete_ter, etc.)
      const diasObj = {
        repete_seg: diasRepeticao.includes('seg'),
        repete_ter: diasRepeticao.includes('ter'),
        repete_qua: diasRepeticao.includes('qua'),
        repete_qui: diasRepeticao.includes('qui'),
        repete_sex: diasRepeticao.includes('sex'),
        repete_sab: diasRepeticao.includes('sab'),
        repete_dom: diasRepeticao.includes('dom'),
      };
      
      // Envia os dados para a API do NestJS
      await api.post(`/usuarios/${usuarioId}/atividades-frequentes`, {
        nome_atividade: nomeAtividade,
        categoria: modalidade || 'Geral',
        ...diasObj, // Envia repete_seg, repete_ter, etc. como booleanos (true/false)
        horario: horarioValue,
      });

      

    } catch (err) {
      console.error('Erro ao criar atividade:', err.response?.data || err.message);
      
      const mensagemServidor = err.response?.data?.message || 'Não foi possível cadastrar a atividade.';

      // Redireciona para o ecrã de erro customizado com parâmetros
      router.push({
        pathname: '/(auth)/erro',
        params: {
          titulo: 'Erro ao cadastrar',
          mensagem: mensagemServidor,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Fixo com espaçamento lateral uniforme */}
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView title="Cadastrar Atividade" />
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <ThemedView style={styles.formContainer}>
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

            <Button 
              titulo={loading ? "A criar..." : "Criar Atividade"} 
              onPress={handleCriarAtividade}
              disabled={loading}
            />
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    backgroundColor: 'transparent',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  formContainer: {
    gap: Spacing.three,
    backgroundColor: 'transparent',
    width: '100%',
  },
});