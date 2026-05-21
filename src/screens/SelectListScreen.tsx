import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getLists, List } from '../services/lists';

export const SelectListScreen = ({ onBack, onSelectList }: { onBack: () => void; onSelectList: (list: List) => void }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [filtered, setFiltered] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  useEffect(() => {
    const fetchLists = async () => {
      try { const data = await getLists(); setLists(data); setFiltered(data); }
      catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
      finally { setLoading(false); }
    };
    fetchLists();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setFiltered(text.trim() === '' ? lists : lists.filter((l) => l.name.toLowerCase().includes(text.toLowerCase())));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('import.select.title', 'Modifier une liste')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder={tr('lists.search', '🔍 Rechercher une liste...')} placeholderTextColor={theme.colors.textSecondary} value={search} onChangeText={handleSearch} />
          {search.length > 0 && <TouchableOpacity onPress={() => handleSearch('')}><Text style={styles.clearSearch}>✕</Text></TouchableOpacity>}
        </View>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.lg }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: theme.spacing.sm }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listOption} onPress={() => onSelectList(item)}>
                <Text style={styles.listOptionText}>{item.name}</Text>
                {item.password_hash && <Text style={styles.lockIcon}>🔒</Text>}
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>{tr('import.select.empty', 'Aucune liste trouvée')}</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  searchInput: { flex: 1, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  listOption: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: theme.spacing.sm },
  listOptionText: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  lockIcon: { fontSize: 14 },
  arrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  emptyText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, textAlign: 'center' },
});
