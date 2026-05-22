import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getLists, deleteList, List } from '../services/lists';
import { Theme } from '../config/theme';
import { getListTypeConfig, LIST_TYPES, ListType } from '../config/listTypes';

const ListCard = ({ list, onPress, onDelete }: { list: List; onPress: (list: List) => void; onDelete: (id: string) => void }) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const typeConfig = getListTypeConfig(list.type);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(list)}>
      <View style={styles.typeIconContainer}>
        <Text style={styles.typeIcon}>{typeConfig.icon}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{list.name}</Text>
          {list.password_hash && <Text style={styles.lockIcon}>🔒</Text>}
        </View>
        {list.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>{list.description}</Text>
        )}
        <Text style={styles.cardDate}>
          {tr('list.created', 'Créée le')} {new Date(list.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(list.id)}>
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

type ModalTab = 'filter' | 'sort';

export const ListsHomeScreen = ({ onSelectList, onAddList, onDeleteProtected, onSettings }: { onSelectList: (list: List) => void; onAddList: () => void; onDeleteProtected: (list: List) => void; onSettings: () => void }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [filtered, setFiltered] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>('filter');
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const fetchLists = async () => {
    try { const data = await getLists(); setLists(data); setFiltered(data); }
    catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLists(); }, []);

  useEffect(() => {
    let result = lists;
    if (search.trim()) result = result.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, lists]);

  const handleDelete = (id: string) => {
    const list = lists.find((l) => l.id === id);
    if (list?.password_hash) { onDeleteProtected(list); return; }
    Alert.alert(tr('delete', 'Supprimer'), tr('lists.delete.confirm', 'Es-tu sûr de vouloir supprimer cette liste et tous ses mangas ?'), [
      { text: tr('cancel', 'Annuler'), style: 'cancel' },
      { text: tr('delete', 'Supprimer'), style: 'destructive', onPress: async () => {
        try { await deleteList(id); setLists((prev) => prev.filter((l) => l.id !== id)); }
        catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
      }},
    ]);
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tr('lists.title', '🌸 Tankobon')}</Text>
        <TouchableOpacity onPress={onSettings}><Text style={{ fontSize: theme.fontSize.xl }}>⚙️</Text></TouchableOpacity>
      </View>

      {/* Barre de recherche + bouton filtre */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={tr('lists.search', '🔍 Rechercher une liste...')}
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
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.filterButtonIcon}>🪄</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌸</Text>
          <Text style={styles.emptyTitle}>
            {search.length > 0
              ? tr('lists.no_results', 'Aucun résultat')
              : tr('lists.empty', 'Aucune liste pour l\'instant')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search.length > 0
              ? tr('lists.no_results_for', 'Aucune liste ne correspond à ta recherche')
              : tr('lists.empty.subtitle', 'Crée ta première liste !')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListCard list={item} onPress={onSelectList} onDelete={handleDelete} />}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddList}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal filtre/tri */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>

            {/* Onglets */}
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

            {/* Contenu Filtrer */}
            {activeTab === 'filter' && (
              <View style={styles.modalContent}>
                <Text style={styles.modalSectionTitle}>{tr('modal.filter.type', 'Par type')}</Text>
                <View style={styles.modalChipsRow}>
                  {Object.values(LIST_TYPES).map((config) => (
                    <TouchableOpacity key={config.type} style={styles.modalChip} disabled>
                      <Text style={styles.modalChipIcon}>{config.icon}</Text>
                      <Text style={styles.modalChipLabel}>{tr(config.labelKey, config.labelFr)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.modalSectionTitle}>{tr('modal.filter.count', 'Par nombre d\'entrées')}</Text>
                <View style={styles.modalOptionsCol}>
                  {['0', '1-10', '10-50', '50+'].map((range) => (
                    <TouchableOpacity key={range} style={styles.modalOption} disabled>
                      <Text style={styles.modalOptionText}>{range}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Contenu Trier */}
            {activeTab === 'sort' && (
              <View style={styles.modalContent}>
                <Text style={styles.modalSectionTitle}>{tr('modal.sort.name', 'Par nom')}</Text>
                <View style={styles.modalOptionsCol}>
                  <TouchableOpacity style={styles.modalOption} disabled>
                    <Text style={styles.modalOptionText}>{tr('modal.sort.az', 'A → Z')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalOption} disabled>
                    <Text style={styles.modalOptionText}>{tr('modal.sort.za', 'Z → A')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSectionTitle}>{tr('modal.sort.date', 'Par date de création')}</Text>
                <View style={styles.modalOptionsCol}>
                  <TouchableOpacity style={styles.modalOption} disabled>
                    <Text style={styles.modalOptionText}>{tr('modal.sort.newest', 'Plus récent')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalOption} disabled>
                    <Text style={styles.modalOptionText}>{tr('modal.sort.oldest', 'Plus ancien')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSectionTitle}>{tr('modal.sort.count', 'Par nombre d\'entrées')}</Text>
                <View style={styles.modalOptionsCol}>
                  <TouchableOpacity style={styles.modalOption} disabled>
                    <Text style={styles.modalOptionText}>{tr('modal.sort.count.asc', 'Croissant')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalOption} disabled>
                    <Text style={styles.modalOptionText}>{tr('modal.sort.count.desc', 'Décroissant')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bouton fermer */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>{tr('modal.close', 'Fermer')}</Text>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  searchInput: { flex: 1, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  list: { padding: theme.spacing.lg, gap: theme.spacing.md },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  cardContent: { flex: 1, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  cardTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  lockIcon: { fontSize: 14 },
  cardDescription: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 18 },
  cardDate: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
  deleteButton: { padding: theme.spacing.sm },
  deleteText: { fontSize: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  emptySubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  fab: { position: 'absolute', bottom: 32, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold', lineHeight: 36 },
  logoutButton: { backgroundColor: theme.colors.accent, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full },
  logoutText: { color: theme.colors.primary, fontSize: theme.fontSize.md, fontWeight: '600' },
  typeIconContainer: {
    width: 44, height: 44, borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  typeIcon: { fontSize: 24 },
  typeFilters: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, gap: theme.spacing.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  typeChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  typeChipIcon: { fontSize: 16 },
  typeChipLabel: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary },
  typeChipLabelActive: { color: theme.colors.primary },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: theme.spacing.lg, marginVertical: theme.spacing.lg, gap: theme.spacing.sm },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  filterButton: { width: 44, height: 44, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  filterButtonIcon: { fontSize: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg, padding: theme.spacing.lg, gap: theme.spacing.lg },
  modalTabs: { flexDirection: 'row', borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.background, padding: 4 },
  modalTab: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  modalTabActive: { backgroundColor: theme.colors.primary },
  modalTabText: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.textSecondary },
  modalTabTextActive: { color: '#fff' },
  modalContent: { gap: theme.spacing.md },
  modalSectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '700', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  modalChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  modalChip: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background, opacity: 0.5 },
  modalChipIcon: { fontSize: 14 },
  modalChipLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  modalOptionsCol: { gap: theme.spacing.sm },
  modalOption: { padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.background, opacity: 0.5 },
  modalOptionText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  modalCloseButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontSize: theme.fontSize.md, fontWeight: '700' },
});
