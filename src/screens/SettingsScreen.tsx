import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../config/theme';
import { logout } from '../services/auth';
import { List } from '../services/lists';

export const SettingsScreen = ({
  onBack,
  selectedList,
  onImportList,
  onExportList,
  onEditList,
  onChangeEmail,
  onChangePassword,
  onDeleteAccount,
  onExportAllLists,
  onDeleteAllData,
  onAbout,
}: {
  onBack: () => void;
  selectedList?: List;
  onImportList: () => void;
  onExportList: () => void;
  onEditList: () => void;
  onChangeEmail: () => void;
  onChangePassword: () => void;
  onDeleteAccount: () => void;
  onExportAllLists: () => void;
  onDeleteAllData: () => void;
  onAbout: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.lg }
        ]}
      >

        {/* Section liste */}
        <Text style={styles.sectionTitle}>
          {selectedList ? selectedList.name : 'Listes'}
        </Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onImportList}>
            <Text style={styles.rowText}>
              📥 {selectedList ? 'Importer dans cette liste' : 'Importer une liste'}
            </Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onExportList}>
            <Text style={styles.rowText}>
              📤 {selectedList ? 'Exporter cette liste' : 'Exporter une liste'}
            </Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onEditList}>
            <Text style={styles.rowText}>
              ✏️ {selectedList ? 'Modifier cette liste' : 'Modifier une liste'}
            </Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section compte */}
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onChangeEmail}>
            <Text style={styles.rowText}>✉️ Changer l'email</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onChangePassword}>
            <Text style={styles.rowText}>🔑 Changer le mot de passe</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onDeleteAccount}>
            <Text style={[styles.rowText, { color: '#E53935' }]}>🗑️ Supprimer mon compte</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section données */}
        <Text style={styles.sectionTitle}>Données</Text>
        <View style={styles.section}>
          {!selectedList && (
            <>
              <TouchableOpacity style={styles.row} onPress={onExportAllLists}>
                <Text style={styles.rowText}>📤 Exporter toutes les listes</Text>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
              <View style={styles.separator} />

            </>
          )}
          <TouchableOpacity style={styles.row} onPress={onDeleteAllData}>
            <Text style={[styles.rowText, { color: '#E53935' }]}>🗑️ Supprimer toutes mes données</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section préférences */}
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowText}>🎨 Thème</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowText}>🌍 Langue</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section à propos */}
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onAbout}>
            <Text style={styles.rowText}>ℹ️ À propos</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flexGrow: 1, padding: theme.spacing.lg, gap: theme.spacing.md},
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  rowText: { fontSize: theme.fontSize.md, color: theme.colors.text },
  rowArrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  logoutButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  logoutText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});