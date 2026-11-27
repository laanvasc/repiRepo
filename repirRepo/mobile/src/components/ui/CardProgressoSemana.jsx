import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/services/api';

function normalizarListaDias(valor) {
  if (!Array.isArray(valor)) return [];
  return valor.filter(Boolean);
}

function obterTotalAtividadesDia(item) {
  if (!item || typeof item !== 'object') return 0;

  const candidatos = [
    item.totalAtividadesDia,
    item.total_atividades_dia,
    item.totalAtividades,
    item.total_atividades,
    item.quantidadeAtividades,
    item.quantidade_atividades,
    item.metaDiaria,
    item.meta_diaria,
  ];

  for (const valor of candidatos) {
    const num = Number(valor);
    if (Number.isFinite(num) && num >= 0) {
      return num;
    }
  }

  if (Array.isArray(item.atividades)) {
    return item.atividades.length;
  }

  if (Array.isArray(item.itens)) {
    return item.itens.length;
  }

  return 0;
}

export function CardProgressoSemanal({
  titulo = 'Progresso Semanal',
  dias = [],
  usuarioId,
  refreshKey = 0,
}) {
  const [diasInternos, setDiasInternos] = useState(() => normalizarListaDias(dias));

  useEffect(() => {
    if (Array.isArray(dias)) {
      setDiasInternos(normalizarListaDias(dias));
    }
  }, [dias, refreshKey]);

  useEffect(() => {
    if (!usuarioId) return;

    let ativo = true;

    async function buscarProgresso() {
      try {
        const res = await api.get(`/usuarios/${usuarioId}/progresso-semanal`);
        if (ativo && Array.isArray(res.data)) {
          setDiasInternos(normalizarListaDias(res.data));
        }
      } catch (err) {
        console.error('Erro ao atualizar progresso semanal:', err);
      }
    }

    buscarProgresso();

    return () => {
      ativo = false;
    };
  }, [usuarioId, refreshKey]);

  const listaDias = normalizarListaDias(diasInternos);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>

      <View style={styles.diasContainer}>
        {listaDias.map((item, index) => {
          const totalDoDia = obterTotalAtividadesDia(item);
          const realizadas = Math.max(Number(item?.atividadesFeitas) || 0, 0);
          const percentual =
            totalDoDia > 0
              ? Math.min(Math.max(realizadas / totalDoDia, 0), 1) * 100
              : 0;
          const chaveDia = `${item?.id ?? item?.dia ?? 'dia'}-${index}`;

          return (
            <View key={chaveDia} style={styles.pillBackground}>
              {/* Preenchimento dinâmico de baixo para cima */}
              {percentual > 0 ? (
                <View
                  style={[
                    styles.pillFill,
                    { height: `${percentual}%` },
                  ]}
                />
              ) : null}

              {/* Letra do dia da semana */}
              <Text style={[styles.diaText, item?.atual && styles.diaAtualText]}>
                {item?.dia ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default CardProgressoSemanal;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151522',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pillBackground: {
    flex: 1,
    height: 80,
    backgroundColor: '#FCD8CD',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pillFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF5E32',
    borderRadius: 28,
  },
  diaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    zIndex: 2,
  },
  diaAtualText: {
    textDecorationLine: 'underline',
  },
});