import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { theme } from '../config/theme';
import { pickJSONFile, importListAsNew, ImportedList } from '../services/lists';

export const ImportListScreen = ({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) => {
  const [importedData, setImportedData] = useState<ImportedList | null>(null);
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickFile = async () => {
    try {
      const data = await pickJSONFile();
      if (!data) return;
      setImportedData(data);
      setListName(data.name);
    } catch (error: any) {
      Alert.alert('Erreur', 'Fichier invalide ou corrompu');
    }
  };

  const handleImport = async () => {
    if (!importedData || !listName.trim()) return;

    try {
      setLoading(true);
      await importListAsNew(importedData, listName.trim());
      onSuccess();
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
        <Text style={styles.headerTitle}>Importer une liste</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
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
              {importedData.mangas.length} manga{importedData.mangas.length > 1 ? 's' : ''} trouvé{importedData.mangas.length > 1 ? 's' : ''}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nom de la nouvelle liste *</Text>
              <TextInput
                style={styles.input}
                value={listName}
                onChangeText={setListName}
                placeholder="Nom de la liste..."
              />
            </View>

            <TouchableOpacity
              style={styles.importButton}
              onPress={handleImport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.importButtonText}>Créer la liste 🌸</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeFileButton}
              onPress={handlePickFile}
            >
              <Text style={styles.changeFileText}>Changer de fichier</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    width: 60,
  },
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  pickContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  pickButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  previewContainer: {
    gap: theme.spacing.lg,
  },
  previewTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  previewInfo: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  field: {
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  importButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  changeFileButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  changeFileText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});