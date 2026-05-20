import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { theme } from '../config/theme';
import { ImportResult } from '../services/lists';

type ImportMode = 'new' | 'merge';

export const ImportResultScreen = ({
  result,
  mode,
  targetListName,
  onDone,
}: {
  result: ImportResult;
  mode: ImportMode;
  targetListName: string;
  onDone: () => void;
}) => {
  const ignoredCount = result.duplicates.length - result.overwritten.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.title}>Import terminé !</Text>
        <Text style={styles.subtitle}>
          {mode === 'new'
            ? `Nouvelle liste "${targetListName}" créée`
            : `Fusionné dans "${targetListName}"`}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {result.added.length + result.duplicates.length}
            </Text>
            <Text style={styles.statLabel}>Traités</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: theme.colors.success }]}>
              {result.added.length}
            </Text>
            <Text style={styles.statLabel}>Ajoutés</Text>
          </View>
          {result.overwritten.length > 0 && (
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#F5A623' }]}>
                {result.overwritten.length}
              </Text>
              <Text style={styles.statLabel}>Écrasés</Text>
            </View>
          )}
          {ignoredCount > 0 && (
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: theme.colors.textSecondary }]}>
                {ignoredCount}
              </Text>
              <Text style={styles.statLabel}>Ignorés</Text>
            </View>
          )}
        </View>

        {result.duplicates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⚠️ Doublons ({result.duplicates.length})
            </Text>
            {result.duplicates.map((title) => (
              <View key={title} style={styles.duplicateRow}>
                <Text style={styles.duplicateTitle} numberOfLines={1}>{title}</Text>
                <Text style={[
                  styles.badge,
                  result.overwritten.includes(title)
                    ? styles.badgeOverwritten
                    : styles.badgeIgnored,
                ]}>
                  {result.overwritten.includes(title) ? 'Écrasé' : 'Ignoré'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {result.added.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ✅ Ajoutés ({result.added.length})
            </Text>
            {result.added.map((title) => (
              <View key={title} style={styles.addedRow}>
                <Text style={styles.addedTitle} numberOfLines={1}>{title}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneButtonText}>Retour aux listes 🌸</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    alignItems: 'center',
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  section: { width: '100%', gap: theme.spacing.sm },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  duplicateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  duplicateTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    flex: 1,
  },
  badge: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  badgeOverwritten: { backgroundColor: '#FEF3C7', color: '#92400E' },
  badgeIgnored: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.textSecondary,
  },
  addedRow: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addedTitle: { color: theme.colors.text, fontSize: theme.fontSize.md },
  doneButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
});