import { supabase } from './supabase';
import { ACHIEVEMENTS, Achievement, getGrade, Grade } from '../config/achievements';

export type UnlockedAchievement = {
  achievement: Achievement;
  unlockedAt: string;
};

export type GradeResult = {
  grade: Grade;
  totalPoints: number;
  unlocked: UnlockedAchievement[];
  locked: Achievement[];
  newlyUnlocked: Achievement[];
};

const computeUnlockedIds = async (userId: string): Promise<Set<string>> => {
  const unlockedIds = new Set<string>();

  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select('id, type')
    .eq('user_id', userId);
  if (listsError) throw listsError;

  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('list_id, status, rating')
    .eq('user_id', userId);
  if (entriesError) throw entriesError;

  // Quantité
  const listEntryCounts = new Map<string, number>();
  for (const entry of entries) {
    listEntryCounts.set(entry.list_id, (listEntryCounts.get(entry.list_id) ?? 0) + 1);
  }
  const maxCount = Math.max(0, ...listEntryCounts.values());
  if (maxCount >= 1)    unlockedIds.add('qty_1');
  if (maxCount >= 10)   unlockedIds.add('qty_10');
  if (maxCount >= 50)   unlockedIds.add('qty_50');
  if (maxCount >= 100)  unlockedIds.add('qty_100');
  if (maxCount >= 500)  unlockedIds.add('qty_500');
  if (maxCount >= 1000) unlockedIds.add('qty_1000');

  // Complétion
  const completedStatuses = ['completed', 'seen'];
  for (const [listId, total] of listEntryCounts.entries()) {
    const listEntries = entries.filter(e => e.list_id === listId);
    const completed = listEntries.filter(e => completedStatuses.includes(e.status)).length;
    if (completed >= 1) unlockedIds.add('cmp_1');
    if (total >= 10 && completed / total >= 0.5) unlockedIds.add('cmp_50p');
    if (total >= 20 && completed / total === 1)  unlockedIds.add('cmp_100p');
  }

  // Notes
  for (const [listId] of listEntryCounts.entries()) {
    const listEntries = entries.filter(e => e.list_id === listId);
    const rated = listEntries.filter(e => e.rating !== null);
    if (rated.length >= 10) unlockedIds.add('rat_10');
    if (rated.length >= 5) {
      const avg = rated.reduce((s, e) => s + e.rating!, 0) / rated.length;
      if (avg <= 2)   unlockedIds.add('rat_low');
      if (avg >= 4.5) unlockedIds.add('rat_high');
    }
    const fiveStars = listEntries.filter(e => e.rating === 5).length;
    if (fiveStars >= 5) unlockedIds.add('rat_5s');
  }

  // Listes
  const listsWithMin25 = lists.filter(l => (listEntryCounts.get(l.id) ?? 0) >= 25).length;
  if (listsWithMin25 >= 5)  unlockedIds.add('lst_5');
  if (listsWithMin25 >= 10) unlockedIds.add('lst_10');

  // Diversité
  const uniqueTypes = new Set(lists.map(l => l.type)).size;
  if (uniqueTypes >= 3) unlockedIds.add('div_3');
  if (uniqueTypes >= 5) unlockedIds.add('div_5');
  if (uniqueTypes >= 8) unlockedIds.add('div_8');

  return unlockedIds;
};

export const computeGrades = async (forceUnlock: string[] = []): Promise<GradeResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilisateur non connecté');

  // Récupérer les achievements déjà en DB
  const { data: dbAchievements, error: dbError } = await supabase
    .from('user_achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', user.id);
  if (dbError) throw dbError;

  const dbUnlockedMap = new Map(dbAchievements.map(a => [a.achievement_id, a.unlocked_at]));

  // Calculer les achievements débloqués depuis les données
  const computedIds = await computeUnlockedIds(user.id);

  // Achievements app (app_lang, app_thm, app_ref) — uniquement depuis la DB
  const appIds = ['app_lang', 'app_thm', 'app_ref', 'ie_export1', 'ie_import1', 'ie_export5', 'ie_exportall'];
  for (const id of appIds) {
    if (dbUnlockedMap.has(id)) computedIds.add(id);
  }

  // Persister les nouveaux achievements en DB
  const newIds = [...computedIds].filter(id => !dbUnlockedMap.has(id));
  if (newIds.length > 0) {
    await supabase.from('user_achievements').insert(
      newIds.map(achievement_id => ({ user_id: user.id, achievement_id }))
    );
    // Ajouter la date actuelle pour les nouveaux
    const now = new Date().toISOString();
    for (const id of newIds) dbUnlockedMap.set(id, now);
  }

  // Construire le résultat
  const unlocked: UnlockedAchievement[] = ACHIEVEMENTS
    .filter(a => computedIds.has(a.id))
    .map(a => ({ achievement: a, unlockedAt: dbUnlockedMap.get(a.id)! }));

  const locked = ACHIEVEMENTS.filter(a => !computedIds.has(a.id));
  const totalPoints = unlocked.reduce((sum, u) => sum + u.achievement.points, 0);

  return {
    grade: getGrade(totalPoints),
    totalPoints,
    unlocked,
    locked,
    newlyUnlocked: newIds.map(id => ACHIEVEMENTS.find(a => a.id === id)!).filter(Boolean),
  };
};

export const unlockAchievement = async (achievementId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('user_achievements')
    .insert({ user_id: user.id, achievement_id: achievementId })
    .select();
    // Le unique constraint évite les doublons silencieusement
};
export const incrementExportCount = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.rpc('increment_export_count', { user_id: user.id });
  const { data: profile } = await supabase
    .from('profiles')
    .select('export_count')
    .eq('id', user.id)
    .single();
  if ((profile?.export_count ?? 0) >= 5) await unlockAchievement('ie_export5');
};
export const unlockAndCheck = async (achievementId: string): Promise<Achievement | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', user.id)
    .eq('achievement_id', achievementId)
    .single();

  if (existing) return null; // déjà unlocked

  await supabase
    .from('user_achievements')
    .insert({ user_id: user.id, achievement_id: achievementId });

  return ACHIEVEMENTS.find(a => a.id === achievementId) ?? null;
};