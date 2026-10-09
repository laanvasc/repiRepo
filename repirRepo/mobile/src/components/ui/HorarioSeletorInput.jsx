import { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export function HorarioSeletorInput({
  label = 'Horário',
  horarioValue = '18:00',
  onChangeHorario,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [horaSel, minSel] = horarioValue.split(':');

  const selecionarHora = (h) => {
    const novoHorario = `${h}:${minSel || '00'}`;
    if (onChangeHorario) onChangeHorario(novoHorario);
  };

  const selecionarMinuto = (m) => {
    const novoHorario = `${horaSel || '18'}:${m}`;
    if (onChangeHorario) onChangeHorario(novoHorario);
  };

  return (
    <View style={styles.container}>
      {/* Rótulo superior */}
      <Text style={styles.label}>{label}</Text>

      {/* Caixa do Input */}
      <Pressable
        style={styles.inputBox}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.inputText}>{horarioValue}</Text>
      </Pressable>

      {/* Modal de Seleção de Horário */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Horário</Text>

            <View style={styles.pickersContainer}>
              {/* Coluna das Horas */}
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Hora</Text>
                <FlatList
                  data={HORAS}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.item,
                        item === horaSel && styles.itemSelected,
                      ]}
                      onPress={() => selecionarHora(item)}
                    >
                      <Text
                        style={[
                          styles.itemText,
                          item === horaSel && styles.itemSelectedText,
                        ]}
                      >
                        {item}h
                      </Text>
                    </Pressable>
                  )}
                />
              </View>

              <Text style={styles.separator}>:</Text>

              {/* Coluna dos Minutos */}
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Minuto</Text>
                <FlatList
                  data={MINUTOS}
                  keyExtractor={(item) => item}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.item,
                        item === minSel && styles.itemSelected,
                      ]}
                      onPress={() => selecionarMinuto(item)}
                    >
                      <Text
                        style={[
                          styles.itemText,
                          item === minSel && styles.itemSelectedText,
                        ]}
                      >
                        {item}m
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Confirmar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default HorarioSeletorInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputBox: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#151522',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    height: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickersContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flex: 1,
    height: '100%',
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  separator: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginHorizontal: 12,
  },
  item: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 2,
  },
  itemSelected: {
    backgroundColor: '#FFF0ED',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  itemSelectedText: {
    color: '#FF5733',
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});