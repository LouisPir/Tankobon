import { ListTypeConfig } from '../../config/listTypes';

const serie: ListTypeConfig = {
  type: 'serie',
  icon: '📺',
  labelKey: 'type.serie',
  labelFr: 'Série',
  progressionType: 'season_episode',
  progressionLabelKey: 'entry.episode',
  progressionLabelFr: 'Épisode',
  statuses: ['ongoing', 'completed', 'dropped'],
  statusLabelKeys: {
    ongoing:   { key: 'status.ongoing',   fr: 'En cours' },
    completed: { key: 'status.completed', fr: 'Terminé' },
    dropped:   { key: 'status.dropped',   fr: 'Abandonné' },
  },
};

export default serie;