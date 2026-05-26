import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../config/theme';
import { Achievement } from '../config/achievements';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  achievement: Achievement | null;
  onHide: () => void;
};

export const AchievementToast = ({ achievement, onHide }: Props) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const anim = useRef(new Animated.Value(-120)).current;
  const { tr } = useLanguage();

  useEffect(() => {
    if (!achievement) return;

    Animated.sequence([
      Animated.spring(anim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.delay(3000),
      Animated.timing(anim, { toValue: -120, duration: 400, useNativeDriver: true }),
    ]).start(() => onHide());
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: anim }] }]}>
      <Text style={styles.icon}>{achievement.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{tr('ach.toast.title', 'Achievement débloqué !')}</Text>
        <Text style={styles.label}>{tr(achievement.labelKey, achievement.labelFr)}</Text>
      </View>
      <Text style={styles.points}>+{achievement.points} pts</Text>
    </Animated.View>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: { fontSize: 28 },
  textContainer: { flex: 1 },
  title: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600' },
  label: { fontSize: theme.fontSize.md, color: theme.colors.text, fontWeight: 'bold' },
  points: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.primary },
});