import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { WebBadge } from '@/components/web-badge';
import HorarioSeletorInput from '../components/ui/HorarioSeletorInput';
import SeletorDiasSemana from '../components/ui/SeletorDiaSemana';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function CadastrarAtividadeScreen() {
  const { usuarioId } = useAuth();

  const [listaAtividades, setListaAtividades] = useState([]);
  const [atividadeSelecionadaId, setAtividadeSelecionadaId] = useState(null);
  const [diasRepeticao, setDiasRepeticao] = useState(['ter', 'qua', 'sex']);
  const [horarioValue, setHorario] = useState('18:00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarCatalogo() {
      try {
        const response = await api.get('/usuarios/catalogo-atividades');
        const dados = Array.isArray(response.data) ? response.data : [];
        setListaAtividades(dados);
        if (dados.length > 0) {
          setAtividadeSelecionadaId(dados[0].id_atividade);
        }
      } catch (err) {
        console.error('Erro ao carregar catálogo de atividades:', err);
      }
    }
    carregarCatalogo();
  }, []);

  const toggleDia = (id) => {
    setDiasRepeticao((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleCriarAtividade = async () => {
    if (!atividadeSelecionadaId) {
      Alert.alert('Atenção', 'Por favor, selecione uma atividade.');
      return;
    }

    if (!usuarioId) {
      Alert.alert('Erro', 'Utilizador não identificado.');
      return;
    }

    try {
      setLoading(true);

      const diasObj = {
        repete_seg: diasRepeticao.includes('seg'),
        repete_ter: diasRepeticao.includes('ter'),
        repete_qua: diasRepeticao.includes('qua'),
        repete_qui: diasRepeticao.includes('qui'),
        repete_sex: diasRepeticao.includes('sex'),
        repete_sab: diasRepeticao.includes('sab'),
        repete_dom: diasRepeticao.includes('dom'),
      };

      await api.post(`/usuarios/${usuarioId}/atividades-frequentes`, {
        id_atividade: Number(atividadeSelecionadaId),
        ...diasObj,
        horario: horarioValue,
      });

      if (Platform.OS === 'web') {
        window.alert('Atividade cadastrada com sucesso!');
        router.replace('/(tabs)/atividades');
      } else {
        Alert.alert(
          'Sucesso!',
          'Atividade cadastrada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/atividades'),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (err) {
      console.error('Erro ao criar atividade:', err.response?.data || err.message);

      const mensagemServidor =
        err.response?.data?.message || 'Não foi possível cadastrar a atividade.';

      Alert.alert('Erro ao cadastrar', mensagemServidor);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView title="Cadastrar Atividade" />
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <ThemedView style={styles.formContainer}>
            <Text style={styles.label}>Selecione a Atividade</Text>
            <View style={styles.catalogoContainer}>
              {listaAtividades.map((item) => {
                const isSelected = atividadeSelecionadaId === item.id_atividade;
                return (
                  <Pressable
                    key={String(item.id_atividade)}
                    style={[styles.itemCatalogo, isSelected && styles.itemCatalogoSelecionado]}
                    onPress={() => setAtividadeSelecionadaId(item.id_atividade)}
                  >
                    <Text style={[styles.textoCatalogo, isSelected && styles.textoCatalogoSelecionado]}>
                      {item.nome_atividade}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <SeletorDiasSemana
              diasSelecionados={diasRepeticao}
              onToggleDia={toggleDia}
            />

            <HorarioSeletorInput
              horarioValue={horarioValue}
              onChangeHorario={(value) => setHorario(value)}
            />

            <Button
              titulo={loading ? 'A associar...' : 'Salvar Atividade'}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22202A',
    marginBottom: -4,
  },
  catalogoContainer: {
    gap: 8,
  },
  itemCatalogo: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  itemCatalogoSelecionado: {
    borderColor: '#FF5E32',
    backgroundColor: '#FFF0EC',
  },
  textoCatalogo: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  textoCatalogoSelecionado: {
    color: '#FF5E32',
    fontWeight: '700',
  },
});