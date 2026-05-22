import manga from '../context/listTypes/manga';
import anime from '../context/listTypes/anime';
import film from '../context/listTypes/film';
import serie from '../context/listTypes/serie';
import jeu_video from '../context/listTypes/jeu_video';
import livre from '../context/listTypes/livre';
import musique from '../context/listTypes/musique';
import jeu_societe from '../context/listTypes/jeu_societe';

export type ListType =
  | 'manga'
  | 'anime'
  | 'film'
  | 'serie'
  | 'jeu_video'
  | 'livre'
  | 'musique'
  | 'jeu_societe';

export type EntryStatus =
  | 'ongoing'
  | 'completed'
  | 'dropped'
  | 'seen'
  | 'not_seen'
  | 'playing'
  | 'owned'
  | 'not_owned';

export type ProgressionType =
  | 'chapter'
  | 'season_episode'
  | 'hours'
  | 'pages'
  | 'plays'
  | 'none';

export type ListTypeConfig = {
  type: ListType;
  icon: string;
  labelKey: string;
  labelFr: string;
  progressionType: ProgressionType;
  progressionLabelKey: string | null;
  progressionLabelFr: string | null;
  statuses: EntryStatus[];
  statusLabelKeys: Partial<Record<EntryStatus, { key: string; fr: string }>>;
};

export const LIST_TYPES: Record<ListType, ListTypeConfig> = {
  manga, anime, film, serie, jeu_video, livre, musique, jeu_societe,
};

export const getListTypeConfig = (type: ListType): ListTypeConfig =>
  LIST_TYPES[type] ?? LIST_TYPES.manga;

export const getListTypeIcon = (type: ListType): string =>
  getListTypeConfig(type).icon;

export const getDefaultStatus = (type: ListType): EntryStatus =>
  getListTypeConfig(type).statuses[0] ?? 'ongoing';