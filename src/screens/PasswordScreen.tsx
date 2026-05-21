import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../config/theme';

export const PasswordScreen = ({
  listName,
  onConfirm,
  onCancel,
  subtitle,
  confirmText,
  title,
}: {
  listName: string;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  subtitle?: string;
  confirmText?: string;
  title?: string;
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const handleConfirm = () => {
    if (!password.trim()) return;
    setLoading(true);
    onConfirm(password.trim());
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>{title ?? 'Liste protégée'}</Text>
        <Text style={styles.subtitle}>
          {subtitle ?? `Entrez le mot de passe pour accéder à `}
          {!subtitle && <Text style={styles.listName}>{listName}</Text>}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Mot de passe..."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoFocus
        />

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={loading || !password.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>{confirmText ?? 'Accéder'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  listName: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: theme.spacing.sm,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});