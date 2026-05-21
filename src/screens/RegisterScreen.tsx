import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { register, getUserCount, validateReferralCode } from '../services/auth';
import { Theme } from '../config/theme';

const REFERRAL_THRESHOLD = 20000;

export const RegisterScreen = ({ onGoToLogin }: { onGoToLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralRequired, setReferralRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  useEffect(() => {
    getUserCount().then((count) => setReferralRequired(count >= REFERRAL_THRESHOLD)).catch(() => setReferralRequired(false));
  }, []);

  const handleRegister = async () => {
    if (!email || !password) { Alert.alert(tr('error', 'Erreur'), tr('register.required.fields', 'Veuillez remplir tous les champs')); return; }
    if (referralRequired && !referralCode.trim()) { Alert.alert(tr('error', 'Erreur'), tr('register.referral.missing', 'Un code de parrainage est requis')); return; }
    if (referralCode.trim()) {
      const valid = await validateReferralCode(referralCode.trim());
      if (!valid) { Alert.alert(tr('error', 'Erreur'), tr('register.referral.invalid', 'Code de parrainage invalide')); return; }
    }
    try {
      setLoading(true);
      await register(email, password);
      Alert.alert(tr('success', 'Succès'), tr('register.success', 'Compte créé ! Vérifiez votre email.'));
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.title}>{tr('register.title', 'Créer un compte')}</Text>
        <TextInput style={styles.input} placeholder={tr('auth.email', 'Email')} placeholderTextColor={theme.colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder={tr('auth.password', 'Mot de passe')} placeholderTextColor={theme.colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
        <View style={styles.referralContainer}>
          <TextInput
            style={[styles.input, referralRequired && styles.inputRequired]}
            placeholder={referralRequired ? tr('register.referral.required', 'Code de parrainage *') : tr('register.referral.optional', 'Code de parrainage (optionnel)')}
            placeholderTextColor={theme.colors.textSecondary}
            value={referralCode}
            onChangeText={(text) => setReferralCode(text.toUpperCase())}
            autoCapitalize="characters"
          />
          {referralRequired && <Text style={styles.requiredHint}>{tr('register.referral.warning', '⚠️ Un code de parrainage est requis pour s\'inscrire')}</Text>}
        </View>
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{tr('register.submit', 'S\'inscrire 🌸')}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={onGoToLogin} style={styles.link}>
          <Text style={styles.linkText}>{tr('register.login', 'Déjà un compte ? Se connecter')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center', gap: theme.spacing.md },
  emoji: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  inputRequired: { borderColor: theme.colors.primary },
  referralContainer: { gap: theme.spacing.xs },
  requiredHint: { fontSize: theme.fontSize.sm, color: theme.colors.primary },
  button: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  link: { alignItems: 'center', marginTop: theme.spacing.md },
  linkText: { color: theme.colors.primary, fontSize: theme.fontSize.md },
});
