import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import InputText from '@/components/ui/InputText';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { api } from '@/services/api';

export default function CadastroScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmation: '' });
    const [loading, setLoading] = useState(false);

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

                // Envia os dados para a API do NestJS guardar no Supabase
                const response = await api.post('/usuarios', {
                    nome: normalizedName,
                    email: normalizedEmail,
                    senha: password,
                });

                console.log('Utilizador registado com sucesso:', response.data);

                Alert.alert(
                    'Sucesso', 
                    'Conta criada com sucesso! Podes fazer o login agora.',
                    [{ text: 'OK', onPress: () => router.replace('/login') }]
                );

            } catch (err) {
                console.error('Erro no cadastro:', err.response?.data || err.message);
                const mensagemErro = err.response?.data?.message || 'Não foi possível efetuar o registo. Tenta novamente.';
                Alert.alert('Erro no Cadastro', mensagemErro);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 20,
    },
    mascot: {
        width: 64,
        height: 64,
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
        marginTop: 10,
        paddingVertical: 4,
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