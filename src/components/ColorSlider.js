import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, PanResponder, Animated, Dimensions} from 'react-native';
import {hsvToRgb} from '../utils/colorUtils';
import {useI18n} from '../i18n';

const {width} = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;
const THUMB_SIZE = 28;
const SLIDER_HEIGHT = 50;

const ColorSlider = ({onColorChange, initialColor = {h: 0, s: 100, v: 100}}) => {
  const [hue, setHue] = useState(initialColor.h || 0);
  const pan = useRef(new Animated.Value((hue / 360) * SLIDER_WIDTH)).current;
  const {t} = useI18n();

  const getHueFromPosition = x => {
    const ratio = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
    return Math.round(ratio * 360);
  };

  const getPositionFromHue = h => {
    return (h / 360) * SLIDER_WIDTH;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: evt => {
        const {locationX} = evt.nativeEvent;
        const newHue = getHueFromPosition(locationX);
        setHue(newHue);
        pan.setValue(locationX);
        const rgb = hsvToRgb(newHue, 100, 100);
        onColorChange({h: newHue, s: 100, v: 100, ...rgb});
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          const newX = Math.max(0, Math.min(SLIDER_WIDTH, gestureState.moveX - 40));
          const newHue = getHueFromPosition(newX);
          setHue(newHue);
          pan.setValue(newX);
          const rgb = hsvToRgb(newHue, 100, 100);
          onColorChange({h: newHue, s: 100, v: 100, ...rgb});
        }
      },
      onPanResponderRelease: () => {
      },
    }),
  ).current;

  const renderGradient = () => {
    const segments = [];
    const numSegments = 60;

    for (let i = 0; i < numSegments; i++) {
      const hue1 = (i * 360) / numSegments;
      const rgb1 = hsvToRgb(hue1, 100, 100);

      segments.push(
        <View
          key={i}
          style={[
            styles.gradientSegment,
            {
              left: (i / numSegments) * SLIDER_WIDTH,
              width: SLIDER_WIDTH / numSegments,
              backgroundColor: `rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b})`,
            },
          ]}
        />,
      );
    }

    return segments;
  };

  const currentRgb = hsvToRgb(hue, 100, 100);
  const position = getPositionFromHue(hue);

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer} {...panResponder.panHandlers}>
        <View style={styles.gradientContainer}>{renderGradient()}</View>
        <Animated.View
          style={[
            styles.thumb,
            {
              left: position - THUMB_SIZE / 2,
              backgroundColor: `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`,
            },
          ]}
        />
      </View>
      <Text style={styles.colorText}>
        {t('colorSlider.rgbLabel')}: {currentRgb.r}, {currentRgb.g}, {currentRgb.b}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  colorText: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  container: {
    padding: 20,
  },
  gradientContainer: {
    flexDirection: 'row',
    height: SLIDER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientSegment: {
    height: '100%',
    position: 'absolute',
  },
  sliderContainer: {
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    borderColor: '#fff',
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
});

export default ColorSlider;
