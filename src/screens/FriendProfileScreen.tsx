import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { ACHIEVEMENTS, GRADES, getGrade } from '../config/achievements';
import { Friend, getFriendStats, getFriendAchievements, getFriendFriendCount, FriendStats } from '../services/friends';

export const FriendProfileScreen = ({ onBack, friend }: {
  onBack: () => void;
  friend: Friend;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  
const [friendCount, setFriendCount] = useState(0);
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<FriendStats | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFriendStats(friend.id), getFriendAchievements(friend.id), getFriendFriendCount(friend.id)])
      .then(([s, a, fc]) => {
        setStats(s);
        setUnlockedIds(a ?? []);
        setFriendCount(fc);
      })
      .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
      .finally(() => setLoading(false));
  }, []);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  const grade = getGrade(totalPoints);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{friend.username ?? '?'}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

          {/* Avatar + username */}
          <View style={styles.avatarSection}>
            {friend.avatar ? (
              <Image source={{ uri: friend.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>?</Text>
              </View>
            )}
            <Text style={styles.username}>{friend.username ?? '?'}</Text>
          </View>

          {/* Grade */}
          <Text style={styles.sectionTitle}>{tr('profile.grade', 'Grade')}</Text>
          <View style={[styles.card, styles.gradeRow]}>
            <Text style={styles.gradeIcon}>{grade.icon}</Text>
            <View>
              <Text style={styles.gradeName}>{tr(grade.nameKey, grade.name)}</Text>
              <Text style={styles.gradePoints}>{totalPoints} pts</Text>
            </View>
          </View>

          {/* Stats */}
          {stats && (
            <>
              <Text style={styles.sectionTitle}>{tr('stats.global', 'Vue globale')}</Text>
              <View style={styles.row3}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalLists}</Text>
                  <Text style={styles.statLabel}>{tr('stats.lists', 'Listes')}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalEntries}</Text>
                  <Text style={styles.statLabel}>{tr('stats.entries', 'Entrées')}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{friendCount}</Text>
                  <Text style={styles.statLabel}>{tr('friends.title', 'Amis')}</Text>
                </View>
              </View>
            </>
          )}

          {/* Achievements débloqués */}
          {unlockedAchievements.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{tr('ach.title', 'Achievements')} ({unlockedAchievements.length})</Text>
              <View style={styles.card}>
                {unlockedAchievements.map((ach, index) => (
                  <View key={ach.id}>
                    <View style={styles.achRow}>
                      <Text style={styles.achIcon}>{ach.icon}</Text>
                      <View style={styles.achInfo}>
                        <Text style={styles.achLabel}>{tr(ach.labelKey, ach.labelFr)}</Text>
                        <Text style={styles.achDesc}>{tr(ach.descriptionKey, ach.descriptionFr)}</Text>
                      </View>
                      <Text style={styles.achPoints}>+{ach.points}</Text>
                    </View>
                    {index < unlockedAchievements.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: theme.spacing.lg, backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  avatarSection: { alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: theme.colors.primary },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.surface,
    borderWidth: 3, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarPlaceholderText: { fontSize: 40, color: theme.colors.textSecondary },
  username: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md },
  gradeIcon: { fontSize: 40 },
  gradeName: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.primary },
  gradePoints: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  row3: { flexDirection: 'row', gap: theme.spacing.sm },
  statCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border,
  },
  statValue: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.primary },
  statLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  achRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  achIcon: { fontSize: theme.fontSize.xl },
  achInfo: { flex: 1, gap: 2 },
  achLabel: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  achDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  achPoints: { fontSize: theme.fontSize.sm, fontWeight: 'bold', color: theme.colors.primary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
});