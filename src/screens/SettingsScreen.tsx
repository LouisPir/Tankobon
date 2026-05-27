import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { logout } from '../services/auth';
import { List } from '../services/lists';

export const SettingsScreen = ({
  onBack, selectedList, onImportList, onExportList, onEditList,
  onChangeEmail, onChangePassword, onDeleteAccount, onExportAllLists,
  onDeleteAllData, onAbout, onTheme, onLanguage, onReferral, onStats,
  onAchievements, onProfile, onFriends,
}: {
  onBack: () => void; selectedList?: List; onImportList: () => void;
  onExportList: () => void; onEditList: () => void; onChangeEmail: () => void;
  onChangePassword: () => void; onDeleteAccount: () => void; onExportAllLists: () => void;
  onDeleteAllData: () => void; onAbout: () => void; onTheme: () => void;
  onLanguage: () => void; onReferral: () => void;
  onStats: () => void;
  onAchievements: () => void;
  onProfile: () => void;
  onFriends: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleLogout = async () => {
    Alert.alert(tr('settings.logout.title', 'Déconnexion'), tr('settings.logout.confirm', 'Es-tu sûr de vouloir te déconnecter ?'), [
      { text: tr('cancel', 'Annuler'), style: 'cancel' },
      { text: tr('settings.logout.title', 'Déconnexion'), style: 'destructive', onPress: async () => {
        try { await logout(); } catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('settings', 'Paramètres')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        <Text style={styles.sectionTitle}>{selectedList ? selectedList.name : tr('settings.lists', 'Listes')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onImportList}>
            <Text style={styles.rowText}>📥 {selectedList ? tr('settings.import.this', 'Importer dans cette liste') : tr('settings.import', 'Importer une liste')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onExportList}>
            <Text style={styles.rowText}>📤 {selectedList ? tr('settings.export.this', 'Exporter cette liste') : tr('settings.export', 'Exporter une liste')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onEditList}>
            <Text style={styles.rowText}>✏️ {selectedList ? tr('settings.edit.this', 'Modifier cette liste') : tr('settings.edit', 'Modifier une liste')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{tr('settings.account', 'Compte')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onProfile}>
            <Text style={styles.rowText}>{tr('settings.profile', '👤 Mon profil')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onFriends}>
            <Text style={styles.rowText}>{tr('settings.friends', '👥 Amis')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onAchievements}>
            <Text style={styles.rowText}>{tr('settings.achievements', '🏆 Succès')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onChangeEmail}>
            <Text style={styles.rowText}>{tr('settings.email', '✉️ Changer l\'email')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onChangePassword}>
            <Text style={styles.rowText}>{tr('settings.password', '🔑 Changer le mot de passe')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onReferral}>
            <Text style={styles.rowText}>{tr('settings.referral', '🎟️ Mon code de parrainage')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onDeleteAccount}>
            <Text style={[styles.rowText, { color: '#E53935' }]}>{tr('settings.delete.account', '🗑️ Supprimer mon compte')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{tr('settings.data', 'Données')}</Text>
        <View style={styles.section}>
          {!selectedList && (
            <>
              <TouchableOpacity style={styles.row} onPress={onExportAllLists}>
                <Text style={styles.rowText}>{tr('settings.export.all', '📤 Exporter toutes les listes')}</Text>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
            </>
          )}
          <TouchableOpacity style={styles.row} onPress={onDeleteAllData}>
            <Text style={[styles.rowText, { color: '#E53935' }]}>{tr('settings.delete.data', '🗑️ Supprimer toutes mes données')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{tr('settings.preferences', 'Préférences')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onTheme}>
            <Text style={styles.rowText}>{tr('settings.theme', '🎨 Thème')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onLanguage}>
            <Text style={styles.rowText}>{tr('settings.language', '🌍 Langue')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onStats}>
            <Text style={styles.rowText}>{tr('settings.stats', '📊 Statistiques')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{tr('settings.info', 'Informations')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onAbout}>
            <Text style={styles.rowText}>{tr('settings.about', 'ℹ️ À propos')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{tr('settings.logout', 'Se déconnecter')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flexGrow: 1, padding: theme.spacing.lg, gap: theme.spacing.md },
  sectionTitle: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md },
  rowText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  rowArrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  logoutButton: { marginTop: theme.spacing.lg, backgroundColor: theme.colors.accent, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.primaryLight },
  logoutText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});
