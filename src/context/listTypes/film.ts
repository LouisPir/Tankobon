import { ListTypeConfig } from '../../config/listTypes';

const film: ListTypeConfig = {
  type: 'film',
  icon: '🎬',
  labelKey: 'type.film',
  labelFr: 'Film',
  progressionType: 'none',
  progressionLabelKey: null,
  progressionLabelFr: null,
  statuses: ['seen', 'not_seen'],
  statusLabelKeys: {
    seen:     { key: 'status.seen',     fr: 'Vu' },
    not_seen: { key: 'status.not_seen', fr: 'Pas vu' },
  },
};

export default film;