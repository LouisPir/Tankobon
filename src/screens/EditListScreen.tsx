import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { updateList, List } from '../services/lists';
import { Theme } from '../config/theme';
import { ListType, LIST_TYPES } from '../config/listTypes';

export const EditListScreen = ({
  list,
  onBack,
  onSuccess,
}: {
  list: List;
  onBack: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? '');
  const [password, setPassword] = useState('');
  const [selectedType, setSelectedType] = useState<ListType>(list.type);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(tr('error', 'Erreur'), tr('list.name_required', 'Le nom est obligatoire'));
      return;
    }
    try {
      setLoading(true);
      await updateList(list.id, {
        name: name.trim(),
        type: selectedType,
        description: description.trim() || null,
        password_hash: password.trim() || list.password_hash,
      });
      onSuccess();
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('list.edit.title', 'Modifier la liste')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>

        {/* Nom */}
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.name', 'Nom *')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.type', 'Type')}</Text>
          <View style={styles.typeGrid}>
            {Object.values(LIST_TYPES).map((config) => (
              <TouchableOpacity
                key={config.type}
                style={[styles.typeOption, selectedType === config.type && styles.typeOptionActive]}
                onPress={() => setSelectedType(config.type)}
              >
                <Text style={styles.typeOptionIcon}>{config.icon}</Text>
                <Text style={[styles.typeOptionLabel, selectedType === config.type && styles.typeOptionLabelActive]}>
                  {tr(config.labelKey, config.labelFr)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.description', 'Description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Mot de passe */}
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.password', 'Nouveau mot de passe 🔒')}</Text>
          <Text style={styles.hint}>
            {list.password_hash
              ? tr('list.password.keep', 'Laisser vide pour conserver le mot de passe actuel')
              : tr('list.password.none', 'Laisser vide pour ne pas protéger')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={tr('list.password', 'Nouveau mot de passe...')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        {/* Supprimer mot de passe */}
        {list.password_hash && (
          <TouchableOpacity
            style={styles.removePasswordButton}
            onPress={() => {
              Alert.alert(
                tr('list.password.remove.title', 'Supprimer le mot de passe'),
                tr('list.password.remove.confirm', 'Es-tu sûr de vouloir supprimer la protection ?'),
                [
                  { text: tr('cancel', 'Annuler'), style: 'cancel' },
                  {
                    text: tr('delete', 'Supprimer'),
                    style: 'destructive',
                    onPress: async () => {
                      await updateList(list.id, { password_hash: null });
                      onSuccess();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.removePasswordText}>
              {tr('list.password.remove.button', '🔓 Supprimer le mot de passe')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>{tr('save', 'Sauvegarder 🌸')}</Text>
          }
        </TouchableOpacity>

      </ScrollView>
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
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  form: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  field: { gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  hint: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  input: {
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.md,
    fontSize: theme.fontSize.md, color: theme.colors.text,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  typeOption: {
    width: '22%', aspectRatio: 1, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs,
  },
  typeOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.accent },
  typeOptionIcon: { fontSize: 24 },
  typeOptionLabel: {
    fontSize: 10, fontWeight: '600', color: theme.colors.textSecondary, textAlign: 'center',
  },
  typeOptionLabelActive: { color: theme.colors.primary },
  removePasswordButton: { padding: theme.spacing.md, alignItems: 'center' },
  removePasswordText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  submitButton: {
    backgroundColor: theme.colors.primary, padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md,
  },
  submitText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});