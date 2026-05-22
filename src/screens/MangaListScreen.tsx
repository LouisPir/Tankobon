import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getEntries, deleteEntry, Entry } from '../services/entries';
import { ListType, getListTypeConfig } from '../config/listTypes';

const MangaCard = ({
  entry,
  listType,
  onDelete,
  onPress,
}: {
  entry: Entry;
  listType: ListType;
  onDelete: (id: string) => void;
  onPress: (entry: Entry) => void;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const typeConfig = getListTypeConfig(listType);

  const statusConfig = typeConfig.statusLabelKeys[entry.status];
  const statusLabel = statusConfig ? tr(statusConfig.key, statusConfig.fr) : null;

  const renderProgression = () => {
    if (typeConfig.progressionType === 'none') return null;
    if (typeConfig.progressionType === 'season_episode') {
      return (
        <Text style={styles.cardChapter}>
          {`S${entry.current_season}E${entry.current_chapter}`}
        </Text>
      );
    }
    const progressionLabel = typeConfig.progressionLabelKey
      ? tr(typeConfig.progressionLabelKey, typeConfig.progressionLabelFr ?? '')
      : typeConfig.progressionLabelFr;
    return (
      <Text style={styles.cardChapter}>
        {progressionLabel} {entry.current_chapter}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(entry)}>
      <View style={styles.cardCover}>
        <Text style={styles.cardEmoji}>{typeConfig.icon}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{entry.title.toUpperCase()}</Text>
        {renderProgression()}
        {statusLabel && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{statusLabel.toUpperCase()}</Text>
          </View>
        )}
        {entry.rating && (
          <Text style={styles.cardRating}>{'⭐'.repeat(entry.rating)}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(entry.id)}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const MangaListScreen = ({
  onSelectManga,
  onAddManga,
  onBack,
  onSettings,
  listId,
  listType,
}: {
  listId: string;
  listType: ListType;
  onSelectManga: (entry: Entry) => void;
  onAddManga: () => void;
  onBack: () => void;
  onSettings: () => void;
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filtered, setFiltered] = useState<Entry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const typeConfig = getListTypeConfig(listType);

  const fetchEntries = async () => {
    try {
      const data = await getEntries(listId);
      setEntries(data);
      setFiltered(data);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    setFiltered(
      search.trim() === ''
        ? entries
        : entries.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, entries]);

  const handleDelete = (id: string) => {
    Alert.alert(
      tr('delete', 'Supprimer'),
      tr('manga.delete.confirm', 'Es-tu sûr ?'),
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        {
          text: tr('delete', 'Supprimer'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(id);
              setEntries((prev) => prev.filter((e) => e.id !== id));
            } catch (error: any) {
              Alert.alert(tr('error', 'Erreur'), error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {typeConfig.icon} {tr(typeConfig.labelKey, typeConfig.labelFr)}
        </Text>
        <TouchableOpacity onPress={onSettings}>
          <Text style={{ fontSize: theme.fontSize.xl }}>⚙️</Text>
        </TouchableOpacity>
      </View>

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

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{typeConfig.icon}</Text>
          <Text style={styles.emptyTitle}>
            {search.length > 0
              ? tr('lists.no_results', 'Aucun résultat')
              : tr('manga.empty', 'Aucune entrée pour l\'instant')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search.length > 0
              ? `${tr('lists.no_results_for', 'Pas de résultat pour')} "${search}"`
              : tr('manga.empty.subtitle', 'Ajoute ta première entrée !')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MangaCard
              entry={item}
              listType={listType}
              onDelete={handleDelete}
              onPress={onSelectManga}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddManga}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: theme.spacing.lg, backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.md, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', margin: theme.spacing.lg,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md,
  },
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
  deleteButton: { padding: theme.spacing.sm },
  deleteText: { fontSize: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  emptySubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  fab: {
    position: 'absolute', bottom: 32, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold', lineHeight: 36 },
});