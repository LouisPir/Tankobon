import { supabase } from './supabase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { ListType } from '../config/listTypes';

export type List = {
  id: string;
  user_id: string;
  name: string;
  type: ListType;
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
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (listError) throw listError;

  const { data: mangas, error: mangasError } = await supabase
    .from('mangas')
    .select('*')
    .eq('list_id', listId);

  if (mangasError) throw mangasError;

  const exportData = {
    name: list.name,
    type: list.type,
    description: list.description,
    exported_at: new Date().toISOString(),
    mangas: mangas.map((m) => ({
      title: m.title,
      status: m.status,
      current_chapter: m.current_chapter,
      current_season: m.current_season,
      rating: m.rating,
      review: m.review,
    })),
  };

  const fileName = `${list.name.replace(/\s+/g, '_')}.json`;
  const filePath = `${(FileSystem as any).cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: `Exporter ${list.name}`,
  });
};

export type ImportedEntry = {
  title: string;
  status: string;
  current_chapter: number;
  current_season: number;
  rating: number | null;
  review: string | null;
};

export type ImportedList = {
  name: string;
  type?: ListType;
  description: string | null;
  mangas: ImportedEntry[];
};

export const pickAndParseJSONFile = async (): Promise<any | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
  return JSON.parse(content);
};

export const importListAsNew = async (data: ImportedList, name: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: list, error: listError } = await supabase
    .from('lists')
    .insert({
      name,
      type: data.type ?? 'manga',
      description: data.description,
      user_id: user?.id,
    })
    .select()
    .single();

  if (listError) throw listError;

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

  const toInsert: ImportedEntry[] = [];
  const toOverwrite: { id: string; entry: ImportedEntry }[] = [];
  const duplicateTitles: string[] = [];
  const addedTitles: string[] = [];
  const overwrittenTitles: string[] = [];

  for (const entry of data.mangas) {
    const existingId = existingMap.get(entry.title.toLowerCase());
    if (existingId) {
      duplicateTitles.push(entry.title);
      if (behavior === 'overwrite') toOverwrite.push({ id: existingId, entry });
    } else {
      toInsert.push(entry);
      addedTitles.push(entry.title);
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from('mangas')
      .insert(toInsert.map((m) => ({ ...m, list_id: listId, user_id: user?.id })));
    if (error) throw error;
  }

  for (const { id, entry } of toOverwrite) {
    const { error } = await supabase
      .from('mangas')
      .update({
        status: entry.status,
        current_chapter: entry.current_chapter,
        current_season: entry.current_season,
        rating: entry.rating,
        review: entry.review,
      })
      .eq('id', id);
    if (error) throw error;
    overwrittenTitles.push(entry.title);
  }

  return { added: addedTitles, duplicates: duplicateTitles, overwritten: overwrittenTitles };
};

export const exportAllListsToJSON = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (listsError) throw listsError;

  const { data: mangas, error: mangasError } = await supabase
    .from('mangas')
    .select('*')
    .eq('user_id', user?.id);

  if (mangasError) throw mangasError;

  const exportData = {
    exported_at: new Date().toISOString(),
    lists: lists.map((list) => ({
      name: list.name,
      type: list.type,
      description: list.description,
      mangas: mangas
        .filter((m) => m.list_id === list.id)
        .map((m) => ({
          title: m.title,
          status: m.status,
          current_chapter: m.current_chapter,
          current_season: m.current_season,
          rating: m.rating,
          review: m.review,
        })),
    })),
  };

  const fileName = `Tankobon_listes.json`;
  const filePath = `${(FileSystem as any).cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));

  await Sharing.shareAsync(filePath, {
    mimeType: 'application/json',
    dialogTitle: 'Exporter toutes les listes',
  });
};

export const deleteAllUserData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { error: mangasError } = await supabase
    .from('mangas')
    .delete()
    .eq('user_id', user.id);

  if (mangasError) throw mangasError;

  const { error: listsError } = await supabase
    .from('lists')
    .delete()
    .eq('user_id', user.id);

  if (listsError) throw listsError;
};

export type ExportedAllLists = {
  exported_at: string;
  lists: ImportedList[];
};

export const isMultiListFile = (parsed: any): parsed is ExportedAllLists => {
  return Array.isArray(parsed.lists);
};

export const importAllListsFromJSON = async (data: ExportedAllLists): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: existingLists, error: fetchError } = await supabase
    .from('lists')
    .select('name')
    .eq('user_id', user?.id);

  if (fetchError) throw fetchError;

  const existingNames = new Set(existingLists.map((l) => l.name.toLowerCase()));

  const getUniqueName = (name: string): string => {
    if (!existingNames.has(name.toLowerCase())) return name;
    let i = 2;
    while (existingNames.has(`${name} (${i})`.toLowerCase())) i++;
    return `${name} (${i})`;
  };

  let count = 0;
  for (const list of data.lists) {
    const uniqueName = getUniqueName(list.name);
    existingNames.add(uniqueName.toLowerCase());

    const { data: createdList, error: listError } = await supabase
      .from('lists')
      .insert({
        name: uniqueName,
        type: list.type ?? 'manga',
        description: list.description,
        user_id: user?.id,
      })
      .select()
      .single();

    if (listError) throw listError;

    if (list.mangas.length > 0) {
      const { error } = await supabase
        .from('mangas')
        .insert(list.mangas.map((m) => ({ ...m, list_id: createdList.id, user_id: user?.id })));
      if (error) throw error;
    }
    count++;
  }
  return count;
};