import axios from 'axios';

// Podes mudar dinamicamente conforme o ambiente (ex: __DEV__ para desenvolvimento)
const API_URL = 'http://192.168.100.31:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Exemplo de função usando a instância centralizada
export async function fetchUsuarioXp(usuarioId) {
  try {
    const response = await api.get(`/usuarios/${usuarioId}/xp`);
    return response.data;
  } catch (err) {
    console.error('Erro detalhado de conexão:', err.message);
    throw new Error('Erro ao buscar dados do usuário');
  }
}