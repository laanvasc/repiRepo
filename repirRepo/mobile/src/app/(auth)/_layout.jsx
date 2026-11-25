import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="esqueci-senha" />
      <Stack.Screen name="sucesso" />
      <Stack.Screen name="erro" />
      <Stack.Screen name="escolherEsportes" />
      <Stack.Screen name="diasEsportes" />
      <Stack.Screen name="atividadesPorEsporte" />
      <Stack.Screen name="escolherDiaAtividades"/>
    </Stack>
  );
}