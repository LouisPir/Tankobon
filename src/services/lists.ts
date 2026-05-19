import { supabase } from './supabase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export type List = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  password_hash: string | null;
  created_at: string;
  manga_count?: number;
};

export const getLists = async () => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as List[];
};

export const createList = async (list: Omit<List, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('lists')
    .insert({ ...list, user_id: user?.id })
    .select()
    .single();

  if (error) throw error;
  return data as List;
};

export const updateList = async (id: string, list: Partial<List>) => {
  const { data, error } = await supabase
    .from('lists')
    .update(list)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as List;
};

export const deleteList = async (id: string) => {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const exportListToJSON = async (listId: string) => {
  // Récupère la liste
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (listError) throw listError;

  // Récupère les mangas de la liste
  const { data: mangas, error: mangasError } = await supabase
    .from('mangas')
    .select('*')
    .eq('list_id', listId);

  if (mangasError) throw mangasError;

  // Crée le JSON
  const exportData = {
    name: list.name,
    description: list.description,
    exported_at: new Date().toISOString(),
    mangas: mangas.map((m) => ({
      title: m.title,
      status: m.status,
      current_chapter: m.current_chapter,
      rating: m.rating,
      review: m.review,
    })),
  };

  // Écrit le fichier
  const fileName = `${list.name.replace(/\s/g, '_')}_${Date.now()}.json`;
  const filePath = `${(FileSystem as any).cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));

  // Partage le fichier
  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: `Exporter ${list.name}`,
  });
};