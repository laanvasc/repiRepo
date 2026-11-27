import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HeaderAreaView from '@/components/header-area-view';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { WebBadge } from '@/components/web-badge';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

function extrairXpAtividade(params) {
  const candidatos = [
    params?.xp,
    params?.xp_atividade,
    params?.xpAtividade,
    params?.xp_base,
    params?.xpBase,
    params?.xp_ganho,
  ];

  for (const valor of candidatos) {
    const numero = Number(valor);
    if (Number.isFinite(numero) && numero > 0) {
      return numero;
    }
  }

  return 30;
}

export default function RegistrarAtividadeScreen() {
  const { usuarioId } = useAuth();
  const params = useLocalSearchParams();

  const idAtividade = params.id_atividade;
  const nomeAtividade = params.nome_atividade || 'Atividade';
  const xpCalculado = useMemo(() => extrairXpAtividade(params), [params]);

  const [duracao, setDuracao] = useState('45');
  const [intensidade, setIntensidade] = useState('Moderado'); // 'Leve' | 'Moderado' | 'Intenso'
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucessoBanner, setSucessoBanner] = useState(null);

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const mostrarBannerSucesso = (mensagem) => {
    setSucessoBanner(mensagem);
    bannerAnim.setValue(0);

    Animated.timing(bannerAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => {
      Animated.timing(bannerAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        router.back();
      });
    }, 1200);
  };

  const handleConcluir = async () => {
    if (!usuarioId || !idAtividade) {
      Alert.alert('Erro', 'Informações da atividade em falta.');
      return;
    }

    try {
      setLoading(true);

      await api.post(`/usuarios/${usuarioId}/registrar-atividade`, {
        id_atividade: Number(idAtividade),
        duracao_minutos: Number(duracao) || 0,
        intensidade,
        observacao,
        xp_ganho: xpCalculado,
      });

      mostrarBannerSucesso(`Atividade registrada com sucesso! +${xpCalculado} XP`);
    } catch (err) {
      console.error('Erro ao registar atividade:', err.response?.data || err.message);
      Alert.alert('Erro', 'Não foi possível concluir o registo da atividade.');
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {sucessoBanner ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastSucesso,
            {
              opacity: bannerAnim,
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
          <Text style={styles.toastSucessoText}>{sucessoBanner}</Text>
        </Animated.View>
      ) : null}

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.headerContainer}>
          <HeaderAreaView title="Registrar Atividade" />
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <ThemedView style={styles.formContainer}>
            {/* Card de Resumo da Atividade */}
            <View style={styles.resumoCard}>
              <View style={styles.resumoInfo}>
                <Text style={styles.tituloAtividade}>{nomeAtividade}</Text>
                {/* <Text style={styles.detalheAtividade}>XP da atividade: {xpCalculado} XP</Text> */}
              </View>
            </View>

            {/* Duração (minutos) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duração (minutos)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={duracao}
                onChangeText={setDuracao}
                placeholder="45"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Esforço / Intensidade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Esforço / Intensidade</Text>
              <View style={styles.intensidadeContainer}>
                {['Leve', 'Moderado', 'Intenso'].map((item) => {
                  const isSelected = intensidade === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.intensidadeBtn, isSelected && styles.intensidadeBtnSelected]}
                      onPress={() => setIntensidade(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.intensidadeText, isSelected && styles.intensidadeTextSelected]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Observações (opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observações (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Ex: Senti-me muito bem, bom ritmo."
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>

            {/* Banner de Recompensa de XP */}
            <View style={styles.bannerXp}>
              <Ionicons name="flash" size={24} color="#854D0E" />
              <Text style={styles.bannerXpText}>+{xpCalculado} XP conquistados</Text>
            </View>

            {/* Botão Concluir */}
            <View style={styles.buttonContainer}>
              <Button
                titulo={loading ? 'A registar...' : 'Concluir'}
                onPress={handleConcluir}
                disabled={loading}
              />
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
  toastSucesso: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  toastSucessoText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  resumoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FF5E32',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resumoInfo: {
    flex: 1,
  },
  tituloAtividade: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  detalheAtividade: {
    fontSize: 14,
    color: '#64748B',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  intensidadeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  intensidadeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  intensidadeBtnSelected: {
    borderColor: '#FF5E32',
    backgroundColor: '#FF5E32',
  },
  intensidadeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  intensidadeTextSelected: {
    color: '#FFFFFF',
  },
  bannerXp: {
    backgroundColor: '#D2F500',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  bannerXpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2E05',
  },
  buttonContainer: {
    marginTop: Spacing.two,
  },
});