import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { logout } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';

export const HomeScreen = ({ onGoToList }: { onGoToList: () => void }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🌸 Tankobon</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          {loading
            ? <ActivityIndicator color={theme.colors.primary} size="small" />
            : <Text style={styles.logoutText}>Quitter</Text>
          }
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌸</Text>
        <Text style={styles.heroTitle}>Ma Collection</Text>
        <Text style={styles.heroSubtitle}>
          {tr('about.description', 'Suis tes listes, note ta progression et garde tes avis')}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>{tr('home.entries', 'Entrées')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>{tr('home.ongoing', 'En cours')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>{tr('home.completed', 'Terminés')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={onGoToList}>
        <Text style={styles.addButtonText}>{tr('home.cta', 'Voir ma collection 🌸')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
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
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  logoutText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 2,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    fontSize: theme.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
});