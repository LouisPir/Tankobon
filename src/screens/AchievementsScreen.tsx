import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { computeGrades, GradeResult } from '../services/grades';
import { ACHIEVEMENTS, AchievementCategory, GRADES, TOTAL_POINTS } from '../config/achievements';
import { useAchievementToast } from '../context/AchievementToastContext';

const CATEGORY_LABELS: Record<AchievementCategory, { key: string; fr: string }> = {
  quantity:   { key: 'ach.cat.quantity',   fr: 'Quantité' },
  completion: { key: 'ach.cat.completion', fr: 'Complétion' },
  rating:     { key: 'ach.cat.rating',     fr: 'Notes' },
  lists:      { key: 'ach.cat.lists',      fr: 'Listes' },
  diversity:  { key: 'ach.cat.diversity',  fr: 'Diversité' },
  app:        { key: 'ach.cat.app',        fr: 'App' },
  import_export:{key: 'ach.cat.import_export',        fr: 'Import / Export' },
  social: { key: 'ach.cat.social', fr: 'Social' },
};

export const AchievementsScreen = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAchievements } = useAchievementToast();

  useEffect(() => {
    computeGrades()
      .then((result) => {
        setResult(result);
        if (result.newlyUnlocked.length > 0) {
            showAchievements(result.newlyUnlocked);
        }
      })
      .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = Object.keys(CATEGORY_LABELS) as AchievementCategory[];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('ach.title', 'Achievements')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !result ? null : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

          {/* Grade actuel */}
          <View style={styles.gradeCard}>
            <Text style={styles.gradeIcon}>{result.grade.icon}</Text>
            <Text style={styles.gradeName}>{tr(result.grade.nameKey, result.grade.name)}</Text>
            {(() => {
              const currentGradeIndex = GRADES.findIndex(g => g.name === result.grade.name);
              const nextGrade = GRADES[currentGradeIndex + 1];
              return (
                <Text style={styles.gradePoints}>
                  {result.totalPoints} / {nextGrade?.minPoints ?? TOTAL_POINTS} pts
                </Text>
              );
            })()}
            <View style={styles.progressBarTrack}>
              {(() => {
                const currentGradeIndex = GRADES.findIndex(g => g.name === result.grade.name);
                const nextGrade = GRADES[currentGradeIndex + 1];
                const currentMin = result.grade.minPoints;
                const nextMin = nextGrade?.minPoints ?? TOTAL_POINTS;
                const progress = nextGrade
                  ? (result.totalPoints - currentMin) / (nextMin - currentMin)
                  : 1;
                return <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]} />;
              })()}
            </View>
            <View style={styles.gradesRow}>
              {GRADES.map(g => (
                <Text key={g.name} style={[styles.gradeChip, result.totalPoints >= g.minPoints && styles.gradeChipActive]}>
                  {g.icon}
                </Text>
              ))}
            </View>
          </View>

          {/* Achievements par catégorie */}
          {categories.map(cat => {
            const catAchievements = ACHIEVEMENTS.filter(a => a.category === cat);
            const catLabel = CATEGORY_LABELS[cat];
            return (
              <View key={cat}>
                <Text style={styles.sectionTitle}>{tr(catLabel.key, catLabel.fr)}</Text>
                <View style={styles.card}>
                  {catAchievements.map((ach, index) => {
                    const isUnlocked = result.unlocked.some(u => u.achievement.id === ach.id);
                    return (
                      <View key={ach.id}>
                        <View style={[styles.achRow, !isUnlocked && styles.achRowLocked]}>
                          <Text style={styles.achIcon}>{isUnlocked ? ach.icon : '🔒'}</Text>
                          <View style={styles.achInfo}>
                            <Text style={[styles.achLabel, !isUnlocked && styles.achLabelLocked]}>
                              {isUnlocked ? tr(ach.labelKey, ach.labelFr) : '???'}
                            </Text>
                            <Text style={styles.achDesc}>
                              {isUnlocked ? tr(ach.descriptionKey, ach.descriptionFr) : tr('ach.locked', 'Achievement verrouillé')}
                            </Text>
                          </View>
                          <Text style={[styles.achPoints, !isUnlocked && styles.achPointsLocked]}>
                            {isUnlocked ? `+${ach.points}` : `${ach.points} pts`}
                          </Text>
                        </View>
                        {index < catAchievements.length - 1 && <View style={styles.separator} />}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

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
  gradeCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg,
    alignItems: 'center', gap: theme.spacing.sm,
  },
  gradeIcon: { fontSize: 48 },
  gradeName: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.primary },
  gradePoints: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  progressBarTrack: {
    width: '100%', height: 8, backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.full },
  gradesRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: theme.spacing.xs },
  gradeChip: { fontSize: theme.fontSize.xl, opacity: 0.3 },
  gradeChipActive: { opacity: 1 },
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  achRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  achRowLocked: { opacity: 0.5 },
  achIcon: { fontSize: theme.fontSize.xl },
  achInfo: { flex: 1, gap: 2 },
  achLabel: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  achLabelLocked: { color: theme.colors.textSecondary },
  achDesc: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  achPoints: { fontSize: theme.fontSize.sm, fontWeight: 'bold', color: theme.colors.primary },
  achPointsLocked: { color: theme.colors.textSecondary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
});