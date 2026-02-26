import React, {useState, useRef} from 'react';
import {View, StyleSheet, Dimensions, PanResponder, Animated} from 'react-native';
import {hsvToRgb} from '../utils/colorUtils';

const {width} = Dimensions.get('window');
const PICKER_SIZE = Math.min(width * 0.85, 300);
const CIRCLE_SIZE = 32;
const INNER_RADIUS = PICKER_SIZE * 0.3;

const ColorPicker = ({onColorChange, initialColor = {h: 0, s: 100, v: 100}}) => {
  const [hsv, setHsv] = useState(initialColor);

  const getColorFromPosition = (x, y) => {
    const centerX = PICKER_SIZE / 2;
    const centerY = PICKER_SIZE / 2;
    const maxRadius = PICKER_SIZE / 2 - CIRCLE_SIZE / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const hue = (angle + 360) % 360;
    
    const normalizedDistance = Math.max(0, Math.min(1, (distance - INNER_RADIUS / 2) / (maxRadius - INNER_RADIUS / 2)));
    const saturation = normalizedDistance * 100;

    return {h: hue, s: saturation, v: hsv.v};
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        const newColor = getColorFromPosition(locationX, locationY);
        setHsv(newColor);
        const rgb = hsvToRgb(newColor.h, newColor.s, newColor.v);
        onColorChange({...newColor, ...rgb});
      },
      onPanResponderMove: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        const newColor = getColorFromPosition(locationX, locationY);
        setHsv(newColor);
        const rgb = hsvToRgb(newColor.h, newColor.s, newColor.v);
        onColorChange({...newColor, ...rgb});
      },
    }),
  ).current;

  const renderColorWheel = () => {
    const segments = [];
    const numSegments = 60;
    const centerX = PICKER_SIZE / 2;
    const centerY = PICKER_SIZE / 2;
    const outerRadius = PICKER_SIZE / 2;
    const innerRadius = INNER_RADIUS / 2;
    const numRings = 30;

    for (let ring = 0; ring < numRings; ring++) {
      const ringRadius = innerRadius + (ring / numRings) * (outerRadius - innerRadius);
      const nextRingRadius = innerRadius + ((ring + 1) / numRings) * (outerRadius - innerRadius);
      const saturation = (ring / numRings) * 100;

      for (let i = 0; i < numSegments; i++) {
        const angle1 = (i * 360) / numSegments;
        const angle2 = ((i + 1) * 360) / numSegments;
        const angleRad1 = (angle1 * Math.PI) / 180;
        const angleRad2 = (angle2 * Math.PI) / 180;

        const rgb = hsvToRgb(angle1, saturation, 100);

        const x1 = centerX + ringRadius * Math.cos(angleRad1);
        const y1 = centerY + ringRadius * Math.sin(angleRad1);
        const x2 = centerX + nextRingRadius * Math.cos(angleRad1);
        const y2 = centerY + nextRingRadius * Math.sin(angleRad1);
        const x3 = centerX + nextRingRadius * Math.cos(angleRad2);
        const y3 = centerY + nextRingRadius * Math.sin(angleRad2);
        const x4 = centerX + ringRadius * Math.cos(angleRad2);
        const y4 = centerY + ringRadius * Math.sin(angleRad2);

        const minX = Math.min(x1, x2, x3, x4);
        const minY = Math.min(y1, y2, y3, y4);
        const maxX = Math.max(x1, x2, x3, x4);
        const maxY = Math.max(y1, y2, y3, y4);

        segments.push(
          <View
            key={`ring-${ring}-seg-${i}`}
            style={[
              styles.segment,
              {
                backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                left: minX,
                top: minY,
                width: maxX - minX,
                height: maxY - minY,
              },
            ]}
          />,
        );
      }
    }

    return segments;
  };

  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const centerX = PICKER_SIZE / 2;
  const centerY = PICKER_SIZE / 2;
  const maxRadius = PICKER_SIZE / 2 - CIRCLE_SIZE / 2;
  const radius = (hsv.s / 100) * maxRadius;
  const angle = (hsv.h * Math.PI) / 180;
  const pickerX = centerX + radius * Math.cos(angle) - CIRCLE_SIZE / 2;
  const pickerY = centerY + radius * Math.sin(angle) - CIRCLE_SIZE / 2;

  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer} {...panResponder.panHandlers} collapsable={false}>
        <View style={styles.wheel}>{renderColorWheel()}</View>
        <View
          style={[
            styles.centerCircle,
            {
              backgroundColor: `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.picker,
            {
              left: pickerX,
              top: pickerY,
              backgroundColor: `rgb(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b})`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerCircle: {
    borderColor: '#fff',
    borderRadius: (PICKER_SIZE * 0.3) / 2,
    borderWidth: 3,
    height: PICKER_SIZE * 0.3,
    left: PICKER_SIZE * 0.35,
    position: 'absolute',
    top: PICKER_SIZE * 0.35,
    width: PICKER_SIZE * 0.3,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    borderColor: '#fff',
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    elevation: 5,
    height: CIRCLE_SIZE,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: CIRCLE_SIZE,
  },
  segment: {
    position: 'absolute',
  },
  wheel: {
    borderRadius: PICKER_SIZE / 2,
    height: PICKER_SIZE,
    overflow: 'hidden',
    width: PICKER_SIZE,
  },
  wheelContainer: {
    borderRadius: PICKER_SIZE / 2,
    height: PICKER_SIZE,
    overflow: 'hidden',
    position: 'relative',
    width: PICKER_SIZE,
  },
});

export default ColorPicker;
