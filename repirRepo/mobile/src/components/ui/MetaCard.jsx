import React from 'react';
import { View, ActivityIndicator, Pressable, StyleSheet, Text, Image } from 'react-native';

export default function MetaCard({
    tituloMeta = 'Fazer 3 atividades',
    categoriaMeta,
    onPress,
    isLoading = false,
    disabled = false,
    variante = 'test',
    iconeMeta,
}) {
    return (
        <Pressable 
            onPress={onPress}
            disabled={disabled || isLoading}
            style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            {/* Ícone Circular da Esquerda */}
            <View style={styles.iconContainer}>
                <Image 
                    source={iconeMeta || require('../assets/mascote/pose1-mascot1.svg')} 
                    style={styles.iconImage}
                    resizeMode="contain"
                />
            </View>

            {/* Conteúdo / Título */}
            <View style={styles.contentContainer}>
                {isLoading ? (
                    <ActivityIndicator color="#1C1C1E" />
                ) : (
                    <Text style={styles.titleText}>{tituloMeta}</Text>
                )}
            </View>

            {/* Ícone de Checkmark (V) à direita */}
            <View style={styles.checkContainer}>
                <Text style={styles.checkIcon}>✓</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        height: 72,
        backgroundColor: '#D2F500',
        borderRadius: 36,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconImage: {
        width: 36,
        height: 36,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    checkContainer: {
        paddingRight: 12,
    },
    checkIcon: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});