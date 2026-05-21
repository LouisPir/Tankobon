import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getLists, exportListToJSON, List } from '../services/lists';
import { Theme } from '../config/theme';

export const ExportListScreen = ({
  onBack,
  preselectedList,
}: {
  onBack: () => void;
  preselectedList?: List;
}) => {
  const [lists, setLists] = useState<List[]>([]);
  const [filtered, setFiltered] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [selectedList, setSelectedList] = useState<List | null>(preselectedList ?? null);
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(!preselectedList);
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  useEffect(() => {
    if (preselectedList) return;
    const fetchLists = async () => {
      try {
        const data = await getLists();
        setLists(data);
        setFiltered(data);
      } catch (error: any) {
        Alert.alert('Erreur', error.message);
      } finally {
        setListsLoading(false);
      }
    };
    fetchLists();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setFiltered(
      text.trim() === ''
        ? lists
        : lists.filter((l) => l.name.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleExport = async () => {
    if (!selectedList) return;
    try {
      setLoading(true);
      await exportListToJSON(selectedList.id);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exporter une liste</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {preselectedList ? (
          <View style={styles.preselectedCard}>
            <Text style={styles.preselectedLabel}>Liste sélectionnée</Text>
            <Text style={styles.preselectedName}>{preselectedList.name}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Choisir une liste *</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Rechercher une liste..."
                placeholderTextColor={theme.colors.textSecondary}
                value={search}
                onChangeText={handleSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {listsLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listOption,
                      selectedList?.id === item.id && styles.listOptionSelected,
                    ]}
                    onPress={() => setSelectedList(item)}
                  >
                    <Text style={[
                      styles.listOptionText,
                      selectedList?.id === item.id && styles.listOptionTextSelected,
                    ]}>
                      {item.name}
                    </Text>
                    {item.password_hash && <Text style={styles.lockIcon}>🔒</Text>}
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ gap: theme.spacing.sm }}
              />
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.exportButton, (!selectedList || loading) && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={!selectedList || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exportButtonText}>Exporter 📤</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: { flex: 1, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  listOption: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listOptionSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  listOptionText: { color: theme.colors.text, fontSize: theme.fontSize.md, flex: 1 },
  listOptionTextSelected: { color: theme.colors.primary, fontWeight: '600' },
  lockIcon: { fontSize: 14 },
  preselectedCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  preselectedLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  preselectedName: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.primary },
  exportButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: 'auto',
  },
  exportButtonDisabled: { opacity: 0.6 },
  exportButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});