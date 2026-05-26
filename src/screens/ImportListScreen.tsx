import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import {
  pickAndParseJSONFile, importListAsNew, importAllListsFromJSON,
  isMultiListFile, mergeImportIntoList, ImportedList, ImportResult,
  DuplicateBehavior, List, getLists,
} from '../services/lists';

type ImportMode = 'new' | 'merge';
type Step = 'mode' | 'file' | 'confirm';

export const ImportListScreen = ({ onBack, onSuccess, preselectedList }: {
  onBack: () => void;
  onSuccess: (result: ImportResult, mode: ImportMode, targetListName: string) => void;
  preselectedList?: List;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const [step, setStep] = useState<Step>(preselectedList ? 'file' : 'mode');
  const [mode, setMode] = useState<ImportMode>(preselectedList ? 'merge' : 'new');
  const [importedData, setImportedData] = useState<ImportedList | null>(null);
  const [listName, setListName] = useState('');
  const [existingLists, setExistingLists] = useState<List[]>([]);
  const [filteredLists, setFilteredLists] = useState<List[]>([]);
  const [search, setSearch] = useState('');
  const [selectedList, setSelectedList] = useState<List | null>(preselectedList ?? null);
  const [listsLoaded, setListsLoaded] = useState(!!preselectedList);
  const [loading, setLoading] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const handleSelectMode = async (selectedMode: ImportMode) => {
    setMode(selectedMode);
    if (selectedMode === 'merge' && !listsLoaded) {
      const lists = await getLists();
      setExistingLists(lists); setFilteredLists(lists); setListsLoaded(true);
    }
    setStep('file');
  };

  const handlePickFile = async () => {
    try {
      const parsed = await pickAndParseJSONFile();
      if (!parsed) return;

      if (isMultiListFile(parsed)) {
        Alert.alert(
          `${parsed.lists.length} ${tr('import.all.detected', 'liste(s) détectée(s)')}`,
          tr('import.all.message', 'Ce fichier contient plusieurs listes. Elles seront toutes importées comme nouvelles listes.'),
          [
            { text: tr('cancel', 'Annuler'), style: 'cancel' },
            { text: tr('import.all.button', 'Importer tout'), onPress: async () => {
              try {
                const count = await importAllListsFromJSON(parsed);
                onSuccess({ added: parsed.lists.map((l: any) => l.name), duplicates: [], overwritten: [] }, 'new', `${count} ${tr('import.all.detected', 'liste(s) importée(s)')}`);
              } catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
            }},
          ]
        );
        return;
      }

      setImportedData(parsed as ImportedList);
      setListName(parsed.name);
      if (!listsLoaded) {
        const lists = await getLists();
        setExistingLists(lists); setFilteredLists(lists); setListsLoaded(true);
      }
      setStep('confirm');
    } catch {
      Alert.alert(tr('error', 'Erreur'), tr('import.invalid', 'Fichier invalide ou corrompu'));
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setFilteredLists(text.trim() === '' ? existingLists : existingLists.filter((l) => l.name.toLowerCase().includes(text.toLowerCase())));
  };

  const runMerge = async (behavior: DuplicateBehavior) => {
    if (!importedData || !selectedList) return;
    try {
      const result = await mergeImportIntoList(importedData, selectedList.id, behavior);
      onSuccess(result, 'merge', selectedList.name);
    } catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
    finally { setLoading(false); setPasswordPending(false); setPasswordInput(''); }
  };

  const askDuplicateBehavior = () => {
    Alert.alert(
      tr('import.duplicates.question', 'Doublons détectés ?'),
      tr('import.duplicates.subtitle', 'Si des entrées du fichier existent déjà dans la liste, que faire ?'),
      [
        { text: tr('import.ignore', 'Ignorer'), onPress: () => runMerge('ignore') },
        { text: tr('import.overwrite', 'Écraser'), style: 'destructive', onPress: () => runMerge('overwrite') },
        { text: tr('cancel', 'Annuler'), style: 'cancel', onPress: () => setLoading(false) },
      ]
    );
  };

  const handleImport = async () => {
    if (!importedData) return;
    if (mode === 'new' && !listName.trim()) { Alert.alert(tr('error', 'Erreur'), tr('import.list.name.required', 'Le nom de la liste est requis')); return; }
    if (mode === 'merge' && !selectedList) { Alert.alert(tr('error', 'Erreur'), tr('import.target.required', 'Sélectionne une liste cible')); return; }
    setLoading(true);
    if (mode === 'new') {
      try { const result = await importListAsNew(importedData, listName.trim()); onSuccess(result, 'new', listName.trim()); }
      catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); setLoading(false); }
      return;
    }
    if (selectedList?.password_hash) { setPasswordPending(true); setLoading(false); return; }
    askDuplicateBehavior();
  };

  const handlePasswordConfirm = () => {
    if (!selectedList) return;
    if (passwordInput.trim() !== selectedList.password_hash) { Alert.alert(tr('error', 'Erreur'), tr('import.password.wrong', 'Mot de passe incorrect')); return; }
    setPasswordPending(false); setPasswordInput(''); setLoading(true);
    askDuplicateBehavior();
  };

  const getBackAction = () => {
    if (step === 'mode') return onBack;
    if (step === 'file') return preselectedList ? onBack : () => setStep('mode');
    if (step === 'confirm') return () => { setImportedData(null); setStep('file'); };
    return onBack;
  };

  if (passwordPending && selectedList) {
    return (
      <SafeAreaView style={styles.passwordOverlay}>
        <View style={styles.passwordCard}>
          <Text style={styles.passwordEmoji}>🔒</Text>
          <Text style={styles.passwordTitle}>{tr('import.password.title', 'Liste protégée')}</Text>
          <Text style={styles.passwordSubtitle}>
            {tr('import.password.subtitle', 'Entrez le mot de passe pour fusionner dans')}{' '}
            <Text style={styles.passwordListName}>{selectedList.name}</Text>
          </Text>
          <TextInput style={styles.passwordInput} placeholder={tr('password.placeholder', 'Mot de passe...')} placeholderTextColor={theme.colors.textSecondary} value={passwordInput} onChangeText={setPasswordInput} secureTextEntry autoFocus />
          <TouchableOpacity style={styles.passwordConfirmButton} onPress={handlePasswordConfirm} disabled={!passwordInput.trim()}>
            <Text style={styles.passwordConfirmText}>{tr('confirm', 'Confirmer')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.passwordCancelButton} onPress={() => { setPasswordPending(false); setPasswordInput(''); }}>
            <Text style={styles.passwordCancelText}>{tr('cancel', 'Annuler')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={getBackAction()}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('import.title', 'Importer une liste')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'mode' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>📥</Text>
            <Text style={styles.title}>{tr('import.how', 'Comment importer ?')}</Text>
            <TouchableOpacity style={styles.modeCard} onPress={() => handleSelectMode('new')}>
              <Text style={styles.modeCardEmoji}>🆕</Text>
              <View style={styles.modeCardText}>
                <Text style={styles.modeCardTitle}>{tr('import.new', 'Nouvelle liste')}</Text>
                <Text style={styles.modeCardSubtitle}>{tr('import.new.subtitle', 'Créer une nouvelle liste depuis le fichier')}</Text>
              </View>
              <Text style={styles.modeCardArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modeCard} onPress={() => handleSelectMode('merge')}>
              <Text style={styles.modeCardEmoji}>🔀</Text>
              <View style={styles.modeCardText}>
                <Text style={styles.modeCardTitle}>{tr('import.merge', 'Fusionner')}</Text>
                <Text style={styles.modeCardSubtitle}>{tr('import.merge.subtitle', 'Ajouter dans une liste existante')}</Text>
              </View>
              <Text style={styles.modeCardArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'file' && (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>📂</Text>
            <Text style={styles.title}>
              {mode === 'new' ? tr('import.new', 'Nouvelle liste') : preselectedList ? `${tr('import.merge.in', 'Fusionner dans')} "${preselectedList.name}"` : tr('import.merge', 'Fusionner')}
            </Text>
            <Text style={styles.subtitle}>{tr('import.file.select', 'Sélectionne un fichier exporté depuis Tankobon')}</Text>
            <TouchableOpacity style={styles.pickButton} onPress={handlePickFile}>
              <Text style={styles.pickButtonText}>{tr('import.pick', 'Choisir un fichier')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'confirm' && importedData && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>{tr('import.loaded', '✅ Fichier chargé')}</Text>
            <Text style={styles.previewInfo}>
              {importedData.entries.length} {importedData.entries.length > 1 ? tr('import.entries.found.plural', 'entrées trouvées') : tr('import.entries.found', 'entrée trouvée')}
            </Text>

            {mode === 'new' ? (
              <View style={styles.field}>
                <Text style={styles.label}>{tr('import.list.name', 'Nom de la nouvelle liste *')}</Text>
                <TextInput style={styles.input} value={listName} onChangeText={setListName} placeholder={tr('import.list.name', 'Nom de la liste...')} placeholderTextColor={theme.colors.textSecondary} />
              </View>
            ) : preselectedList ? (
              <View style={styles.preselectedCard}>
                <Text style={styles.preselectedLabel}>{tr('import.merge.in', 'Fusionner dans')}</Text>
                <Text style={styles.preselectedName}>{preselectedList.name}</Text>
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.label}>{tr('import.target', 'Fusionner dans *')}</Text>
                <View style={styles.searchContainer}>
                  <TextInput style={styles.searchInput} placeholder={tr('lists.search', '🔍 Rechercher une liste...')} placeholderTextColor={theme.colors.textSecondary} value={search} onChangeText={handleSearch} />
                  {search.length > 0 && <TouchableOpacity onPress={() => handleSearch('')}><Text style={styles.clearSearch}>✕</Text></TouchableOpacity>}
                </View>
                {filteredLists.length === 0 ? (
                  <Text style={styles.emptyText}>{tr('import.select.empty', 'Aucune liste trouvée')}</Text>
                ) : (
                  filteredLists.map((list) => (
                    <TouchableOpacity key={list.id} style={[styles.listOption, selectedList?.id === list.id && styles.listOptionSelected]} onPress={() => setSelectedList(list)}>
                      <Text style={[styles.listOptionText, selectedList?.id === list.id && styles.listOptionTextSelected]}>{list.name}</Text>
                      {list.password_hash && <Text style={styles.lockIcon}>🔒</Text>}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <TouchableOpacity style={[styles.importButton, loading && styles.importButtonDisabled]} onPress={handleImport} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.importButtonText}>{mode === 'new' ? tr('import.create', 'Créer la liste 🌸') : tr('import.merge.button', 'Fusionner 🌸')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeFileButton} onPress={() => { setImportedData(null); setStep('file'); }}>
              <Text style={styles.changeFileText}>{tr('import.change', 'Changer de fichier')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { padding: theme.spacing.lg, flexGrow: 1, justifyContent: 'center' },
  stepContainer: { alignItems: 'center', gap: theme.spacing.md },
  emoji: { fontSize: 64 },
  title: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  subtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  modeCard: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md },
  modeCardEmoji: { fontSize: 32 },
  modeCardText: { flex: 1, gap: 2 },
  modeCardTitle: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.text },
  modeCardSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  modeCardArrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  pickButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.xl, marginTop: theme.spacing.md },
  pickButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  previewContainer: { gap: theme.spacing.lg },
  previewTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center' },
  previewInfo: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  field: { gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  searchInput: { flex: 1, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  clearSearch: { color: theme.colors.textSecondary, fontSize: theme.fontSize.lg, padding: theme.spacing.sm },
  emptyText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  listOption: { padding: theme.spacing.md, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listOptionSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  listOptionText: { color: theme.colors.text, fontSize: theme.fontSize.md, flex: 1 },
  listOptionTextSelected: { color: theme.colors.primary, fontWeight: '600' },
  lockIcon: { fontSize: 14 },
  preselectedCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.primary, gap: theme.spacing.xs },
  preselectedLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  preselectedName: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.primary },
  importButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  importButtonDisabled: { opacity: 0.6 },
  importButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  changeFileButton: { alignItems: 'center', padding: theme.spacing.sm },
  changeFileText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  passwordOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: theme.spacing.lg },
  passwordCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md },
  passwordEmoji: { fontSize: 48 },
  passwordTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  passwordSubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
  passwordListName: { color: theme.colors.primary, fontWeight: 'bold' },
  passwordInput: { width: '100%', backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text, marginTop: theme.spacing.sm },
  passwordConfirmButton: { width: '100%', backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  passwordConfirmText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  passwordCancelButton: { padding: theme.spacing.sm },
  passwordCancelText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
});
