import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import InputText from '@/components/ui/InputText';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function LoginScreen() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	function handleLogin() {
		const normalizedEmail = email.trim();
		const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
		setEmailError(!normalizedEmail ? 'Informe seu e-mail.' : !validEmail ? 'Informe um e-mail válido.' : '');
		setPasswordError(password ? '' : 'Informe sua senha.');

		if (validEmail && password) {
			router.replace('/home');
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
					<Text style={styles.title}>Bem-vindo de volta</Text>
					<View style={styles.form}>
						<InputText
							label="E-mail"
							placeholder="seuemail@exemplo.com"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							value={email}
							onChangeText={setEmail}
							error={emailError || null}
						/>
						<PasswordInput
							label="Senha"
							value={password}
							onChangeText={setPassword}
							error={passwordError || null}
							autoComplete="current-password"
							textContentType="password"
						/>
						<Pressable onPress={() => router.push('/esqueci-senha')} style={styles.forgotLink}>
							<Text style={styles.linkText}>Esqueci minha senha</Text>
						</Pressable>
						<Button titulo="Entrar" onPress={handleLogin} />
						<Pressable onPress={() => router.push('/cadastro')} style={styles.createLink}>
							<Text style={styles.linkText}>Criar conta</Text>
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
		paddingVertical: 24,
	},
	mascot: {
		width: 80,
		height: 80,
		marginBottom: 12,
	},
	title: {
		color: '#22202A',
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 34,
		textAlign: 'center',
	},
	form: {
		width: '100%',
		maxWidth: 380,
	},
	forgotLink: {
		alignSelf: 'flex-end',
		marginTop: -8,
		marginBottom: 18,
		paddingVertical: 4,
	},
	createLink: {
		alignSelf: 'center',
		marginTop: 12,
		paddingVertical: 4,
	},
	linkText: {
		color: '#FF5E32',
		fontSize: 14,
	},
});