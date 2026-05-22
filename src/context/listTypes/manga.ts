import { ListTypeConfig } from '../../config/listTypes';

const manga: ListTypeConfig = {
  type: 'manga',
  icon: '📖',
  labelKey: 'type.manga',
  labelFr: 'Manga',
  progressionType: 'chapter',
  progressionLabelKey: 'entry.chapter',
  progressionLabelFr: 'Chapitre',
  statuses: ['ongoing', 'completed', 'dropped'],
  statusLabelKeys: {
    ongoing:   { key: 'status.ongoing',   fr: 'En cours' },
    completed: { key: 'status.completed', fr: 'Terminé' },
    dropped:   { key: 'status.dropped',   fr: 'Abandonné' },
  },
};

export default manga;