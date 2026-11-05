import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function CardAtividade({
  titulo = 'Atividade',
  icone = require('@/components/assets/mascote/pose1-mascot1.svg'),
  diasSemana = {
    seg: false,
    ter: false,
    qua: false,
    qui: false,
    sex: false,
    sab: false,
    dom: false,
  },
  onPress,
}) {
  const [expandido, setExpandido] = useState(false);

  const dias = [
    { key: 'seg', label: 'Seg', ativo: diasSemana.seg },
    { key: 'ter', label: 'Ter', ativo: diasSemana.ter },
    { key: 'qua', label: 'Qua', ativo: diasSemana.qua },
    { key: 'qui', label: 'Qui', ativo: diasSemana.qui },
    { key: 'sex', label: 'Sex', ativo: diasSemana.sex },
    { key: 'sab', label: 'Sab', ativo: diasSemana.sab },
    { key: 'dom', label: 'Dom', ativo: diasSemana.dom },
  ];

  return (
    <Pressable
      onPress={() => {
        setExpandido(!expandido);
        if (onPress) onPress();
      }}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Image source={icone} contentFit="contain" style={styles.icon} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.titulo} numberOfLines={1}>
            {titulo}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{expandido ? '∧' : '∨'}</Text>
        </View>
      </View>

      {expandido && (
        <View style={styles.diasContainer}>
          {dias.map((dia) => (
            <View
              key={dia.key}
              style={[
                styles.diaPill,
                dia.ativo ? styles.diaAtivo : styles.diaInativo,
              ]}
            >
              <Text
                style={[
                  styles.diaText,
                  dia.ativo ? styles.diaTextAtivo : styles.diaTextInativo,
                ]}
              >
                {dia.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

export default CardAtividade;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#D2F522',
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    width: 32,
    height: 32,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#151522',
  },
  statusContainer: {
    marginLeft: 12,
    paddingRight: 6,
  },
  statusIcon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#151522',
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  diaPill: {
    width: 36,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  diaAtivo: {
    backgroundColor: '#FFFFFF',
  },
  diaInativo: {
    backgroundColor: 'transparent',
  },
  diaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  diaTextAtivo: {
    color: '#151522',
  },
  diaTextInativo: {
    color: 'rgba(21, 21, 34, 0.4)',
  },
});