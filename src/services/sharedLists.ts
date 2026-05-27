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
    .select('*, list:lists(*), owner:profiles!owner_id(username, avatar)')
    .eq('shared_with_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SharedList[];
};

export const getMySharedLists = async (): Promise<SharedList[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('shared_lists')
    .select('*, list:lists(*), shared_with:profiles!shared_with_id(username, avatar)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SharedList[];
};