import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { login } from '../services/auth';
import { Theme } from '../config/theme';

export const LoginScreen = ({ onGoToRegister }: { onGoToRegister: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert(tr('error', 'Erreur'), tr('login.required.fields', 'Veuillez remplir tous les champs')); return; }
    try { setLoading(true); await login(email, password); }
    catch (error: any) { Alert.alert(tr('error', 'Erreur'), error.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.title}>{tr('login.title', 'Connexion')}</Text>
        <TextInput style={styles.input} placeholder={tr('auth.email', 'Email')} placeholderTextColor={theme.colors.textSecondary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder={tr('auth.password', 'Mot de passe')} placeholderTextColor={theme.colors.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{tr('login.submit', 'Se connecter')}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={onGoToRegister} style={styles.link}>
          <Text style={styles.linkText}>{tr('login.register', 'Pas de compte ? S\'inscrire')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center', gap: theme.spacing.md },
  emoji: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: theme.fontSize.xxl, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text },
  button: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.md },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
  link: { alignItems: 'center', marginTop: theme.spacing.md },
  linkText: { color: theme.colors.primary, fontSize: theme.fontSize.md },
});
