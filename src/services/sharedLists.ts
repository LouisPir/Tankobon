import { supabase } from './supabase';
import { List } from './lists';

export type SharedList = {
  id: string;
  list_id: string;
  owner_id: string;
  shared_with_id: string;
  created_at: string;
  list?: List;
  owner?: { username: string | null; avatar: string | null };
};

export const shareListWithFriend = async (listId: string, friendId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { error } = await supabase
    .from('shared_lists')
    .insert({ list_id: listId, owner_id: user.id, shared_with_id: friendId });

  if (error) {
    if (error.code === '23505') throw new Error('Cette liste est déjà partagée avec cet ami');
    throw error;
  }
};

export const unshareList = async (listId: string, friendId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { error } = await supabase
    .from('shared_lists')
    .delete()
    .eq('list_id', listId)
    .eq('owner_id', user.id)
    .eq('shared_with_id', friendId);

  if (error) throw error;
};
export const getListsSharedWithMe = async (): Promise<SharedList[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('shared_lists')
    .select('*')
    .eq('shared_with_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const listIds = data.map(r => r.list_id);
  const ownerIds = data.map(r => r.owner_id);

  // Fonction SQL sécurisée pour lire les listes des amis
  const { data: lists } = await supabase
    .rpc('get_shared_lists_details', { list_ids: listIds });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', ownerIds);

  return data.map(r => ({
    ...r,
    list: lists?.find((l: any) => l.id === r.list_id) ?? null,
    owner: profiles?.find(p => p.id === r.owner_id) ?? null,
  }));
};

export const getMySharedLists = async (): Promise<SharedList[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('shared_lists')
    .select('*, list:lists(*)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const sharedWithIds = data.map(r => r.shared_with_id);
  if (sharedWithIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar')
    .in('id', sharedWithIds);

  return data.map(r => ({
    ...r,
    shared_with: profiles?.find(p => p.id === r.shared_with_id) ?? null,
  }));
};

export const getUnseenSharedListCount = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('shared_lists')
    .select('*', { count: 'exact', head: true })
    .eq('shared_with_id', user.id)
    .eq('seen', false);

  if (error) return 0;
  return count ?? 0;
};

export const markAllSharedListsAsSeen = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('shared_lists')
    .update({ seen: true })
    .eq('shared_with_id', user.id)
    .eq('seen', false);
};