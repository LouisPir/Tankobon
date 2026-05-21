import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { logout } from '../services/auth';
import { List } from '../services/lists';

export const SettingsScreen = ({
  onBack, selectedList, onImportList, onExportList, onEditList,
  onChangeEmail, onChangePassword, onDeleteAccount, onExportAllLists,
  onDeleteAllData, onAbout, onTheme, onLanguage,
}: {
  onBack: () => void; selectedList?: List; onImportList: () => void;
  onExportList: () => void; onEditList: () => void; onChangeEmail: () => void;
  onChangePassword: () => void; onDeleteAccount: () => void; onExportAllLists: () => void;
  onDeleteAllData: () => void; onAbout: () => void; onTheme: () => void; onLanguage: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = makeStyles(theme);

  const handleLogout = async () => {
    Alert.alert(t('settings.logout.title'), t('settings.logout.confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('settings.logout.title'), style: 'destructive', onPress: async () => {
        try { await logout(); } catch (error: any) { Alert.alert(t('error'), error.message); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{t('back')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>
        <Text style={styles.sectionTitle}>{selectedList ? selectedList.name : t('settings.lists')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onImportList}>
            <Text style={styles.rowText}>📥 {selectedList ? t('settings.import.this') : t('settings.import')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onExportList}>
            <Text style={styles.rowText}>📤 {selectedList ? t('settings.export.this') : t('settings.export')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onEditList}>
            <Text style={styles.rowText}>✏️ {selectedList ? t('settings.edit.this') : t('settings.edit')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onChangeEmail}>
            <Text style={styles.rowText}>{t('settings.email')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onChangePassword}>
            <Text style={styles.rowText}>{t('settings.password')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onDeleteAccount}>
            <Text style={[styles.rowText, { color: '#E53935' }]}>{t('settings.delete.account')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('settings.data')}</Text>
        <View style={styles.section}>
          {!selectedList && (
            <>
              <TouchableOpacity style={styles.row} onPress={onExportAllLists}>
                <Text style={styles.rowText}>{t('settings.export.all')}</Text>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
              <View style={styles.separator} />
            </>
          )}
          <TouchableOpacity style={styles.row} onPress={onDeleteAllData}>
            <Text style={[styles.rowText, { color: '#E53935' }]}>{t('settings.delete.data')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onTheme}>
            <Text style={styles.rowText}>{t('settings.theme')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={onLanguage}>
            <Text style={styles.rowText}>{t('settings.language')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('settings.info')}</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={onAbout}>
            <Text style={styles.rowText}>{t('settings.about')}</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
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
