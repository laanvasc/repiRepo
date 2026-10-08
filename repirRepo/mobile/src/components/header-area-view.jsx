import { Fonts } from '@/constants/theme'; // Ajuste o caminho de importação conforme a sua estrutura de pastas
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import '../global.css';

export function HeaderAreaView({ title, subtitle, buttonIcon, onPressButton }) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {buttonIcon && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressButton}
          activeOpacity={0.7}
        >
          {buttonIcon}
        </TouchableOpacity>
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
};

HeaderAreaView.defaultProps = {
  subtitle: undefined,
  buttonIcon: undefined,
  onPressButton: () => {},
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 24,
    
    borderColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
  },
});