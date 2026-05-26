import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getListTypeConfig, ListType } from '../config/listTypes';
import { List } from '../services/lists';
import { getGlobalStats, getListStats, getProgressionBars, GlobalStats, ListStat, BarData } from '../services/stats';

export const StatsScreen = ({ onBack, selectedList }: {
  onBack: () => void;
  selectedList?: List;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [listStat, setListStat] = useState<ListStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedList) {
      getListStats(selectedList.id, selectedList.name, selectedList.type)
        .then(setListStat)
        .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
        .finally(() => setLoading(false));
    } else {
      getGlobalStats()
        .then(setStats)
        .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
        .finally(() => setLoading(false));
    }
  }, []);

  const renderBarChart = (bars: BarData[], title: string) => {
    const max = Math.max(...bars.map(b => b.count), 1);
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.chartBars}>
          {bars.map((bar) => (
            <View key={bar.label} style={styles.barWrapper}>
              <Text style={styles.barCount}>{bar.count > 0 ? bar.count : ''}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${(bar.count / max) * 100}%` }]} />
              </View>
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderListStat = (list: ListStat, detailed = false) => {
    const config = getListTypeConfig(list.listType);
    return (
      <View key={list.listId}>
        {detailed ? (
          <>
            <View style={styles.row3}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{list.totalEntries}</Text>
                <Text style={styles.statLabel}>{tr('stats.entries', 'Entrées')}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{list.completedEntries}</Text>
                <Text style={styles.statLabel}>{tr('stats.completed', 'Complétés')}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{list.averageRating ?? '—'}</Text>
                <Text style={styles.statLabel}>{tr('stats.avg.rating', 'Moy. note')}</Text>
              </View>
            </View>
            {renderBarChart(list.ratingBars, tr('stats.rating.dist', 'Notes'))}
            {list.progressionBars && renderBarChart(list.progressionBars, tr('stats.progression.dist', 'Progression'))}
          </>
        ) : (
          <View style={styles.listCard}>
            <View style={styles.listCardHeader}>
              <Text style={styles.listCardIcon}>{config.icon}</Text>
              <Text style={styles.listCardName} numberOfLines={1}>{list.listName}</Text>
              <Text style={styles.listCardTotal}>{list.totalEntries} {tr('stats.entries', 'entrées')}</Text>
            </View>
            {list.averageRating !== null && (
              <Text style={styles.listCardRating}>⭐ {tr('stats.avg.rating', 'Note moyenne')} : {list.averageRating}/5</Text>
            )}
            {Object.keys(list.statusBreakdown).length > 0 && (
              <View style={styles.statusRow}>
                {Object.entries(list.statusBreakdown).map(([status, count]) => (
                  <View key={status} style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{count} {status}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedList ? selectedList.name : tr('stats.title', 'Statistiques')}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

          {/* Mode liste unique */}
          {listStat && (
            <>
              <Text style={styles.sectionTitle}>{tr('stats.by.list', 'Statistiques')}</Text>
              {renderListStat(listStat,true)}
              {listStat.totalEntries === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>📊</Text>
                  <Text style={styles.emptyText}>{tr('stats.empty', 'Ajoute des entrées dans tes listes pour voir tes statistiques.')}</Text>
                </View>
              )}
            </>
          )}

          {/* Mode global */}
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
                  <Text style={styles.statValue}>{stats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>{tr('stats.completed', 'Complétés')}</Text>
                </View>
              </View>

              {Object.keys(stats.byType).length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>{tr('stats.by.type', 'Par type')}</Text>
                  <View style={styles.card}>
                    {(Object.entries(stats.byType) as [string, number][]).map(([type, count], index, arr) => {
                      const config = getListTypeConfig(type as ListType);
                      return (
                        <View key={type}>
                          <View style={styles.typeRow}>
                            <Text style={styles.typeIcon}>{config.icon}</Text>
                            <Text style={styles.typeLabel}>{config.labelFr}</Text>
                            <Text style={styles.typeCount}>{count}</Text>
                          </View>
                          {index < arr.length - 1 && <View style={styles.separator} />}
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              {stats.lists.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>{tr('stats.by.list', 'Par liste')}</Text>
                  {stats.lists.map((list) => renderListStat(list))}
                </>
              )}

              {stats.totalEntries === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyEmoji}>📊</Text>
                  <Text style={styles.emptyText}>{tr('stats.empty', 'Ajoute des entrées dans tes listes pour voir tes statistiques.')}</Text>
                </View>
              )}
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
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  row3: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
  statCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border,
  },
  statValue: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.primary },
  statLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  typeIcon: { fontSize: theme.fontSize.lg },
  typeLabel: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  typeCount: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.primary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  listCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  listCardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  listCardIcon: { fontSize: theme.fontSize.lg },
  listCardName: { flex: 1, fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  listCardTotal: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  listCardRating: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  statusBadge: {
    backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  statusBadgeText: { fontSize: theme.fontSize.sm, color: theme.colors.text },
  emptyCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  chartCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  chartTitle: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: theme.spacing.xs },
  barWrapper: { flex: 1, alignItems: 'center', gap: theme.spacing.xs, height: '100%', justifyContent: 'flex-end' },
  barCount: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  barTrack: { width: '100%', flex: 1, justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.sm },
  barLabel: { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
});