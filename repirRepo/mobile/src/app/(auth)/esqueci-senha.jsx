import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import InputText from '@/components/ui/InputText';

export default function EsqueciSenhaScreen() {
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState('');
	const [message, setMessage] = useState('');

	function handleRecovery() {
		const normalizedEmail = email.trim();
		const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
		setEmailError(!normalizedEmail ? 'Informe seu e-mail.' : !validEmail ? 'Informe um e-mail válido.' : '');
		setMessage(validEmail ? 'A recuperação será conectada ao backend. Nenhum e-mail foi enviado.' : '');
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
					<Text style={styles.title}>Recuperar senha</Text>
					<Text style={styles.description}>
						Informe o e-mail cadastrado para continuar a recuperação da sua conta.
					</Text>
					<View style={styles.form}>
						<InputText
							label="E-mail"
							placeholder="seuemail@exemplo.com"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							value={email}
							  onChangeText={(value) => {
								setEmail(value);
								setMessage('');
							}}
							error={emailError || null}
						/>
						<Button titulo="Recuperar senha" onPress={handleRecovery} />
						{message ? <Text style={styles.message}>{message}</Text> : null}
						<Pressable onPress={() => router.replace('/login')} style={styles.loginLink}>
							<Text style={styles.linkText}>Voltar ao Login</Text>
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
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 12,
		textAlign: 'center',
	},
	description: {
		color: '#60646C',
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 28,
		maxWidth: 340,
		textAlign: 'center',
	},
	form: {
		width: '100%',
		maxWidth: 380,
	},
	message: {
		color: '#60646C',
		fontSize: 13,
		lineHeight: 18,
		marginTop: 12,
		textAlign: 'center',
	},
	loginLink: {
		alignSelf: 'center',
		marginTop: 12,
		paddingVertical: 4,
	},
	linkText: {
		color: '#FF5E32',
		fontSize: 14,
	},
});