import { ListTypeConfig } from '../../config/listTypes';

const jeu_societe: ListTypeConfig = {
  type: 'jeu_societe',
  icon: '🎲',
  labelKey: 'type.jeu_societe',
  labelFr: 'Jeu de société',
  progressionType: 'plays',
  progressionLabelKey: 'entry.plays',
  progressionLabelFr: 'Parties jouées',
  statuses: ['owned', 'not_owned'],
  statusLabelKeys: {
    owned:     { key: 'status.owned',     fr: 'Possédé' },
    not_owned: { key: 'status.not_owned', fr: 'Pas possédé' },
  },
};

export default jeu_societe;