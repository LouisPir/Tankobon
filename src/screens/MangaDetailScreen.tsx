import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Manga } from '../services/manga';
import { Theme } from '../config/theme';

export const MangaDetailScreen = ({ manga, onBack, onEdit }: { manga: Manga; onBack: () => void; onEdit: () => void }) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}><Text style={styles.editText}>{tr('manga.edit.button', 'Modifier ✏️')}</Text></TouchableOpacity>
        </View>
        <View style={styles.coverContainer}>
          <View style={styles.coverPlaceholder}><Text style={styles.coverEmoji}>📖</Text></View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{manga.title.toUpperCase()}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}><Text style={styles.badgeText}>{manga.status.toUpperCase()}</Text></View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tr('manga.progression', '📚 Progression')}</Text>
            <View style={styles.chapterCard}>
              <Text style={styles.chapterLabel}>{tr('manga.last_chapter', 'Dernier chapitre lu')}</Text>
              <Text style={styles.chapterNumber}>{manga.current_chapter}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tr('manga.personal_rating', '⭐ Note personnelle')}</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (<Text key={star} style={styles.star}>{manga.rating && star <= manga.rating ? '⭐' : '☆'}</Text>))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{tr('manga.my_review', '💭 Mon avis')}</Text>
            <View style={styles.reviewPlaceholder}>
              <Text style={styles.reviewPlaceholderText}>{manga.review ?? tr('manga.no_review', 'Aucun avis pour l\'instant...')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg },
  backButton: { alignSelf: 'flex-start' },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600' },
  editButton: { backgroundColor: theme.colors.accent, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.full },
  editText: { color: theme.colors.primary, fontSize: theme.fontSize.md, fontWeight: '600' },
  coverContainer: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  coverPlaceholder: { width: 140, height: 200, backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  coverEmoji: { fontSize: 48 },
  infoContainer: { padding: theme.spacing.lg },
  title: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.xs },
  badgeContainer: { flexDirection: 'row', marginBottom: theme.spacing.lg },
  badge: { backgroundColor: theme.colors.accent, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: theme.colors.primaryLight },
  badgeText: { color: theme.colors.primary, fontSize: theme.fontSize.sm, fontWeight: '600' },
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.sm },
  chapterCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  chapterLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  chapterNumber: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.primary },
  starsContainer: { flexDirection: 'row', gap: theme.spacing.sm },
  star: { fontSize: 32, color: theme.colors.primary },
  reviewPlaceholder: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, minHeight: 100, justifyContent: 'center', alignItems: 'center' },
  reviewPlaceholderText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontStyle: 'italic' },
});
