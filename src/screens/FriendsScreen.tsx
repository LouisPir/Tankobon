import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Theme } from '../config/theme';
import { unlockAndCheck } from '../services/grades';
import { useAchievementToast } from '../context/AchievementToastContext';
import { Achievement } from '../config/achievements';
import { getFriends, markAcceptedRequestsAsSeen, getPendingRequests, getSentRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getFriendCount, Friend, FriendRequest } from '../services/friends';

export const FriendsScreen = ({ onBack, onFriendPress }: {
  onBack: () => void;
  onFriendPress: (friend: Friend) => void;
}) => {
  const { theme } = useTheme();
  const { tr } = useLanguage();
  const styles = makeStyles(theme);
  const insets = useSafeAreaInsets();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [sending, setSending] = useState(false);
  const { showAchievements } = useAchievementToast();
  
  const load = async () => {
    try {
      const [f, p, s] = await Promise.all([getFriends(), getPendingRequests(), getSentRequests()]);
      setFriends(f);
      setPending(p);
      setSent(s);
      const count = f.length;
      const toUnlock = [];
      await markAcceptedRequestsAsSeen();
      if (count >= 1) toUnlock.push('soc_friend1');
      if (count >= 5) toUnlock.push('soc_friend5');
      if (toUnlock.length > 0) {
        const results = await Promise.all(toUnlock.map(id => unlockAndCheck(id)));
        const toShow = results.filter(Boolean) as Achievement[];
        if (toShow.length > 0) showAchievements(toShow);
      }
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSendRequest = async () => {
    if (!searchUsername.trim()) return;
    try {
      setSending(true);
      await sendFriendRequest(searchUsername.trim());
      setSearchUsername('');
      Alert.alert(tr('success', 'Succès'), tr('friends.request.sent', 'Demande envoyée !'));
      load();
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await load();
      const count = await getFriendCount();
      const toUnlock = ['soc_friend1'];
      if (count >= 5) toUnlock.push('soc_friend5');
      const results = await Promise.all(toUnlock.map(id => unlockAndCheck(id)));
      const toShow = results.filter(Boolean) as Achievement[];
      if (toShow.length > 0) showAchievements(toShow);
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    }
  };
  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      load();
    } catch (error: any) {
      Alert.alert(tr('error', 'Erreur'), error.message);
    }
  };

  const handleRemove = (friendId: string, username: string | null) => {
    Alert.alert(
      tr('friends.remove.title', 'Supprimer l\'ami'),
      `${tr('friends.remove.confirm', 'Supprimer')} ${username ?? '?'} ?`,
      [
        { text: tr('cancel', 'Annuler'), style: 'cancel' },
        { text: tr('friends.remove.title', 'Supprimer'), style: 'destructive', onPress: async () => {
          try {
            await removeFriend(friendId);
            load();
          } catch (error: any) {
            Alert.alert(tr('error', 'Erreur'), error.message);
          }
        }},
      ]
    );
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
        <Text style={styles.headerTitle}>{tr('friends.title', 'Amis')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}>

          {/* Ajouter un ami */}
          <Text style={styles.sectionTitle}>{tr('friends.add', 'Ajouter un ami')}</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={tr('friends.search.placeholder', 'Pseudo de l\'ami...')}
              placeholderTextColor={theme.colors.textSecondary}
              value={searchUsername}
              onChangeText={setSearchUsername}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendRequest} disabled={sending || !searchUsername.trim()}>
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendButtonText}>{tr('friends.send', 'Envoyer')}</Text>}
            </TouchableOpacity>
          </View>

          {/* Demandes reçues */}
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{tr('friends.requests.pending', 'Demandes reçues')} ({pending.length})</Text>
              <View style={styles.card}>
                {pending.map((req, index) => (
                  <View key={req.id}>
                    <View style={styles.requestRow}>
                      {renderAvatar(req.sender?.avatar ?? null)}
                      <Text style={styles.friendName}>{req.sender?.username ?? '?'}</Text>
                      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(req.id)}>
                        <Text style={styles.acceptButtonText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(req.id)}>
                        <Text style={styles.declineButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    {index < pending.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Demandes envoyées */}
          {sent.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{tr('friends.requests.sent', 'Demandes envoyées')}</Text>
              <View style={styles.card}>
                {sent.map((req, index) => (
                  <View key={req.id}>
                    <View style={styles.requestRow}>
                      {renderAvatar(req.receiver?.avatar ?? null)}
                      <Text style={styles.friendName}>{req.receiver?.username ?? '?'}</Text>
                      <Text style={styles.pendingBadge}>{tr('friends.pending', 'En attente')}</Text>
                    </View>
                    {index < sent.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Liste d'amis */}
          <Text style={styles.sectionTitle}>{tr('friends.list', 'Mes amis')} ({friends.length})</Text>
          {friends.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>{tr('friends.empty', 'Tu n\'as pas encore d\'amis. Recherche un pseudo pour commencer !')}</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {friends.map((friend, index) => (
                <View key={friend.id}>
                  <TouchableOpacity style={styles.friendRow} onPress={() => onFriendPress(friend)}>
                    {renderAvatar(friend.avatar)}
                    <Text style={styles.friendName}>{friend.username ?? '?'}</Text>
                    <TouchableOpacity onPress={() => handleRemove(friend.id, friend.username)}>
                      <Text style={styles.removeText}>{tr('friends.remove', 'Retirer')}</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {index < friends.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
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
  headerTitle: { fontSize: theme.fontSize.lg, fontWeight: 'bold', color: theme.colors.text },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: theme.spacing.lg, gap: theme.spacing.md },
  sectionTitle: {
    fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm,
  },
  searchRow: { flexDirection: 'row', gap: theme.spacing.sm },
  searchInput: {
    flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, padding: theme.spacing.md, fontSize: theme.fontSize.md, color: theme.colors.text,
  },
  sendButton: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md, justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: '600', fontSize: theme.fontSize.md },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md,
    borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden',
  },
  requestRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  friendName: { flex: 1, fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
  acceptButton: {
    backgroundColor: theme.colors.success, borderRadius: theme.borderRadius.full,
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
  },
  acceptButtonText: { color: '#fff', fontWeight: 'bold' },
  declineButton: {
    backgroundColor: theme.colors.border, borderRadius: theme.borderRadius.full,
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
  },
  declineButtonText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  pendingBadge: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, fontStyle: 'italic' },
  removeText: { fontSize: theme.fontSize.sm, color: '#E53935' },
  separator: { height: 1, backgroundColor: theme.colors.border, marginLeft: theme.spacing.md },
  emptyCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});