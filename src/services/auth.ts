import { supabase } from './supabase';

export const register = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const updateEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const deleteAccount = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Supprime toutes les données utilisateur (cascade via RLS)
  const { error } = await supabase.rpc('delete_user');
  if (error) throw error;
};

export const getReferralCode = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data?.referral_code ?? null;
};

export const validateReferralCode = async (code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code.toUpperCase())
    .single();

  if (error) return false;
  return !!data;
};

export const getUserCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count ?? 0;
};

export const loginWithUsernameOrEmail = async (usernameOrEmail: string, password: string) => {
  const isEmail = usernameOrEmail.includes('@');
  
  if (isEmail) {
    return await login(usernameOrEmail.trim(), password);
  }

  const { data: resolvedEmail, error } = await supabase
    .rpc('get_email_by_username', { p_username: usernameOrEmail.trim() });

  console.log('resolvedEmail:', resolvedEmail, 'error:', error);
  if (error || !resolvedEmail) throw new Error('Utilisateur introuvable');

  return await login(resolvedEmail, password);
};