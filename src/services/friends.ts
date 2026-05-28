import { supabase } from './supabase';

export type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender?: { username: string | null; avatar: string | null };
  receiver?: { username: string | null; avatar: string | null };
};

export type Friend = {
  id: string;
  username: string | null;
  avatar: string | null;
};

export const sendFriendRequest = async (username: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data: target, error: targetError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (targetError || !target) throw new Error('Utilisateur introuvable');
  if (target.id === user.id) throw new Error('Tu ne peux pas t\'ajouter toi-même');

  const { error } = await supabase
    .from('friend_requests')
    .insert({ sender_id: user.id, receiver_id: target.id });

  if (error) {
    if (error.code === '23505') throw new Error('Une demande existe déjà avec cet utilisateur');
    throw error;
  }
};

export const getPendingRequests = async (): Promise<FriendRequest[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const senderIds = data.map(r => r.sender_id);
  if (senderIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', senderIds);

  return data.map(r => ({
    ...r,
    sender: profiles?.find(p => p.id === r.sender_id) ?? null,
  }));
};

export const getSentRequests = async (): Promise<FriendRequest[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('sender_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const receiverIds = data.map(r => r.receiver_id);
  if (receiverIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', receiverIds);

  return data.map(r => ({
    ...r,
    receiver: profiles?.find(p => p.id === r.receiver_id) ?? null,
  }));
};

export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (error) throw error;
};

export const declineFriendRequest = async (requestId: string): Promise<void> => {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'declined' })
    .eq('id', requestId);

  if (error) throw error;
};

export const removeFriend = async (friendId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`);

  if (error) throw error;
};

export const getFriends = async (): Promise<Friend[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id')
    .eq('status', 'accepted')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const friendIds = data.map(row =>
    row.sender_id === user.id ? row.receiver_id : row.sender_id
  );

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', friendIds);

  return (profiles ?? []).map(p => ({
    id: p.id,
    username: p.username,
    avatar: p.avatar,
  }));
};

export const getFriendCount = async (): Promise<number> => {
  const friends = await getFriends();
  return friends.length;
};

export type FriendStats = {
  totalLists: number;
  totalEntries: number;
  totalCompleted: number;
};

export const getFriendStats = async (friendId: string): Promise<FriendStats> => {
  const { data, error } = await supabase.rpc('get_friend_stats', { friend_id: friendId });
  if (error) throw error;
  return data as FriendStats;
};

export const getFriendAchievements = async (friendId: string): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_friend_achievements', { friend_id: friendId });
  if (error) throw error;
  return (data as string[]) ?? [];
};

export const getFriendFriendCount = async (friendId: string): Promise<number> => {
  const { data, error } = await supabase.rpc('get_friend_count', { friend_id: friendId });
  if (error) throw error;
  return data as number;
};

export const getPendingRequestCount = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('friend_requests')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('status', 'pending');

  if (error) return 0;
  return count ?? 0;
};