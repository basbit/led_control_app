import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useI18n} from '../i18n';

const ConnectionIndicator = ({isConnected, isScanning}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const {t} = useI18n();

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning, pulseAnim]);

  const getStatusText = () => {
    if (isConnected) return t('connection.connected');
    if (isScanning) return t('connection.scanning');
    return t('connection.disconnected');
  };

  const getStatusColor = () => {
    if (isConnected) return '#10b981';
    if (isScanning) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: getStatusColor(),
            transform: [{scale: pulseAnim}],
          },
        ]}
      />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 16,
  },
  indicator: {
    borderRadius: 6,
    height: 12,
    marginRight: 8,
    width: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConnectionIndicator;
