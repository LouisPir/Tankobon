import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Particle = {
  id: number;
  x: number;
  emoji: string;
  duration: number;
  delay: number;
  size: number;
};

const THEME_CONFIG: Record<string, { emoji: string; count: number; direction: 'down' | 'up' | 'blink' }> = {
  sakura: { emoji: '🌸', count: 10, direction: 'down' },
  ninja:  { emoji: '💧', count: 6,  direction: 'down' },
  spicy:  { emoji: '🔥', count: 8,  direction: 'up'   },
  night:  { emoji: '✨', count: 15, direction: 'blink' },
};

const generateParticles = (count: number, emoji: string): Particle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * (SCREEN_WIDTH - 40),
    emoji,
    duration: 4000 + Math.random() * 4000,
    delay: Math.random() * 4000,
    size: 16 + Math.random() * 10,
  }));

const FallingParticle = ({ particle }: { particle: Particle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, SCREEN_HEIGHT + 50],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: particle.x, fontSize: particle.size, transform: [{ translateY }, { rotate }] },
      ]}
    >
      {particle.emoji}
    </Animated.Text>
  );
};
const FallingWaveParticle = ({ particle }: { particle: Particle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, SCREEN_HEIGHT + 50],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 8, 0, -8, 0],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: particle.x, fontSize: particle.size, transform: [{ translateY }, { translateX }] },
      ]}
    >
      {particle.emoji}
    </Animated.Text>
  );
};

const RisingParticle = ({ particle }: { particle: Particle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: particle.duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT + 50, -50],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 8, 0, -8, 0],
  });

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: particle.x, fontSize: particle.size, transform: [{ translateY }, { translateX }] },
      ]}
    >
      {particle.emoji}
    </Animated.Text>
  );
};

const BlinkingParticle = ({ particle }: { particle: Particle }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(particle.delay),
        Animated.timing(anim, { toValue: 1, duration: particle.duration / 2, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: particle.duration / 2, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.8] });
  const top = particle.delay % SCREEN_HEIGHT;

  return (
    <Animated.Text
      style={[styles.particle, { left: particle.x, top, fontSize: particle.size, opacity }]}
    >
      {particle.emoji}
    </Animated.Text>
  );
};

export const ThemeBackground = () => {
  const { themeName } = useTheme();
  const config = THEME_CONFIG[themeName];
  if (!config) return null;

  const particles = generateParticles(config.count, config.emoji);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) =>
        config.direction === 'down' && themeName === 'ninja' ? (
          <FallingWaveParticle key={p.id} particle={p} />
        ) : config.direction === 'down' ? (
          <FallingParticle key={p.id} particle={p} />
        ) : config.direction === 'up' ? (
          <RisingParticle key={p.id} particle={p} />
        ) : (
          <BlinkingParticle key={p.id} particle={p} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
    opacity: 0.35,
  },
  particle: {
    position: 'absolute',
  },
});