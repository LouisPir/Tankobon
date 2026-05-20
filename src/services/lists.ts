import { supabase } from './supabase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';


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


export type ImportedManga = {
  title: string;
  status: string;
  current_chapter: number;
  rating: number | null;
  review: string | null;
};

export type ImportedList = {
  name: string;
  description: string | null;
  mangas: ImportedManga[];
};

export const pickJSONFile = async (): Promise<ImportedList | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const parsed = JSON.parse(content);

  return parsed as ImportedList;
};

export const importListAsNew = async (data: ImportedList, name: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  // Crée la liste
  const { data: list, error: listError } = await supabase
    .from('lists')
    .insert({
      name,
      description: data.description,
      user_id: user?.id,
    })
    .select()
    .single();

  if (listError) throw listError;

  // Ajoute les mangas
  if (data.mangas.length > 0) {
    const { error: mangasError } = await supabase
      .from('mangas')
      .insert(
        data.mangas.map((m) => ({
          ...m,
          list_id: list.id,
          user_id: user?.id,
        }))
      );

    if (mangasError) throw mangasError;
  }

  return list;
};

export type DuplicateBehavior = 'ignore' | 'overwrite';

export type ImportResult = {
  added: string[];
  duplicates: string[];
  overwritten: string[];
};

export const mergeImportIntoList = async (
  data: ImportedList,
  listId: string,
  behavior: DuplicateBehavior
): Promise<ImportResult> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: existing, error: fetchError } = await supabase
    .from('mangas')
    .select('id, title')
    .eq('list_id', listId);

  if (fetchError) throw fetchError;

  const existingMap = new Map(existing.map((m) => [m.title.toLowerCase(), m.id]));

  const toInsert: ImportedManga[] = [];
  const toOverwrite: { id: string; manga: ImportedManga }[] = [];
  const duplicateTitles: string[] = [];
  const addedTitles: string[] = [];
  const overwrittenTitles: string[] = [];

  for (const manga of data.mangas) {
    const existingId = existingMap.get(manga.title.toLowerCase());
    if (existingId) {
      duplicateTitles.push(manga.title);
      if (behavior === 'overwrite') toOverwrite.push({ id: existingId, manga });
    } else {
      toInsert.push(manga);
      addedTitles.push(manga.title);
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from('mangas')
      .insert(toInsert.map((m) => ({ ...m, list_id: listId, user_id: user?.id })));
    if (error) throw error;
  }

  for (const { id, manga } of toOverwrite) {
    const { error } = await supabase
      .from('mangas')
      .update({
        status: manga.status,
        current_chapter: manga.current_chapter,
        rating: manga.rating,
        review: manga.review,
      })
      .eq('id', id);
    if (error) throw error;
    overwrittenTitles.push(manga.title);
  }

  return { added: addedTitles, duplicates: duplicateTitles, overwritten: overwrittenTitles };
};