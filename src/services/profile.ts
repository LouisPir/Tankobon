import { supabase } from './supabase';

export type Profile = {
  id: string;
  username: string | null;
  avatar: string | null;
  referral_code: string;
  referred_by: string | null;
  export_count: number;
  created_at: string;
};

export const getProfile = async (): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (updates: { username?: string; avatar?: string }): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error;
};

export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  return !!data;
};