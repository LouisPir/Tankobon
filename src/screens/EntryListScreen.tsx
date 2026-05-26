import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getEntries, deleteEntry, Entry } from '../services/entries';
import { ListType, getListTypeConfig, EntryStatus } from '../config/listTypes';
import { ThemeBackground } from '../components/ThemeBackground';

type ModalTab = 'filter' | 'sort';
type SortOption = 'title_asc' | 'title_desc' | 'date_newest' | 'date_oldest' | 'rating_asc' | 'rating_desc' | 'progression_asc' | 'progression_desc';

type SavedPrefs = {
  activeStatuses: EntryStatus[];
  activeRating: number | null;
  activeSort: SortOption | null;
};

const EntryCard = ({
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
      return <Text style={styles.cardChapter}>{`S${entry.current_season}E${entry.current_chapter}`}</Text>;
    }
    const progressionLabel = typeConfig.progressionLabelKey
      ? tr(typeConfig.progressionLabelKey, typeConfig.progressionLabelFr ?? '')
      : typeConfig.progressionLabelFr;
    return <Text style={styles.cardChapter}>{progressionLabel} {entry.current_chapter}</Text>;
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
        {entry.rating && <Text style={styles.cardRating}>{'⭐'.repeat(entry.rating)}</Text>}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(entry.id)}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const EntryListScreen = ({
  onSelectEntry,
  onAddEntry,
  onBack,
  onSettings,
  listId,
  listType,
}: {
  listId: string;
  listType: ListType;
  onSelectEntry: (entry: Entry) => void;
  onAddEntry: () => void;
  onBack: () => void;
  onSettings: () => void;
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filtered, setFiltered] = useState<Entry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('filter');

  // Filtres
  const [activeStatuses, setActiveStatuses] = useState<EntryStatus[]>([]);
  const [activeRating, setActiveRating] = useState<number | null>(null);

  // Tri
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);

  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const typeConfig = getListTypeConfig(listType);

  const STORAGE_KEY = `sort_filter_${listId}`;

  // Chargement des préférences sauvegardées
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const prefs: SavedPrefs = JSON.parse(saved);
          setActiveStatuses(prefs.activeStatuses ?? []);
          setActiveRating(prefs.activeRating ?? null);
          setActiveSort(prefs.activeSort ?? null);
        }
      } catch {
        // silencieux — pas bloquant
      } finally {
        setPrefsLoaded(true);
      }
    };
    loadPrefs();
  }, [listId]);

  // Sauvegarde des préférences à chaque changement
  useEffect(() => {
    if (!prefsLoaded) return;
    const savePrefs = async () => {
      try {
        const prefs: SavedPrefs = { activeStatuses, activeRating, activeSort };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch {
        // silencieux — pas bloquant
      }
    };
    savePrefs();
  }, [activeStatuses, activeRating, activeSort, prefsLoaded]);

  const fetchEntries = async () => {
    try {
      const data = await getEntries(listId);
      setEntries(data);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    let result = [...entries];

    if (search.trim()) {
      result = result.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (activeStatuses.length > 0) {
      result = result.filter((e) => activeStatuses.includes(e.status));
    }
    if (activeRating !== null) {
      result = result.filter((e) => e.rating === activeRating);
    }
    if (activeSort) {
      result.sort((a, b) => {
        if (activeSort === 'title_asc') return a.title.localeCompare(b.title);
        if (activeSort === 'title_desc') return b.title.localeCompare(a.title);
        if (activeSort === 'date_newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (activeSort === 'date_oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (activeSort === 'rating_asc') return (a.rating ?? 0) - (b.rating ?? 0);
        if (activeSort === 'rating_desc') return (b.rating ?? 0) - (a.rating ?? 0);
        if (activeSort === 'progression_asc') {
          if (a.current_season !== b.current_season) return a.current_season - b.current_season;
          return a.current_chapter - b.current_chapter;
        }
        if (activeSort === 'progression_desc') {
          if (a.current_season !== b.current_season) return b.current_season - a.current_season;
          return b.current_chapter - a.current_chapter;
        }
        return 0;
      });
    }

    setFiltered(result);
  }, [search, entries, activeStatuses, activeRating, activeSort]);

  const toggleStatus = (status: EntryStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

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

  const handleReset = async () => {
    setActiveStatuses([]);
    setActiveRating(null);
    setActiveSort(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // silencieux
    }
  };

  const hasActiveFilters = activeStatuses.length > 0 || activeRating !== null || activeSort !== null;

  const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: tr('modal.sort.az', 'A → Z'), value: 'title_asc' },
    { label: tr('modal.sort.za', 'Z → A'), value: 'title_desc' },
    { label: tr('modal.sort.newest', 'Plus récent'), value: 'date_newest' },
    { label: tr('modal.sort.oldest', 'Plus ancien'), value: 'date_oldest' },
    { label: tr('modal.sort.rating.desc', 'Mieux noté'), value: 'rating_desc' },
    { label: tr('modal.sort.rating.asc', 'Moins bien noté'), value: 'rating_asc' },
    { label: tr('modal.sort.progression.desc', 'Plus avancé'), value: 'progression_desc' },
    { label: tr('modal.sort.progression.asc', 'Moins avancé'), value: 'progression_asc' },
  ];

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemeBackground />
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
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.filterButtonIcon}>🪄</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>{typeConfig.icon}</Text>
          <Text style={styles.emptyTitle}>
            {search.length > 0 || hasActiveFilters
              ? tr('lists.no_results', 'Aucun résultat')
              : tr('manga.empty', 'Aucune entrée pour l\'instant')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search.length > 0 || hasActiveFilters
              ? tr('lists.no_results_for', 'Aucune entrée ne correspond à ta recherche')
              : tr('manga.empty.subtitle', 'Ajoute ta première entrée !')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              listType={listType}
              onDelete={handleDelete}
              onPress={onSelectEntry}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddEntry}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>

            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'filter' && styles.modalTabActive]}
                onPress={() => setActiveTab('filter')}
              >
                <Text style={[styles.modalTabText, activeTab === 'filter' && styles.modalTabTextActive]}>
                  {tr('modal.filter', 'Filtrer')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'sort' && styles.modalTabActive]}
                onPress={() => setActiveTab('sort')}
              >
                <Text style={[styles.modalTabText, activeTab === 'sort' && styles.modalTabTextActive]}>
                  {tr('modal.sort', 'Trier')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {activeTab === 'filter' && (
                <View style={styles.modalContent}>
                  {typeConfig.statuses.length > 0 && (
                    <>
                      <Text style={styles.modalSectionTitle}>{tr('modal.filter.status', 'Par statut')}</Text>
                      <View style={styles.modalChipsRow}>
                        {typeConfig.statuses.map((s) => {
                          const labelConfig = typeConfig.statusLabelKeys[s];
                          const label = labelConfig ? tr(labelConfig.key, labelConfig.fr) : s;
                          return (
                            <TouchableOpacity
                              key={s}
                              style={[styles.modalChip, activeStatuses.includes(s) && styles.modalChipActive]}
                              onPress={() => toggleStatus(s)}
                            >
                              <Text style={[styles.modalChipLabel, activeStatuses.includes(s) && styles.modalChipLabelActive]}>
                                {label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}

                  <Text style={styles.modalSectionTitle}>{tr('modal.filter.rating', 'Par note')}</Text>
                  <View style={styles.modalChipsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        style={[styles.modalChip, activeRating === star && styles.modalChipActive]}
                        onPress={() => setActiveRating(activeRating === star ? null : star)}
                      >
                        <Text style={styles.modalChipLabel}>{'⭐'.repeat(star)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === 'sort' && (
                <View style={styles.modalContent}>
                  <Text style={styles.modalSectionTitle}>{tr('modal.sort.name', 'Par titre')}</Text>
                  <View style={styles.modalOptionsCol}>
                    {SORT_OPTIONS.slice(0, 2).map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.modalOption, activeSort === opt.value && styles.modalOptionActive]}
                        onPress={() => setActiveSort(activeSort === opt.value ? null : opt.value)}
                      >
                        <Text style={[styles.modalOptionText, activeSort === opt.value && styles.modalOptionTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.modalSectionTitle}>{tr('modal.sort.date', 'Par date d\'ajout')}</Text>
                  <View style={styles.modalOptionsCol}>
                    {SORT_OPTIONS.slice(2, 4).map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.modalOption, activeSort === opt.value && styles.modalOptionActive]}
                        onPress={() => setActiveSort(activeSort === opt.value ? null : opt.value)}
                      >
                        <Text style={[styles.modalOptionText, activeSort === opt.value && styles.modalOptionTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.modalSectionTitle}>{tr('modal.sort.rating', 'Par note')}</Text>
                  <View style={styles.modalOptionsCol}>
                    {SORT_OPTIONS.slice(4, 6).map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.modalOption, activeSort === opt.value && styles.modalOptionActive]}
                        onPress={() => setActiveSort(activeSort === opt.value ? null : opt.value)}
                      >
                        <Text style={[styles.modalOptionText, activeSort === opt.value && styles.modalOptionTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {typeConfig.progressionType !== 'none' && (
                    <>
                      <Text style={styles.modalSectionTitle}>{tr('modal.sort.progression', 'Par progression')}</Text>
                      <View style={styles.modalOptionsCol}>
                        {SORT_OPTIONS.slice(6).map((opt) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={[styles.modalOption, activeSort === opt.value && styles.modalOptionActive]}
                            onPress={() => setActiveSort(activeSort === opt.value ? null : opt.value)}
                          >
                            <Text style={[styles.modalOptionText, activeSort === opt.value && styles.modalOptionTextActive]}>
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}

            </ScrollView>

            <View style={styles.modalActions}>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.modalResetButton} onPress={handleReset}>
                  <Text style={styles.modalResetText}>{tr('modal.reset', 'Réinitialiser')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>{tr('modal.close', 'Fermer')}</Text>
              </TouchableOpacity>
            </View>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.lg, gap: theme.spacing.sm },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  filterButton: { width: 44, height: 44, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  filterButtonActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  filterButtonIcon: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg, gap: theme.spacing.lg, maxHeight: '80%' },
  modalTabs: { flexDirection: 'row', borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.background, padding: 4 },
  modalTab: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  modalTabActive: { backgroundColor: theme.colors.primary },
  modalTabText: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.textSecondary },
  modalTabTextActive: { color: '#fff' },
  modalContent: { gap: theme.spacing.md, paddingBottom: theme.spacing.md },
  modalSectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  modalChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  modalChip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  modalChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  modalChipLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  modalChipLabelActive: { color: theme.colors.primary, fontWeight: '600' },
  modalOptionsCol: { gap: theme.spacing.sm },
  modalOption: { padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
  modalOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  modalOptionText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  modalOptionTextActive: { color: theme.colors.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: theme.spacing.sm },
  modalResetButton: { flex: 1, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  modalResetText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: '600' },
  modalCloseButton: { flex: 1, backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '700' },
});