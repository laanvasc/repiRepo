import { Fonts } from '@/constants/theme'; // Ajuste o caminho de importação conforme a sua estrutura de pastas
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import '../global.css';

export function HeaderAreaView({ 
  title, 
  subtitle, 
  buttonIcon, 
  onPressButton, 
  showBackButton = false, 
  onPressBack 
}) {
  const handleBack = () => {
    if (onPressBack) {
      onPressBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {buttonIcon && (
        onPressButton ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onPressButton}
            activeOpacity={0.7}
          >
            {buttonIcon}
          </TouchableOpacity>
        ) : (
          <View style={styles.iconContainer}>
            {buttonIcon}
          </View>
        )
      )}
    </View>
  );
}

export default HeaderAreaView;

// Validação das props
HeaderAreaView.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  buttonIcon: PropTypes.node,
  onPressButton: PropTypes.func,
  showBackButton: PropTypes.bool,
  onPressBack: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    width: '100%',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: Fonts.bold, // Aplica Inter_700Bold
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.sans, // Aplica Inter_400Regular
    fontSize: 13,
    color: '#4B5563',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});