import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { updateEntry, Entry } from '../services/entries';
import { Theme } from '../config/theme';
import { ListType, EntryStatus, getListTypeConfig } from '../config/listTypes';

export const EditEntryScreen = ({
  entry,
  listType,
  onBack,
  onSuccess,
}: {
  entry: Entry;
  listType: ListType;
  onBack: () => void;
  onSuccess: () => void;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const typeConfig = getListTypeConfig(listType);

  const [title, setTitle] = useState(entry.title);
  const [status, setStatus] = useState<EntryStatus>(entry.status);
  const [currentChapter, setCurrentChapter] = useState(String(entry.current_chapter));
  const [currentSeason, setCurrentSeason] = useState(String(entry.current_season ?? 1));
  const [rating, setRating] = useState<number | null>(entry.rating);
  const [review, setReview] = useState(entry.review ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(tr('error', 'Erreur'), tr('entry.title_required', 'Le titre est obligatoire'));
      return;
    }
    try {
      setLoading(true);
      await updateEntry(entry.id, {
        title: title.trim(),
        status,
        current_chapter: parseInt(currentChapter) || 0,
        current_season: parseInt(currentSeason) || 1,
        rating,
        review: review.trim() || null,
      });
      onSuccess();
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const entryLabel = tr(typeConfig.labelKey, typeConfig.labelFr);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {typeConfig.icon} {tr('entry.edit.title', 'Modifier')} {entryLabel}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.field}>
            <Text style={styles.label}>{tr('entry.title', 'Titre *')}</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {typeConfig.statuses.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>{tr('entry.status', 'Statut')}</Text>
              <View style={styles.statusOptions}>
                {typeConfig.statuses.map((s) => {
                  const labelConfig = typeConfig.statusLabelKeys[s];
                  const label = labelConfig ? tr(labelConfig.key, labelConfig.fr) : s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusOption, status === s && styles.statusOptionActive]}
                      onPress={() => setStatus(s)}
                    >
                      <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>
                        {label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {typeConfig.progressionType === 'season_episode' && (
            <View style={styles.field}>
              <Text style={styles.label}>{tr('entry.progression', 'Progression')}</Text>
              <View style={styles.seasonEpisodeRow}>
                <View style={styles.seasonEpisodeField}>
                  <Text style={styles.subLabel}>{tr('entry.season', 'Saison')}</Text>
                  <TextInput
                    style={styles.input}
                    value={currentSeason}
                    onChangeText={setCurrentSeason}
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={styles.seasonEpisodeField}>
                  <Text style={styles.subLabel}>{tr('entry.episode', 'Épisode')}</Text>
                  <TextInput
                    style={styles.input}
                    value={currentChapter}
                    onChangeText={setCurrentChapter}
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          )}

          {typeConfig.progressionType !== 'none' && typeConfig.progressionType !== 'season_episode' && (
            <View style={styles.field}>
              <Text style={styles.label}>
                {typeConfig.progressionLabelKey
                  ? tr(typeConfig.progressionLabelKey, typeConfig.progressionLabelFr ?? '')
                  : typeConfig.progressionLabelFr}
              </Text>
              <TextInput
                style={styles.input}
                value={currentChapter}
                onChangeText={setCurrentChapter}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>{tr('entry.rating', 'Note')}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(rating === star ? null : star)}>
                  <Text style={styles.star}>{rating && star <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{tr('entry.review', 'Mon avis')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={tr('entry.review.placeholder', 'Qu\'as-tu pensé ?')}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>{tr('save', 'Sauvegarder 🌸')}</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
  subLabel: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  input: {
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.md,
    fontSize: theme.fontSize.md, color: theme.colors.text,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  statusOptions: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  statusOption: {
    flex: 1, padding: theme.spacing.sm, borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', minWidth: 80,
  },
  statusOptionActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  statusOptionText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.textSecondary },
  statusOptionTextActive: { color: '#fff' },
  seasonEpisodeRow: { flexDirection: 'row', gap: theme.spacing.md },
  seasonEpisodeField: { flex: 1 },
  starsContainer: { flexDirection: 'row', gap: theme.spacing.sm },
  star: { fontSize: 32, color: theme.colors.primary },
  submitButton: {
    backgroundColor: theme.colors.primary, padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md,
  },
  submitText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});