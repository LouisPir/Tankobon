import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { getFriends, Friend } from '../services/friends';
import { shareListWithFriend, unshareList, getMySharedLists, SharedList } from '../services/sharedLists';
import { List } from '../services/lists';

export const ShareListScreen = ({ onBack, list }: {
  onBack: () => void;
  list: List;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [sharedWith, setSharedWith] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    try {
      const [f, s] = await Promise.all([
        getFriends(),
        getMySharedLists(),
      ]);
      setFriends(f);
      setSharedWith(s.filter(sl => sl.list_id === list.id));
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isSharedWith = (friendId: string) => sharedWith.some(s => s.shared_with_id === friendId);

  const handleShare = async (friendId: string) => {
    try {
      setActionLoading(friendId);
      await shareListWithFriend(list.id, friendId);
      await load();
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnshare = async (friendId: string) => {
    try {
      setActionLoading(friendId);
      await unshareList(list.id, friendId);
      await load();
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderAvatar = (avatar: string | null, size = 40) => {
    if (avatar) {
      return <Image source={{ uri: avatar }} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: theme.colors.primary }} />;
    }
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.4, color: theme.colors.textSecondary }}>?</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>{tr('back', '← Retour')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{list.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

          {friends.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>{tr('share.no.friends', 'Tu n\'as pas encore d\'amis à qui partager cette liste.')}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>{tr('share.with', 'Partager avec')}</Text>
              <View style={styles.card}>
                {friends.map((friend, index) => {
                  const shared = isSharedWith(friend.id);
                  const isLoading = actionLoading === friend.id;
                  return (
                    <View key={friend.id}>
                      <View style={styles.friendRow}>
                        {renderAvatar(friend.avatar)}
                        <Text style={styles.friendName}>{friend.username ?? '?'}</Text>
                        {isLoading ? (
                          <ActivityIndicator color={theme.colors.primary} size="small" />
                        ) : shared ? (
                          <TouchableOpacity style={styles.unshareButton} onPress={() => handleUnshare(friend.id)}>
                            <Text style={styles.unshareButtonText}>{tr('share.remove', 'Retirer')}</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={styles.shareButton} onPress={() => handleShare(friend.id)}>
                            <Text style={styles.shareButtonText}>{tr('share.add', 'Partager')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {index < friends.length - 1 && <View style={styles.separator} />}
                    </View>
                  );
                })}
              </View>
            </>
          )}

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
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text, flex: 1, textAlign: 'center' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  friendName: { flex: 1, fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  shareButton: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm,
  },
  shareButtonText: { color: '#fff', fontWeight: '600', fontSize: theme.fontSize.sm },
  unshareButton: {
    backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  unshareButtonText: { color: '#E53935', fontWeight: '600', fontSize: theme.fontSize.sm },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  emptyCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});