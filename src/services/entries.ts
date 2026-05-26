import { supabase } from './supabase';
import { EntryStatus } from '../config/listTypes';

export type Entry = {
  id: string;
  user_id: string;
  list_id: string;
  title: string;
  status: EntryStatus;
  current_chapter: number;
  current_season: number;
  rating: number | null;
  review: string | null;
  created_at: string;
};

export const getEntries = async (listId: string) => {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Entry[];
};

export const addEntry = async (entry: Omit<Entry, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('entries')
    .insert({ ...entry, user_id: user?.id })
    .select()
    .single();

  if (error) throw error;
  return data as Entry;
};

export const updateEntry = async (id: string, entry: Partial<Entry>) => {
  const { data, error } = await supabase
    .from('entries')
    .update(entry)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Entry;
};

export const deleteEntry = async (id: string) => {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
};