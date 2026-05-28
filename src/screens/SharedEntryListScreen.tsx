import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getSharedListEntries } from '../services/entries';
import { Entry } from '../services/entries';
import { ListType, getListTypeConfig } from '../config/listTypes';
import { SharedList } from '../services/sharedLists';

export const SharedEntryListScreen = ({ onBack, onSelectEntry, sharedList }: {
  onBack: () => void;
  onSelectEntry: (entry: Entry) => void;
  sharedList: SharedList;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filtered, setFiltered] = useState<Entry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const listType = sharedList.list?.type as ListType ?? 'manga';
  const typeConfig = getListTypeConfig(listType);
  const owner = sharedList.owner as any;

  useEffect(() => {
    getSharedListEntries(sharedList.list_id)
      .then((data) => { setEntries(data); setFiltered(data); })
      .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(entries); return; }
    setFiltered(entries.filter(e => e.title.toLowerCase().includes(search.toLowerCase())));
  }, [search, entries]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{sharedList.list?.name ?? '?'}</Text>
          <Text style={styles.headerSubtitle}>{tr('shared.by', 'Par')} {owner?.username ?? '?'}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={tr('manga.search', '🔍 Rechercher...')}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.colors.textSecondary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{typeConfig.icon}</Text>
          <Text style={styles.emptyTitle}>{tr('manga.empty', 'Aucune entrée pour l\'instant')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const statusConfig = typeConfig.statusLabelKeys[item.status];
            const statusLabel = statusConfig ? tr(statusConfig.key, statusConfig.fr) : null;
            return (
              <TouchableOpacity style={styles.card} onPress={() => onSelectEntry(item)}>
                <View style={styles.cardCover}>
                  <Text style={styles.cardEmoji}>{typeConfig.icon}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title.toUpperCase()}</Text>
                  {typeConfig.progressionType !== 'none' && (
                    <Text style={styles.cardChapter}>
                      {typeConfig.progressionType === 'season_episode'
                        ? `S${item.current_season}E${item.current_chapter}`
                        : `${tr(typeConfig.progressionLabelKey ?? '', typeConfig.progressionLabelFr ?? '')} ${item.current_chapter}`
                      }
                    </Text>
                  )}
                  {statusLabel && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{statusLabel.toUpperCase()}</Text>
                    </View>
                  )}
                  {item.rating && <Text style={styles.cardRating}>{'⭐'.repeat(item.rating)}</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  headerSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.lg },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  searchInput: { flex: 1, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  list: { padding: theme.spacing.lg, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md,
  },
  cardCover: {
    width: 56, height: 80, backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm, justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 28 },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.text },
  cardChapter: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  badge: {
    alignSelf: 'flex-start', borderWidth: 1, borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2, marginTop: 4,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.primary },
  cardRating: { fontSize: theme.fontSize.sm, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
});