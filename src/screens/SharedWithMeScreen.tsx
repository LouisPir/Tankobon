import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getListsSharedWithMe, SharedList } from '../services/sharedLists';
import { getListTypeConfig } from '../config/listTypes';

export const SharedWithMeScreen = ({ onBack, onSelectList }: {
  onBack: () => void;
  onSelectList: (sharedList: SharedList) => void;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListsSharedWithMe()
      .then((data) => {
        console.log(JSON.stringify(data, null, 2));
        setSharedLists(data);
      })
      .catch((error: any) => Alert.alert(tr('error', 'Erreur'), error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr('shared.title', 'Partagées avec moi')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : sharedLists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>{tr('shared.empty', 'Aucune liste partagée avec toi pour l\'instant.')}</Text>
        </View>
      ) : (
        <FlatList
          data={sharedLists}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + theme.spacing.lg }]}
          renderItem={({ item }) => {
            const config = item.list ? getListTypeConfig(item.list.type) : null;
            const owner = item.owner as any;
            return (
              <TouchableOpacity style={styles.listCard} onPress={() => onSelectList(item)}>
                <View style={styles.listCardHeader}>
                  <Text style={styles.listCardIcon}>{config?.icon ?? '📋'}</Text>
                  <View style={styles.listCardInfo}>
                    <Text style={styles.listCardName} numberOfLines={1}>{item.list?.name ?? '?'}</Text>
                    <View style={styles.ownerRow}>
                      {owner?.avatar ? (
                        <Image source={{ uri: owner.avatar }} style={styles.ownerAvatar} />
                      ) : null}
                      <Text style={styles.ownerName}>{owner?.username ?? '?'}</Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
  list: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  listCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md,
  },
  listCardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  listCardIcon: { fontSize: theme.fontSize.xl },
  listCardInfo: { flex: 1, gap: 4 },
  listCardName: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  ownerAvatar: { width: 16, height: 16, borderRadius: 8 },
  ownerName: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  arrow: { fontSize: theme.fontSize.xl, color: theme.colors.textSecondary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.xl },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});