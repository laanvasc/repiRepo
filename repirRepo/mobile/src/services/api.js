// mobile/src/services/api.js
const API_URL = 'http://10.0.2.2:3000'; // Altere para seu IP se testar no celular físico

export async function fetchUsuarioXp(usuarioId) {
  const response = await fetch(`${API_URL}/usuarios/${usuarioId}/xp`);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do usuário');
  }
  return await response.json();
}