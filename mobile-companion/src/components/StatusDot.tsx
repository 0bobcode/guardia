import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function StatusDot({ color, pulsing }: { color: string; pulsing?: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulsing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulsing, opacity]);

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: color, opacity: pulsing ? opacity : 1 }]}
    />
  );
}

const styles = StyleSheet.create({
  dot: { width: 6, height: 6, borderRadius: 3 },
});
