import { supabase } from './supabase';
import { ListType, getListTypeConfig } from '../config/listTypes';

export type BarData = { label: string; count: number };

export type ListStat = {
  listId: string;
  listName: string;
  listType: ListType;
  totalEntries: number;
  completedEntries: number;
  statusBreakdown: Record<string, number>;
  averageRating: number | null;
  ratingBars: BarData[];
  progressionBars: BarData[] | null;
};

export type GlobalStats = {
  totalEntries: number;
  totalLists: number;
  totalCompleted: number;
  byType: Partial<Record<ListType, number>>;
  lists: ListStat[];
};

export const getProgressionBars = (
  entries: { current_chapter: number; current_season: number }[],
  progressionType: string
): BarData[] | null => {
  if (progressionType === 'none') return null;

  if (progressionType === 'chapter') {
    const thresholds = [
      { label: '0',       test: (v: number) => v === 0 },
      { label: '1-50',    test: (v: number) => v >= 1 && v <= 50 },
      { label: '51-100',  test: (v: number) => v >= 51 && v <= 100 },
      { label: '101-150', test: (v: number) => v >= 101 && v <= 150 },
      { label: '151-200', test: (v: number) => v >= 151 && v <= 200 },
      { label: '200+',    test: (v: number) => v > 200 },
    ];
    return thresholds.map(t => ({ label: t.label, count: entries.filter(e => t.test(e.current_chapter)).length }));
  }

  if (progressionType === 'pages') {
    const thresholds = [
      { label: '0',      test: (v: number) => v === 0 },
      { label: '1-100',  test: (v: number) => v >= 1 && v <= 100 },
      { label: '101-200',test: (v: number) => v >= 101 && v <= 200 },
      { label: '201-300',test: (v: number) => v >= 201 && v <= 300 },
      { label: '301-400',test: (v: number) => v >= 301 && v <= 400 },
      { label: '400+',   test: (v: number) => v > 400 },
    ];
    return thresholds.map(t => ({ label: t.label, count: entries.filter(e => t.test(e.current_chapter)).length }));
  }

  if (progressionType === 'hours') {
    const thresholds = [
      { label: '0h',    test: (v: number) => v === 0 },
      { label: '1-10h', test: (v: number) => v >= 1 && v <= 10 },
      { label: '11-30h',test: (v: number) => v >= 11 && v <= 30 },
      { label: '31-60h',test: (v: number) => v >= 31 && v <= 60 },
      { label: '60h+',  test: (v: number) => v > 60 },
    ];
    return thresholds.map(t => ({ label: t.label, count: entries.filter(e => t.test(e.current_chapter)).length }));
  }

  if (progressionType === 'season_episode') {
    const thresholds = [
      { label: 'S1', test: (s: number) => s === 1 },
      { label: 'S2', test: (s: number) => s === 2 },
      { label: 'S3', test: (s: number) => s === 3 },
      { label: 'S4+', test: (s: number) => s >= 4 },
    ];
    return thresholds.map(t => ({ label: t.label, count: entries.filter(e => t.test(e.current_season)).length }));
  }

  if (progressionType === 'plays') {
    const thresholds = [
      { label: '0',   test: (v: number) => v === 0 },
      { label: '1-5', test: (v: number) => v >= 1 && v <= 5 },
      { label: '6-20',test: (v: number) => v >= 6 && v <= 20 },
      { label: '20+', test: (v: number) => v > 20 },
    ];
    return thresholds.map(t => ({ label: t.label, count: entries.filter(e => t.test(e.current_chapter)).length }));
  }

  return null;
};

export const getListStats = async (listId: string, listName: string, listType: ListType): Promise<ListStat> => {
  const { data: entries, error } = await supabase
    .from('entries')
    .select('status, rating, current_chapter, current_season')
    .eq('list_id', listId);

  if (error) throw error;

  const statusBreakdown: Record<string, number> = {};
  for (const entry of entries) {
    statusBreakdown[entry.status] = (statusBreakdown[entry.status] ?? 0) + 1;
  }

  const rated = entries.filter((e) => e.rating !== null);
  const averageRating =
    rated.length > 0
      ? Math.round((rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length) * 10) / 10
      : null;

  const completedEntries = entries.filter(e =>
    e.status === 'completed' || e.status === 'seen'
  ).length;

  const ratingBars: BarData[] = [
    { label: '—', count: entries.filter(e => e.rating === null).length },
    ...[1, 2, 3, 4, 5].map(n => ({ label: `${n}★`, count: entries.filter(e => e.rating === n).length })),
  ];

  const config = getListTypeConfig(listType);
  const progressionBars = getProgressionBars(entries, config.progressionType);

  return {
    listId,
    listName,
    listType,
    totalEntries: entries.length,
    completedEntries,
    statusBreakdown,
    averageRating,
    ratingBars,
    progressionBars,
  };
};

export const getGlobalStats = async (): Promise<GlobalStats> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lists, error: listsError } = await supabase
    .from('lists')
    .select('id, name, type')
    .eq('user_id', user?.id);

  if (listsError) throw listsError;

  const { data: entries, error: entriesError } = await supabase
    .from('entries')
    .select('list_id, status, rating, current_chapter, current_season')
    .eq('user_id', user?.id);

  if (entriesError) throw entriesError;

  const byType: Partial<Record<ListType, number>> = {};
  const listStats: ListStat[] = [];

  for (const list of lists) {
    const listEntries = entries.filter((e) => e.list_id === list.id);

    const statusBreakdown: Record<string, number> = {};
    for (const entry of listEntries) {
      statusBreakdown[entry.status] = (statusBreakdown[entry.status] ?? 0) + 1;
    }

    const rated = listEntries.filter((e) => e.rating !== null);
    const averageRating =
      rated.length > 0
        ? Math.round((rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length) * 10) / 10
        : null;

    const completedEntries = listEntries.filter(e =>
      e.status === 'completed' || e.status === 'seen'
    ).length;

    const ratingBars: BarData[] = [
      { label: '—', count: listEntries.filter(e => e.rating === null).length },
      ...[1, 2, 3, 4, 5].map(n => ({ label: `${n}★`, count: listEntries.filter(e => e.rating === n).length })),
    ];

    const config = getListTypeConfig(list.type as ListType);
    const progressionBars = getProgressionBars(listEntries, config.progressionType);

    byType[list.type as ListType] = (byType[list.type as ListType] ?? 0) + listEntries.length;

    listStats.push({
      listId: list.id,
      listName: list.name,
      listType: list.type as ListType,
      totalEntries: listEntries.length,
      completedEntries,
      statusBreakdown,
      averageRating,
      ratingBars,
      progressionBars,
    });
  }

  const totalCompleted = entries.filter(e =>
    e.status === 'completed' || e.status === 'seen'
  ).length;

  return {
    totalEntries: entries.length,
    totalLists: lists.length,
    totalCompleted,
    byType,
    lists: listStats,
  };
};
export type MonthData = { monthIndex: number; count: number };

export const getEntriesPerMonth = async (): Promise<MonthData[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: entries, error } = await supabase
    .from('entries')
    .select('created_at')
    .eq('user_id', user?.id);

  if (error) throw error;

  const now = new Date();
  const months: MonthData[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = entries.filter(e => {
      const d = new Date(e.created_at);
      return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
    }).length;

    months.push({ monthIndex: date.getMonth(), count });
  }

  return months;
};