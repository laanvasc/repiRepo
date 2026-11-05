import React, { createContext, useContext, useState, useEffect } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuarioId, setUsuarioId] = useState(null);

  // Quando o app abre, carrega apenas o que está guardado no AsyncStorage
  useEffect(() => {
    async function carregarUsuarioSalvo() {
      try {
        const idSalvo = await AsyncStorage.getItem('@usuarioId');
        if (idSalvo) {
          setUsuarioId(Number(idSalvo));
        }
      } catch (err) {
        console.error('Erro ao carregar ID do AsyncStorage:', err);
      }
    }
    carregarUsuarioSalvo();
  }, []);

  const entrar = async (id) => {
    const numId = Number(id);
    console.log(' --------------------AuthContext - A mudar para o ID:', numId);
    setUsuarioId(numId);
    await AsyncStorage.setItem('@usuarioId', String(numId));
  };

  const sair = async () => {
    setUsuarioId(null);
    await AsyncStorage.removeItem('@usuarioId');
  };

  // Blindagem contra textos soltos
  const safeChildren = React.Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return <Text>{child}</Text>;
    }
    return child;
  });

  return (
    <AuthContext.Provider value={{ usuarioId, entrar, sair }}>
      {safeChildren}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}