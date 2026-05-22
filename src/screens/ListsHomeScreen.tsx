import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getLists, deleteList, List } from '../services/lists';
import { Theme } from '../config/theme';
import { getListTypeConfig } from '../config/listTypes';

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

export const ListsHomeScreen = ({ onSelectList, onAddList, onDeleteProtected, onSettings }: { onSelectList: (list: List) => void; onAddList: () => void; onDeleteProtected: (list: List) => void; onSettings: () => void }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [filtered, setFiltered] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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
    setFiltered(search.trim() === '' ? lists : lists.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())));
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
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder={tr('lists.search', '🔍 Rechercher une liste...')} value={search} onChangeText={setSearch} placeholderTextColor={theme.colors.textSecondary} />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clearSearch}>✕</Text></TouchableOpacity>}
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌸</Text>
          <Text style={styles.emptyTitle}>{search.length > 0 ? tr('lists.no_results', 'Aucun résultat') : tr('lists.empty', 'Aucune liste pour l\'instant')}</Text>
          <Text style={styles.emptySubtitle}>{search.length > 0 ? `${tr('lists.no_results_for', 'Pas de liste pour')} "${search}"` : tr('lists.empty.subtitle', 'Crée ta première liste !')}</Text>
        </View>
      ) : (
        <FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={({ item }) => <ListCard list={item} onPress={onSelectList} onDelete={handleDelete} />} contentContainerStyle={styles.list} />
      )}
      <TouchableOpacity style={styles.fab} onPress={onAddList}><Text style={styles.fabText}>+</Text></TouchableOpacity>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: theme.spacing.lg, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
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
});
