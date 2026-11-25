import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import InputText from '@/components/ui/InputText';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

function extrairId(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const valor =
    obj?.usuario?.id_usuario ??
    obj?.usuario?.id ??
    obj?.user?.id_usuario ??
    obj?.user?.id ??
    obj?.id_usuario ??
    obj?.id ??
    null;

  if (valor === null || valor === undefined || String(valor).trim() === '') {
    return null;
  }
  return String(valor).trim();
}

export default function CadastroScreen() {
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmation: '' });
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef(null);

  async function autenticarAutomaticamente(dadosCadastro, emailCadastrado, senhaCadastrada) {
    let dadosSessao = dadosCadastro;
    let novoUsuarioId = extrairId(dadosSessao);

    if (!novoUsuarioId) {
      const loginResponse = await api.post('/usuarios/login', {
        email: emailCadastrado,
        senha: senhaCadastrada,
      });
      dadosSessao = loginResponse.data;
      novoUsuarioId = extrairId(dadosSessao);
    }

    const usuarioObjeto = dadosSessao?.usuario ?? dadosSessao ?? null;
    const token = dadosSessao?.token ?? dadosSessao?.access_token ?? null;

    if (novoUsuarioId) {
      await AsyncStorage.setItem('usuarioId', String(novoUsuarioId));
      const usuarioParaStorage =
        usuarioObjeto && typeof usuarioObjeto === 'object'
          ? {
              ...usuarioObjeto,
              id: Number.isNaN(Number(novoUsuarioId)) ? novoUsuarioId : Number(novoUsuarioId),
            }
          : {
              id: Number.isNaN(Number(novoUsuarioId)) ? novoUsuarioId : Number(novoUsuarioId),
              email: emailCadastrado,
            };
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioParaStorage));
    }

    if (token && api?.defaults?.headers?.common) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    if (typeof auth?.signIn === 'function') {
      await auth.signIn({
        usuarioId: novoUsuarioId,
        token,
        usuario: usuarioObjeto,
      });
    } else if (typeof auth?.login === 'function') {
      await auth.login(novoUsuarioId, token);
    } else if (typeof auth?.setUsuario === 'function' && usuarioObjeto) {
      auth.setUsuario(usuarioObjeto);
    } else if (typeof auth?.setUsuarioId === 'function' && novoUsuarioId) {
      auth.setUsuarioId(novoUsuarioId);
    }

    return novoUsuarioId;
  }

  async function handleRegister() {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    const nextErrors = {
      name: normalizedName ? '' : 'Informe seu nome completo.',
      email: !normalizedEmail ? 'Informe seu e-mail.' : !validEmail ? 'Informe um e-mail válido.' : '',
      password: !password ? 'Informe uma senha.' : password.length < 6 ? 'A senha deve ter pelo menos 6 caracteres.' : '',
      confirmation: !confirmation ? 'Confirme sua senha.' : confirmation !== password ? 'As senhas não correspondem.' : '',
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).every((error) => !error)) {
      try {
        setLoading(true);

        const response = await api.post('/usuarios', {
          nome: normalizedName,
          email: normalizedEmail,
          senha: password,
        });

        console.log('Utilizador registado com sucesso:', response.data);

        const novoUsuarioId = await autenticarAutomaticamente(response.data, normalizedEmail, password);
        const primeiroNome = normalizedName.split(' ')[0] || 'Atleta';

        router.replace({
          pathname: '/cadastroConcluido',
          params: {
            nome: primeiroNome,
            ...(novoUsuarioId ? { usuarioId: String(novoUsuarioId) } : {}),
          },
        });
      } catch (err) {
        console.error('Erro no cadastro:', err.response?.data || err.message);

        const status = err.response?.status;
        const mensagemServidor = err.response?.data?.message;

        const ehEmailDuplicado =
          (typeof mensagemServidor === 'string' && mensagemServidor.toLowerCase().includes('registado')) ||
          (Array.isArray(mensagemServidor) && mensagemServidor.some((m) => m.toLowerCase().includes('registado')));

        if (status === 400 || status === 409 || ehEmailDuplicado) {
          router.push({
            pathname: '/(auth)/erro',
            params: {
              titulo: 'E-mail já cadastrado',
              mensagem: typeof mensagemServidor === 'string' ? mensagemServidor : 'Este e-mail já está registado na nossa plataforma.',
            },
          });
        } else {
          router.push({
            pathname: '/(auth)/erro',
            params: {
              titulo: 'Problema interno',
              mensagem: 'Tivemos um problema interno no servidor. Por favor, tenta novamente mais tarde.',
            },
          });
        }
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('@/components/assets/mascote/pose2-mascot2.svg')}
            contentFit="contain"
            style={styles.mascot}
          />
          <Text style={styles.title}>Seja bem-vindo</Text>
          <View style={styles.form}>
            <InputText
              label="Nome"
              placeholder="Seu nome completo"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={errors.name || null}
            />
            <InputText
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              error={errors.email || null}
            />
            <PasswordInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              error={errors.password || null}
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <PasswordInput
              label="Confirmar senha"
              value={confirmation}
              onChangeText={setConfirmation}
              error={errors.confirmation || null}
              autoComplete="new-password"
              textContentType="newPassword"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />

            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FF5E32" />
              </View>
            ) : (
              <Button titulo="Criar conta" onPress={handleRegister} />
            )}

            <Pressable onPress={() => router.replace('/login')} style={styles.loginLink}>
              <Text style={styles.linkText}>Já tenho conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7FF',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 60,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    color: '#22202A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 22,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 380,
  },
  loginLink: {
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 8,
  },
  linkText: {
    color: '#FF5E32',
    fontSize: 14,
  },
  loaderContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
});