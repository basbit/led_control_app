import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, PanResponder, Animated, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;
const THUMB_SIZE = 24;

const Slider = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  onValueChange,
  label,
  unit = '',
  step = 1,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const pan = useRef(new Animated.Value(0)).current;

  const getValueFromPosition = x => {
    const ratio = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
    const newValue = minimumValue + ratio * (maximumValue - minimumValue);
    return Math.round(newValue / step) * step;
  };

  const getPositionFromValue = val => {
    const ratio = (val - minimumValue) / (maximumValue - minimumValue);
    return ratio * SLIDER_WIDTH;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const {locationX} = evt.nativeEvent;
        const newValue = getValueFromPosition(locationX);
        setCurrentValue(newValue);
        pan.setValue(getPositionFromValue(newValue));
        onValueChange(newValue);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = Math.max(0, Math.min(SLIDER_WIDTH, gestureState.moveX - 40));
        const newValue = getValueFromPosition(newX);
        setCurrentValue(newValue);
        pan.setValue(newX);
        onValueChange(newValue);
      },
    }),
  ).current;

  const position = getPositionFromValue(currentValue);
  const percentage = ((currentValue - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {currentValue}
          {unit}
        </Text>
      </View>
      <View style={styles.sliderContainer} {...panResponder.panHandlers}>
        <View style={styles.track}>
          <View
            style={[
              styles.trackFill,
              {
                width: `${percentage}%`,
              },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            {
              left: position - THUMB_SIZE / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    backgroundColor: '#fff',
    borderColor: '#6366f1',
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    elevation: 5,
    height: THUMB_SIZE,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: THUMB_SIZE,
  },
  track: {
    backgroundColor: '#2a2a3e',
    borderRadius: 3,
    height: 6,
    overflow: 'hidden',
  },
  trackFill: {
    backgroundColor: '#6366f1',
    borderRadius: 3,
    height: '100%',
  },
  value: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Slider;
