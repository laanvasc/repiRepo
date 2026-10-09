import { Pressable, StyleSheet, Text, View } from 'react-native';

const DIAS_SEMANA = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sab' },
  { id: 'dom', label: 'Dom' },
];

export function SeletorDiasSemana({
  label = 'Repetir semanalmente',
  diasSelecionados = [],
  onToggleDia,
}) {
  const handleToggle = (id) => {
    if (onToggleDia) {
      onToggleDia(id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Rótulo Superior */}
      <Text style={styles.label}>{label}</Text>

      {/* Lista Horizontal dos Dias */}
      <View style={styles.diasContainer}>
        {DIAS_SEMANA.map((dia) => {
          const isSelected = diasSelecionados.includes(dia.id);

          return (
            <Pressable
              key={dia.id}
              style={[
                styles.diaButton,
                isSelected ? styles.diaSelected : styles.diaUnselected,
              ]}
              onPress={() => handleToggle(dia.id)}
            >
              <Text
                style={[
                  styles.diaText,
                  isSelected ? styles.textSelected : styles.textUnselected,
                ]}
              >
                {dia.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default SeletorDiasSemana;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 12,
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diaButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaSelected: {
    backgroundColor: '#FF5733', // Laranja ativo do tema
  },
  diaUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  diaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textUnselected: {
    color: '#4A5568',
  },
});