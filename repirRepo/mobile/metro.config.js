const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Caminhos dos diretórios
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Monitora arquivos do monorepo
config.watchFolders = [workspaceRoot];

// 2. Aponta onde encontrar os node_modules (pasta local + raiz)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Mapeamento direto de pacotes que o Expo Router requer
config.resolver.extraNodeModules = {
  'react-native-screens': path.resolve(workspaceRoot, 'node_modules/react-native-screens'),
  'react-native-safe-area-context': path.resolve(workspaceRoot, 'node_modules/react-native-safe-area-context'),
};

module.exports = config;