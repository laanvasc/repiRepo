import axios from 'axios';

// Aponta diretamente para o teu backend em produção no Render
const API_URL = 'https://repirepo.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentado para 30 segundos para dar tempo ao Render de "acordar" se estiver em descanso
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchUsuarioXp(usuarioId) {
  try {
    const response = await api.get(`/usuarios/${usuarioId}/xp`);
    return response.data;
  } catch (err) {
    console.error('Erro detalhado de conexão:', err.message);
    throw new Error('Erro ao buscar dados do usuário');
  }
}