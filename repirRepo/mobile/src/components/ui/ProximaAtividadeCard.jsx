import {
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Função auxiliar para calcular qual é a atividade mais próxima com base na hora atual
function encontrarProximaAtividade(atividades) {
  if (!atividades || atividades.length === 0) return null;

  const agora = new Date();
  const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();

  // Mapeia todas as atividades e converte o horário para minutos do dia
  const atividadesComMinutos = atividades.map((item) => {
    const horarioStr = item.horario || '00:00';
    const [horas, minutos] = horarioStr.split(':').map(Number);
    const totalMinutos = (horas || 0) * 60 + (minutos || 0);
    return { ...item, totalMinutos };
  });

  // Filtra apenas as atividades que ainda vão acontecer hoje (horário > hora atual)
  const futuras = atividadesComMinutos.filter((item) => item.totalMinutos >= minutosAtuais);

  if (futuras.length > 0) {
    // Ordena da mais próxima para a mais distante e pega a primeira
    futuras.sort((a, b) => a.totalMinutos - b.totalMinutos);
    return futuras[0];
  }

  // Se já passaram todas as atividades de hoje, opcionalmente retorna a primeira de amanhã (ou a primeira do dia)
  atividadesComMinutos.sort((a, b) => a.totalMinutos - b.totalMinutos);
  return atividadesComMinutos[0];
}

export default function ProximaAtividadeCard({ atividades = [] }) {
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  // Calcula dinamicamente a próxima atividade com base no relógio
  const proxima = encontrarProximaAtividade(atividades);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.card}>
      {/* CONTEÚDO DE TEXTO À ESQUERDA */}
      <View style={styles.content}>
        <Text style={styles.title}>PRÓXIMA ATIVIDADE</Text>

        <View style={styles.activityRow}>
          <View style={styles.iconCircle}>
            <Svg width={28} height={28} viewBox="0 0 48 48">
              <Path
                d="M4 25H12L17 14L24 34L30 20L34 25H44"
                fill="none"
                stroke="#EE6C42"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.activity} numberOfLines={1}>
            {proxima ? proxima.nome_atividade || proxima.titulo : 'Nenhuma atividade pendente'}
          </Text>
        </View>
      </View>

      {/* MASCOTE À DIREITA */}
      <Image
        source={require('../assets/mascote/pose2-mascot2.svg')}
        style={styles.mascot}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 126,
    backgroundColor: '#FFB4ED',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 16,
    color: '#000000',
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activity: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    lineHeight: 18,
    color: '#000000',
    flexShrink: 1,
  },
  mascot: {
    width: 95,
    height: 95,
    marginLeft: 8,
  },
});