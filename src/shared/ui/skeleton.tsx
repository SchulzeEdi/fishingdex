import { useEffect, useState } from 'react';
import { Animated, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from './theme';
import { radius } from './tokens';
import { useReduceMotion } from './use-reduce-motion';

interface SkeletonProps {
  width?: DimensionValue;
  height: DimensionValue;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

/** Placeholder de carregamento que imita o layout real. Sem pulso se o sistema reduz movimento. */
export function Skeleton({ width = '100%', height, rounded = radius.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const [opacity] = useState(() => new Animated.Value(1));
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: rounded, backgroundColor: colors.surfaceMuted, opacity },
        style,
      ]}
    />
  );
}
