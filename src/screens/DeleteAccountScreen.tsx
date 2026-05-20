import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { theme } from '../config/theme';
import { supabase } from '../services/supabase';
import { logout } from '../services/auth';

export const DeleteAccountScreen = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm !== 'SUPPRIMER') {
      Alert.alert('Erreur', 'Tape SUPPRIMER pour confirmer');
      return;
    }

    Alert.alert(
      '⚠️ Suppression définitive',
      'Toutes tes listes, mangas et données seront supprimés. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Supprime toutes les données
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('Utilisateur non connecté');

              // Supprime les mangas, listes (cascade RLS)
              await supabase.from('mangas').delete().eq('user_id', user.id);
              await supabase.from('lists').delete().eq('user_id', user.id);

              // Déconnecte
              await logout();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
              setLoading(false);
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
        <Text style={styles.headerTitle}>Supprimer le compte</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.warningEmoji}>⚠️</Text>
        <Text style={styles.warningTitle}>Action irréversible</Text>
        <Text style={styles.warningText}>
          La suppression de ton compte entraînera la perte définitive de :
        </Text>

        <View style={styles.list}>
          <Text style={styles.listItem}>• Toutes tes listes</Text>
          <Text style={styles.listItem}>• Tous tes mangas et leur progression</Text>
          <Text style={styles.listItem}>• Toutes tes notes et avis</Text>
          <Text style={styles.listItem}>• Ton compte utilisateur</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Tape <Text style={styles.confirmWord}>SUPPRIMER</Text> pour confirmer
          </Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="SUPPRIMER"
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            (confirm !== 'SUPPRIMER' || loading) && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={confirm !== 'SUPPRIMER' || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  content: { padding: theme.spacing.lg, gap: theme.spacing.lg, alignItems: 'center' },
  warningEmoji: { fontSize: 64 },
  warningTitle: { fontSize: theme.fontSize.xl, fontWeight: 'bold', color: '#E53935' },
  warningText: { fontSize: theme.fontSize.md, color: theme.colors.text, textAlign: 'center' },
  list: { width: '100%', gap: theme.spacing.sm },
  listItem: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  field: { width: '100%', gap: theme.spacing.sm },
  label: { fontSize: theme.fontSize.md, color: theme.colors.text },
  confirmWord: { fontWeight: 'bold', color: '#E53935' },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: '#E53935',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  deleteButtonDisabled: { opacity: 0.4 },
  deleteButtonText: { color: '#fff', fontSize: theme.fontSize.lg, fontWeight: 'bold' },
});