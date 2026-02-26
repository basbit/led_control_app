import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useI18n} from '../i18n';

const ModeCard = ({mode, isSelected, onPress}) => {
  const {t} = useI18n();

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.icon}>{mode.icon}</Text>
      <Text style={[styles.name, isSelected && styles.nameSelected]}>
        {t(`modes.${mode.key}`)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    elevation: 3,
    justifyContent: 'center',
    margin: 8,
    minWidth: 100,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardSelected: {
    backgroundColor: '#2a2a3e',
    borderColor: '#6366f1',
    elevation: 6,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  nameSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ModeCard;
