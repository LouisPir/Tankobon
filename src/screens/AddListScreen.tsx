import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
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
  const { t } = useLanguage();
  const styles = makeStyles(theme);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert(t('error'), t('list.name_required')); return; }
    try {
      setLoading(true);
      await createList({ name: name.trim(), description: description.trim() || null, password_hash: password.trim() || null });
      onSuccess();
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{t('back')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('list.add.title')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>{t('list.name')}</Text>
          <TextInput style={styles.input} placeholder="Ex: Mes shonens préférés..." value={name} onChangeText={setName} placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('list.description')}</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Une description optionnelle..." value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>{t('list.password')}</Text>
          <Text style={styles.hint}>{t('list.password.hint')}</Text>
          <TextInput style={styles.input} placeholder={t('list.password.placeholder')} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.colors.textSecondary} />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{t('list.add.button')}</Text>}
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
