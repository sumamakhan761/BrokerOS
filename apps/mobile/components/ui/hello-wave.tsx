import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface HelloWaveProps {
  size?: number;
}

export function HelloWave({ size = 28 }: HelloWaveProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 150 }),
        withTiming(-10, { duration: 150 }),
        withTiming(15, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      3 // Wave 3 times
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: size,
          lineHeight: size * 1.15,
          textAlignVertical: 'center',
          includeFontPadding: false,
        },
        animatedStyle,
      ]}
    >
      👋
    </Animated.Text>
  );
}
