import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getProfile, updateProfile, isUsernameTaken, Profile } from '../services/profile';
import { getGlobalStats, GlobalStats } from '../services/stats';
import { computeGrades, GradeResult } from '../services/grades';

const AVATARS = [
  'https://erykhvqoacquhsguaarc.supabase.co/storage/v1/object/public/avatars/blue_ninja.png',
  // Ajoute tes autres avatars ici au fur et à mesure
];

export const ProfileScreen = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [grades, setGrades] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [selectingAvatar, setSelectingAvatar] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), getGlobalStats(), computeGrades()])
      .then(([p, s, g]) => {
        setProfile(p);
        setStats(s);
        setGrades(g);
        setUsername(p.username ?? '');
      })
      .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      Alert.alert(tr('error', 'Erreur'), tr('profile.username.required', 'Le pseudo est obligatoire'));
      return;
    }
    if (username.trim() === profile?.username) {
      setEditingUsername(false);
      return;
    }
    try {
      setSavingUsername(true);
      const taken = await isUsernameTaken(username.trim());
      if (taken) {
        Alert.alert(tr('error', 'Erreur'), tr('profile.username.taken', 'Ce pseudo est déjà pris'));
        return;
      }
      await updateProfile({ username: username.trim() });
      setProfile(p => p ? { ...p, username: username.trim() } : p);
      setEditingUsername(false);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setSavingUsername(false);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    try {
      await updateProfile({ avatar: url });
      setProfile(p => p ? { ...p, avatar: url } : p);
      setSelectingAvatar(false);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('profile.title', 'Profil')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={() => setSelectingAvatar(true)}>
              {profile?.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>?</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditBadgeText}>✏️</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Sélection avatar */}
          {selectingAvatar && (
            <View style={styles.avatarGrid}>
              {AVATARS.map((url) => (
                <TouchableOpacity key={url} onPress={() => handleSelectAvatar(url)}>
                  <Image
                    source={{ uri: url }}
                    style={[styles.avatarOption, profile?.avatar === url && styles.avatarOptionSelected]}
                  />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectingAvatar(false)}>
                <Text style={styles.cancelButtonText}>{tr('cancel', 'Annuler')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Username */}
          <Text style={styles.sectionTitle}>{tr('profile.username', 'Pseudo')}</Text>
          <View style={styles.card}>
            {editingUsername ? (
              <View style={styles.usernameEditRow}>
                <TextInput
                  style={styles.usernameInput}
                  value={username}
                  onChangeText={setUsername}
                  autoFocus
                  placeholder={tr('profile.username.placeholder', 'Ton pseudo...')}
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <TouchableOpacity onPress={handleSaveUsername} disabled={savingUsername}>
                  {savingUsername
                    ? <ActivityIndicator color={theme.colors.primary} />
                    : <Text style={styles.saveText}>{tr('save', 'Sauvegarder')}</Text>
                  }
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.usernameRow} onPress={() => setEditingUsername(true)}>
                <Text style={styles.usernameText}>{profile?.username ?? tr('profile.username.empty', 'Définir un pseudo')}</Text>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grade */}
          {grades && (
            <>
              <Text style={styles.sectionTitle}>{tr('profile.grade', 'Grade')}</Text>
              <View style={[styles.card, styles.gradeRow]}>
                <Text style={styles.gradeIcon}>{grades.grade.icon}</Text>
                <View>
                  <Text style={styles.gradeName}>{tr(grades.grade.nameKey, grades.grade.name)}</Text>
                  <Text style={styles.gradePoints}>{grades.totalPoints} pts</Text>
                </View>
              </View>
            </>
          )}

          {/* Stats globales */}
          {stats && (
            <>
              <Text style={styles.sectionTitle}>{tr('stats.global', 'Vue globale')}</Text>
              <View style={styles.row3}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalLists}</Text>
                  <Text style={styles.statLabel}>{tr('stats.lists', 'Listes')}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalEntries}</Text>
                  <Text style={styles.statLabel}>{tr('stats.entries', 'Entrées')}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalCompleted}</Text>
                  <Text style={styles.statLabel}>{tr('stats.completed', 'Complétés')}</Text>
                </View>
              </View>
            </>
          )}

          {/* Code de parrainage */}
          <Text style={styles.sectionTitle}>{tr('profile.referral', 'Code de parrainage')}</Text>
          <View style={[styles.card, styles.referralRow]}>
            <Text style={styles.referralCode}>{profile?.referral_code}</Text>
          </View>

        </ScrollView>
      )}
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  avatarSection: { alignItems: 'center', marginBottom: theme.spacing.md },
  avatar: { 
    width: 100, height: 100, borderRadius: theme.borderRadius.full,
    borderWidth: 3, borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface, borderWidth: 3, borderColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarPlaceholderText: { fontSize: 40, color: theme.colors.textSecondary },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border,
  },
  avatarEditBadgeText: { fontSize: 12 },
  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm,
    justifyContent: 'center', marginBottom: theme.spacing.md,
  },
  avatarOption: { width: 80, height: 80, borderRadius: theme.borderRadius.full, borderWidth: 2, borderColor: 'transparent' },
  avatarOptionSelected: { borderColor: theme.colors.primary },
  cancelButton: { alignItems: 'center', padding: theme.spacing.sm },
  cancelButtonText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  usernameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  usernameText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  editIcon: { fontSize: theme.fontSize.md },
  usernameEditRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  usernameInput: { flex: 1, fontSize: theme.fontSize.md, color: theme.colors.text },
  saveText: { color: theme.colors.primary, fontWeight: '600', fontSize: theme.fontSize.md },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md },
  gradeIcon: { fontSize: 40 },
  gradeName: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.primary },
  gradePoints: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  row3: { flexDirection: 'row', gap: theme.spacing.sm },
  statCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border,
  },
  statValue: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.primary },
  statLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  referralRow: { padding: theme.spacing.md, alignItems: 'center' },
  referralCode: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 2 },
});