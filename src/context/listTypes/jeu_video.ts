import { ListTypeConfig } from '../../config/listTypes';

const jeu_video: ListTypeConfig = {
  type: 'jeu_video',
  icon: '🎮',
  labelKey: 'type.jeu_video',
  labelFr: 'Jeu vidéo',
  progressionType: 'hours',
  progressionLabelKey: 'entry.hours',
  progressionLabelFr: 'Heures jouées',
  statuses: ['playing', 'completed', 'dropped'],
  statusLabelKeys: {
    playing:   { key: 'status.playing',   fr: 'En cours' },
    completed: { key: 'status.completed', fr: 'Terminé' },
    dropped:   { key: 'status.dropped',   fr: 'Abandonné' },
  },
};

export default jeu_video;