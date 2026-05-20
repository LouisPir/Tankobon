import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { theme } from '../config/theme';
import {
  pickJSONFile,
  importListAsNew,
  mergeImportIntoList,
  ImportedList,
  ImportResult,
  DuplicateBehavior,
  List,
  getLists,
} from '../services/lists';

type ImportMode = 'new' | 'merge';

export const ImportListScreen = ({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (result: ImportResult, mode: ImportMode, targetListName: string) => void;
}) => {
  const [importedData, setImportedData] = useState<ImportedList | null>(null);
  const [listName, setListName] = useState('');
  const [mode, setMode] = useState<ImportMode>('new');
  const [existingLists, setExistingLists] = useState<List[]>([]);
  const [filteredLists, setFilteredLists] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listsLoaded, setListsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password gate
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingBehavior, setPendingBehavior] = useState<DuplicateBehavior | null>(null);

  const handlePickFile = async () => {
    try {
      const data = await pickJSONFile();
      if (!data) return;
      setImportedData(data);
      setListName(data.name);

      if (!listsLoaded) {
        const lists = await getLists();
        setExistingLists(lists);
        setFilteredLists(lists);
        setListsLoaded(true);
      }
    } catch {
      Alert.alert('Erreur', 'Fichier invalide ou corrompu');
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFilteredLists(existingLists);
    } else {
      setFilteredLists(
        existingLists.filter((l) =>
          l.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const runMerge = async (behavior: DuplicateBehavior) => {
    if (!importedData || !selectedList) return;
    try {
      const result = await mergeImportIntoList(importedData, selectedList.id, behavior);
      onSuccess(result, 'merge', selectedList.name);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
      setPasswordPending(false);
      setPasswordInput('');
      setPendingBehavior(null);
    }
  };

  const askDuplicateBehavior = () => {
    Alert.alert(
      'Doublons détectés ?',
      'Si des mangas du fichier existent déjà dans la liste, que faire ?',
      [
        { text: 'Ignorer', onPress: () => runMerge('ignore') },
        { text: 'Écraser', style: 'destructive', onPress: () => runMerge('overwrite') },
        { text: 'Annuler', style: 'cancel', onPress: () => setLoading(false) },
      ]
    );
  };

  const handleImport = async () => {
    if (!importedData) return;
    if (mode === 'new' && !listName.trim()) {
      Alert.alert('Erreur', 'Le nom de la liste est requis');
      return;
    }
    if (mode === 'merge' && !selectedList) {
      Alert.alert('Erreur', 'Sélectionne une liste cible');
      return;
    }

    setLoading(true);

    if (mode === 'new') {
      try {
        const result = await importListAsNew(importedData, listName.trim());
        onSuccess(result, 'new', listName.trim());
      } catch (error: any) {
        Alert.alert('Erreur', error.message);
        setLoading(false);
      }
      return;
    }

    // Mode merge : vérification mot de passe si nécessaire
    if (selectedList?.password_hash) {
      setPasswordPending(true);
      setLoading(false);
      return;
    }

    askDuplicateBehavior();
  };

  const handlePasswordConfirm = () => {
    if (!selectedList) return;
    if (passwordInput.trim() !== selectedList.password_hash) {
      Alert.alert('Erreur', 'Mot de passe incorrect');
      return;
    }
    setPasswordPending(false);
    setPasswordInput('');
    setLoading(true);
    askDuplicateBehavior();
  };

  // --- Password gate overlay ---
  if (passwordPending && selectedList) {
    return (
      <SafeAreaView style={styles.passwordOverlay}>
        <View style={styles.passwordCard}>
          <Text style={styles.passwordEmoji}>🔒</Text>
          <Text style={styles.passwordTitle}>Liste protégée</Text>
          <Text style={styles.passwordSubtitle}>
            Entrez le mot de passe pour fusionner dans{' '}
            <Text style={styles.passwordListName}>{selectedList.name}</Text>
          </Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe..."
            placeholderTextColor={theme.colors.textSecondary}
            value={passwordInput}
            onChangeText={setPasswordInput}
            secureTextEntry
            autoFocus
          />
          <TouchableOpacity
            style={styles.passwordConfirmButton}
            onPress={handlePasswordConfirm}
            disabled={!passwordInput.trim()}
          >
            <Text style={styles.passwordConfirmText}>Confirmer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.passwordCancelButton}
            onPress={() => {
              setPasswordPending(false);
              setPasswordInput('');
            }}
          >
            <Text style={styles.passwordCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Écran principal ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Importer une liste</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!importedData ? (
          <View style={styles.pickContainer}>
            <Text style={styles.emoji}>📥</Text>
            <Text style={styles.title}>Importer un fichier JSON</Text>
            <Text style={styles.subtitle}>
              Sélectionne un fichier exporté depuis Tankobon
            </Text>
            <TouchableOpacity style={styles.pickButton} onPress={handlePickFile}>
              <Text style={styles.pickButtonText}>Choisir un fichier</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>✅ Fichier chargé</Text>
            <Text style={styles.previewInfo}>
              {importedData.mangas.length} manga
              {importedData.mangas.length > 1 ? 's' : ''} trouvé
              {importedData.mangas.length > 1 ? 's' : ''}
            </Text>

            {/* Toggle mode */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'new' && styles.modeButtonActive]}
                onPress={() => setMode('new')}
              >
                <Text style={[styles.modeButtonText, mode === 'new' && styles.modeButtonTextActive]}>
                  Nouvelle liste
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'merge' && styles.modeButtonActive]}
                onPress={() => setMode('merge')}
              >
                <Text style={[styles.modeButtonText, mode === 'merge' && styles.modeButtonTextActive]}>
                  Fusionner
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'new' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Nom de la nouvelle liste *</Text>
                <TextInput
                  style={styles.input}
                  value={listName}
                  onChangeText={setListName}
                  placeholder="Nom de la liste..."
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.label}>Fusionner dans *</Text>

                {/* Barre de recherche */}
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

                {filteredLists.length === 0 ? (
                  <Text style={styles.emptyText}>Aucune liste trouvée</Text>
                ) : (
                  filteredLists.map((list) => (
                    <TouchableOpacity
                      key={list.id}
                      style={[
                        styles.listOption,
                        selectedList?.id === list.id && styles.listOptionSelected,
                      ]}
                      onPress={() => setSelectedList(list)}
                    >
                      <Text style={[
                        styles.listOptionText,
                        selectedList?.id === list.id && styles.listOptionTextSelected,
                      ]}>
                        {list.name}
                      </Text>
                      {list.password_hash && (
                        <Text style={styles.lockIcon}>🔒</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.importButton, loading && styles.importButtonDisabled]}
              onPress={handleImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.importButtonText}>
                  {mode === 'new' ? 'Créer la liste 🌸' : 'Fusionner 🌸'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeFileButton} onPress={handlePickFile}>
              <Text style={styles.changeFileText}>Changer de fichier</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  content: { padding: theme.spacing.lg, flexGrow: 1, justifyContent: 'center' },
  pickContainer: { alignItems: 'center', gap: theme.spacing.md },
  emoji: { fontSize: 64 },
  title: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  pickButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  pickButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  previewContainer: { gap: theme.spacing.lg },
  previewTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  previewInfo: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.full,
    padding: 4,
  },
  modeButton: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  modeButtonActive: { backgroundColor: theme.colors.primary },
  modeButtonText: { color: theme.colors.textSecondary, fontWeight: '600' },
  modeButtonTextActive: { color: '#fff' },
  field: { gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  emptyText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
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
  importButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  importButtonDisabled: { opacity: 0.6 },
  importButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  changeFileButton: { alignItems: 'center', padding: theme.spacing.sm },
  changeFileText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },

  // Password overlay
  passwordOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  passwordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  passwordEmoji: { fontSize: 48 },
  passwordTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  passwordSubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  passwordListName: { color: theme.colors.primary, fontWeight: 'bold' },
  passwordInput: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  passwordConfirmButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  passwordConfirmText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  passwordCancelButton: { padding: theme.spacing.sm },
  passwordCancelText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
});