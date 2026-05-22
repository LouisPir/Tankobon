import { ListTypeConfig } from '../../config/listTypes';

const livre: ListTypeConfig = {
  type: 'livre',
  icon: '📚',
  labelKey: 'type.livre',
  labelFr: 'Livre',
  progressionType: 'pages',
  progressionLabelKey: 'entry.page',
  progressionLabelFr: 'Page',
  statuses: ['ongoing', 'completed', 'dropped'],
  statusLabelKeys: {
    ongoing:   { key: 'status.ongoing',   fr: 'En cours' },
    completed: { key: 'status.completed', fr: 'Terminé' },
    dropped:   { key: 'status.dropped',   fr: 'Abandonné' },
  },
};

export default livre;