import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function Trofeu({
  tituloTrofeu,
  variante = 'bronzeVerde',
  disabled = false,
  isLoading = false,
  iconeTrofeu = null, // Prop opcional
}) {
  return (
    <View
      style={[
        styles.baseTrofeu,
        styles[`${variante}Trofeu`],
        disabled && styles.disabledTrofeu,
      ]}
    >
      <Image
        source={iconeTrofeu || require('../assets/trofeus/trofeu3 1.png')}
        style={[styles.trofeuIcon, disabled && styles.disabledIcon]}
        resizeMode="contain"
      />

      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.baseText, disabled && styles.disabledText]}>
          {tituloTrofeu}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  baseTrofeu: {
    width: 160,
    height: 160,
    backgroundColor: '#FF5252',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  disabledTrofeu: {
    backgroundColor: '#FFA8A8',
    borderStyle: 'dashed',
    borderColor: '#FF5252',
  },

  trofeuIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },

  disabledIcon: {
    opacity: 0.6,
  },

  baseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  disabledText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
});