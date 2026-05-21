import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getReferralCode } from '../services/auth';
import { Theme } from '../config/theme';

export const ReferralScreen = ({ onBack }: { onBack: () => void }) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReferralCode().then(setCode).catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message)).finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({ message: `${tr('referral.share.message', 'Rejoins-moi sur Tankobon 🌸 Utilise mon code de parrainage :')} ${code}` });
    } catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>{tr('back', '← Retour')}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('referral.title', 'Parrainage')}</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎟️</Text>
          <Text style={styles.cardTitle}>{tr('referral.code.title', 'Mon code de parrainage')}</Text>
          <Text style={styles.cardSubtitle}>{tr('referral.code.subtitle', 'Partage ce code avec tes amis pour qu\'ils puissent rejoindre Tankobon')}</Text>
          {loading ? <ActivityIndicator color={theme.colors.primary} size="large" /> : (
            <View style={styles.codeContainer}><Text style={styles.code}>{code ?? '—'}</Text></View>
          )}
          <TouchableOpacity style={[styles.shareButton, (!code || loading) && styles.shareButtonDisabled]} onPress={handleShare} disabled={!code || loading}>
            <Text style={styles.shareButtonText}>{tr('referral.share', 'Partager mon code 🌸')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{tr('referral.how.title', 'ℹ️ Comment ça marche ?')}</Text>
          <Text style={styles.infoText}>{tr('referral.how.text', '• Partage ton code avec un ami\n• Il le saisit lors de son inscription\n• Il rejoint Tankobon avec ton parrainage')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backText: { color: theme.colors.primary, fontSize: theme.fontSize.lg, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  content: { flex: 1, padding: theme.spacing.lg, gap: theme.spacing.lg },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  emoji: { fontSize: 64 },
  cardTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: theme.colors.text },
  cardSubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  codeContainer: { backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl, borderWidth: 2, borderColor: theme.colors.primary, marginVertical: theme.spacing.sm },
  code: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 4 },
  shareButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.xl, width: '100%', alignItems: 'center' },
  shareButtonDisabled: { opacity: 0.6 },
  shareButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  infoCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, gap: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  infoTitle: { fontSize: theme.fontSize.md, fontWeight: 'bold', color: theme.colors.text },
  infoText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, lineHeight: 24 },
});
