import { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const OPCOES_DEFAULT = [
  { label: 'Corrida', value: 'corrida' },
  { label: 'Musculação', value: 'musculacao' },
  { label: 'Caminhada', value: 'caminhada' },
  { label: 'Ciclismo', value: 'ciclismo' },
  { label: 'Natação', value: 'natacao' },
];

export function InputCheckboxModalidade({
  label = 'Modalidade',
  opcoes = OPCOES_DEFAULT,
  valorSelecionado,
  onSelectOption,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // Define a opção selecionada atual
  const opcaoAtual =
    opcoes.find((item) => item.value === valorSelecionado) || opcoes[0];

  const handleSelect = (item) => {
    if (onSelectOption) {
      onSelectOption(item.value);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Rótulo superior */}
      <Text style={styles.label}>{label}</Text>

      {/* Campo Select estilo InputText */}
      <Pressable
        style={styles.inputBox}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.inputText}>{opcaoAtual?.label}</Text>

        {/* Seta para baixo */}
        <Text style={styles.arrowIcon}>⌵</Text>
      </Pressable>

      {/* Modal de seleção */}
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
            <Text style={styles.modalTitle}>Selecione a Modalidade</Text>

            <FlatList
              data={opcoes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === opcaoAtual?.value;

                return (
                  <Pressable
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionSelectedText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default InputCheckboxModalidade;

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#151522',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: 320,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  optionSelectedText: {
    color: '#1E293B',
    fontWeight: '800',
  },
});