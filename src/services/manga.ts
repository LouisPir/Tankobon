import { supabase } from './supabase';

export type MangaStatus = 'ongoing' | 'completed' | 'dropped';

export type Manga = {
  id: string;
  user_id: string;
  list_id: string;
  title: string;
  status: MangaStatus;
  current_chapter: number;
  rating: number | null;
  review: string | null;
  created_at: string;
};

export const getMangas = async (listId: string) => {
  const { data, error } = await supabase
    .from('mangas')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Manga[];
};

export const addManga = async (manga: Omit<Manga, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('mangas')
    .insert({ ...manga, user_id: user?.id })
    .select()
    .single();

  if (error) throw error;
  return data as Manga;
};

export const updateManga = async (id: string, manga: Partial<Manga>) => {
  const { data, error } = await supabase
    .from('mangas')
    .update(manga)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Manga;
};

export const deleteManga = async (id: string) => {
  const { error } = await supabase
    .from('mangas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};