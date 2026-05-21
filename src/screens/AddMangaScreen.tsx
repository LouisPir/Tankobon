import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { addManga, MangaStatus } from '../services/manga';
import { Theme } from '../config/theme';

export const AddMangaScreen = ({ onBack, onSuccess, listId }: { listId: string; onBack: () => void; onSuccess: () => void }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(theme);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MangaStatus>('ongoing');
  const [currentChapter, setCurrentChapter] = useState('0');
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const STATUS_OPTIONS: { label: string; value: MangaStatus }[] = [
    { label: t('status.ongoing'), value: 'ongoing' },
    { label: t('status.completed'), value: 'completed' },
    { label: t('status.dropped'), value: 'dropped' },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert(t('error'), t('manga.title_required')); return; }
    try {
      setLoading(true);
      await addManga({ title: title.trim(), status, current_chapter: parseInt(currentChapter) || 0, rating, review: review.trim() || null, list_id: listId });
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
        <Text style={styles.headerTitle}>{t('manga.add.title')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>{t('manga.title')}</Text>
            <TextInput style={styles.input} placeholder="Ex: Naruto, One Piece..." value={title} onChangeText={setTitle} placeholderTextColor={theme.colors.textSecondary} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('manga.status')}</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity key={option.value} style={[styles.statusOption, status === option.value && styles.statusOptionActive]} onPress={() => setStatus(option.value)}>
                  <Text style={[styles.statusOptionText, status === option.value && styles.statusOptionTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('manga.chapter')}</Text>
            <TextInput style={styles.input} placeholder="0" value={currentChapter} onChangeText={setCurrentChapter} keyboardType="numeric" placeholderTextColor={theme.colors.textSecondary} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('manga.rating')}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(rating === star ? null : star)}>
                  <Text style={styles.star}>{rating && star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('manga.review')}</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder={t('manga.review.placeholder')} value={review} onChangeText={setReview} multiline numberOfLines={4} placeholderTextColor={theme.colors.textSecondary} />
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{t('manga.add.button')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  statusOptions: { flexDirection: 'row', gap: theme.spacing.sm },
  statusOption: { flex: 1, padding: theme.spacing.sm, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  statusOptionActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  statusOptionText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.textSecondary },
  statusOptionTextActive: { color: '#fff' },
  starsContainer: { flexDirection: 'row', gap: theme.spacing.sm },
  star: { fontSize: 32, color: theme.colors.primary },
  submitButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md },
  submitText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});
