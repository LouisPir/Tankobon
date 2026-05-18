import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../config/theme';

export const MangaDetailScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        </View>

        {/* Cover placeholder */}
        <View style={styles.coverContainer}>
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverEmoji}>📖</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Titre du manga</Text>
          <Text style={styles.author}>Auteur inconnu</Text>

          {/* Status badge */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>En cours</Text>
            </View>
          </View>

          {/* Chapter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Progression</Text>
            <View style={styles.chapterCard}>
              <Text style={styles.chapterLabel}>Dernier chapitre lu</Text>
              <Text style={styles.chapterNumber}>—</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Note personnelle</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star}>
                  <Text style={styles.star}>☆</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Review */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💭 Mon avis</Text>
            <View style={styles.reviewPlaceholder}>
              <Text style={styles.reviewPlaceholderText}>
                Aucun avis pour l'instant...
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  coverContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  coverPlaceholder: {
    width: 140,
    height: 200,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  coverEmoji: {
    fontSize: 48,
  },
  infoContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  author: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  badge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  chapterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  chapterLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  chapterNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  star: {
    fontSize: 32,
    color: theme.colors.primary,
  },
  reviewPlaceholder: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewPlaceholderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    fontStyle: 'italic',
  },
});