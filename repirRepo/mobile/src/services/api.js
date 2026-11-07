import axios from 'axios';

// Define o URL para o Render (podes trocar de volta para 'http://localhost:3000' se precisares de testar localmente)
const API_URL = 'https://repirepo.onrender.com'; 

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos é suficiente
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