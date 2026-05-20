import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { theme } from '../config/theme';
import { updateManga, Manga, MangaStatus } from '../services/manga';

const STATUS_OPTIONS: { label: string; value: MangaStatus }[] = [
  { label: 'EN COURS', value: 'ongoing' },
  { label: 'TERMINÉ', value: 'completed' },
  { label: 'ABANDONNÉ', value: 'dropped' },
];

export const EditMangaScreen = ({
  manga,
  onBack,
  onSuccess,
}: {
  manga: Manga;
  onBack: () => void;
  onSuccess: () => void;
}) => {
  const [title, setTitle] = useState(manga.title);
  const [status, setStatus] = useState<MangaStatus>(manga.status);
  const [currentChapter, setCurrentChapter] = useState(String(manga.current_chapter));
  const [rating, setRating] = useState<number | null>(manga.rating);
  const [review, setReview] = useState(manga.review ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    try {
      setLoading(true);
      await updateManga(manga.id, {
        title: title.trim(),
        status,
        current_chapter: parseInt(currentChapter) || 0,
        rating,
        review: review.trim() || null,
      });
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
        <Text style={styles.headerTitle}>Modifier</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Titre */}
          <View style={styles.field}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Naruto, One Piece..."
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Statut</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    status === option.value && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text style={[
                    styles.statusOptionText,
                    status === option.value && styles.statusOptionTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chapitre */}
          <View style={styles.field}>
            <Text style={styles.label}>Dernier chapitre lu</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={currentChapter}
              onChangeText={setCurrentChapter}
              keyboardType="numeric"
            />
          </View>

          {/* Rating */}
          <View style={styles.field}>
            <Text style={styles.label}>Note</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(rating === star ? null : star)}
                >
                  <Text style={styles.star}>
                    {rating && star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review */}
          <View style={styles.field}>
            <Text style={styles.label}>Mon avis</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Qu'as-tu pensé de ce manga ?"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Sauvegarder 🌸</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
</KeyboardAvoidingView>
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
  form: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statusOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statusOption: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusOptionText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  star: {
    fontSize: 32,
    color: theme.colors.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
});