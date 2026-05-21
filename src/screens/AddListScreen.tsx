import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { createList } from '../services/lists';
import { Theme } from '../config/theme';

export const AddListScreen = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert(tr('error', 'Erreur'), tr('list.name_required', 'Le nom est obligatoire')); return; }
    try {
      setLoading(true);
      await createList({ name: name.trim(), description: description.trim() || null, password_hash: password.trim() || null });
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
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('list.add.title', 'Nouvelle liste')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.name', 'Nom *')}</Text>
          <TextInput style={styles.input} placeholder="Ex: Mes shonens préférés..." value={name} onChangeText={setName} placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.description', 'Description')}</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Une description optionnelle..." value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{tr('list.password', 'Mot de passe 🔒')}</Text>
          <Text style={styles.hint}>{tr('list.password.hint', 'Optionnel — protège l\'accès à cette liste')}</Text>
          <TextInput style={styles.input} placeholder={tr('list.password.placeholder', 'Laisser vide pour ne pas protéger')} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{tr('list.add.button', 'Créer la liste 🌸')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  form: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  field: { gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  hint: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md },
  submitText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});
