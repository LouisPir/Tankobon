export type AchievementCategory = 'quantity' | 'completion' | 'rating' | 'lists' | 'diversity' | 'app' | 'import_export';

export type Achievement = {
  id: string;
  category: AchievementCategory;
  labelKey: string;
  labelFr: string;
  descriptionKey: string;
  descriptionFr: string;
  points: number;
  icon: string;
};

export type Grade = {
  name: string;
  nameKey: string;
  icon: string;
  minPoints: number;
};

export const GRADES: Grade[] = [
  { name: 'Bronze',   nameKey: 'grade.bronze',   icon: '🥉', minPoints: 0    },
  { name: 'Silver',   nameKey: 'grade.silver',   icon: '🥈', minPoints: 250  },
  { name: 'Gold',     nameKey: 'grade.gold',     icon: '🥇', minPoints: 500  },
  { name: 'Platinum', nameKey: 'grade.platinum', icon: '💠', minPoints: 750  },
  { name: 'Diamond',  nameKey: 'grade.diamond',  icon: '💎', minPoints: 1000 },
  { name: 'Mythique', nameKey: 'grade.mythic',   icon: '🌟', minPoints: 1250 },
];

export const getGrade = (points: number): Grade => {
  return [...GRADES].reverse().find(g => points >= g.minPoints) ?? GRADES[0];
};

export const ACHIEVEMENTS: Achievement[] = [
  // Quantité
  { id: 'qty_1',    category: 'quantity',   icon: '📖', points: 10,  labelKey: 'ach.qty1.label',    labelFr: 'Première entrée',      descriptionKey: 'ach.qty1.desc',    descriptionFr: 'Ajouter 1 entrée dans une liste' },
  { id: 'qty_10',   category: 'quantity',   icon: '📚', points: 20,  labelKey: 'ach.qty10.label',   labelFr: 'Collectionneur',        descriptionKey: 'ach.qty10.desc',   descriptionFr: '10 entrées dans une liste' },
  { id: 'qty_50',   category: 'quantity',   icon: '🗃️', points: 50,  labelKey: 'ach.qty50.label',   labelFr: 'Passionné',             descriptionKey: 'ach.qty50.desc',   descriptionFr: '50 entrées dans une liste' },
  { id: 'qty_100',  category: 'quantity',   icon: '🏛️', points: 100, labelKey: 'ach.qty100.label',  labelFr: 'Obsessionnel',          descriptionKey: 'ach.qty100.desc',  descriptionFr: '100 entrées dans une liste' },
  { id: 'qty_500',  category: 'quantity',   icon: '👑', points: 200, labelKey: 'ach.qty500.label',  labelFr: 'Légende',               descriptionKey: 'ach.qty500.desc',  descriptionFr: '500 entrées dans une liste' },
  { id: 'qty_1000', category: 'quantity',   icon: '🌌', points: 500, labelKey: 'ach.qty1000.label', labelFr: 'Divin',                 descriptionKey: 'ach.qty1000.desc', descriptionFr: '1000 entrées dans une liste' },

  // Complétion
  { id: 'cmp_1',    category: 'completion', icon: '✅', points: 10,  labelKey: 'ach.cmp1.label',    labelFr: 'Premier finish',        descriptionKey: 'ach.cmp1.desc',    descriptionFr: 'Compléter 1 entrée' },
  { id: 'cmp_50p',  category: 'completion', icon: '📈', points: 30,  labelKey: 'ach.cmp50p.label',  labelFr: 'Sur la bonne voie',     descriptionKey: 'ach.cmp50p.desc',  descriptionFr: '50% complétés dans une liste (min 10 entrées)' },
  { id: 'cmp_100p', category: 'completion', icon: '🏆', points: 100, labelKey: 'ach.cmp100p.label', labelFr: 'Perfectionniste',       descriptionKey: 'ach.cmp100p.desc', descriptionFr: '100% complétés dans une liste (min 20 entrées)' },

  // Notes
  { id: 'rat_10',   category: 'rating',     icon: '🖊️', points: 20,  labelKey: 'ach.rat10.label',   labelFr: 'Critique',              descriptionKey: 'ach.rat10.desc',   descriptionFr: 'Noter 10 entrées dans une liste' },
  { id: 'rat_low',  category: 'rating',     icon: '😤', points: 20,  labelKey: 'ach.ratlow.label',  labelFr: 'Difficile à impressionner', descriptionKey: 'ach.ratlow.desc', descriptionFr: 'Moyenne ≤ 2 sur une liste (min 5 notées)' },
  { id: 'rat_high', category: 'rating',     icon: '🤩', points: 20,  labelKey: 'ach.rathigh.label', labelFr: 'Fan absolu',             descriptionKey: 'ach.rathigh.desc', descriptionFr: 'Moyenne ≥ 4.5 sur une liste (min 5 notées)' },
  { id: 'rat_5s',   category: 'rating',     icon: '💫', points: 30,  labelKey: 'ach.rat5s.label',   labelFr: 'Coup de cœur',          descriptionKey: 'ach.rat5s.desc',   descriptionFr: '5 entrées notées 5★ dans une liste' },

  // Listes
  { id: 'lst_5',    category: 'lists',      icon: '🗂️', points: 50,  labelKey: 'ach.lst5.label',    labelFr: 'Organisé',              descriptionKey: 'ach.lst5.desc',    descriptionFr: '5 listes avec min 25 entrées chacune' },
  { id: 'lst_10',   category: 'lists',      icon: '🗄️', points: 100, labelKey: 'ach.lst10.label',   labelFr: 'Maniaque',              descriptionKey: 'ach.lst10.desc',   descriptionFr: '10 listes avec min 25 entrées chacune' },

  // Diversité
  { id: 'div_3',    category: 'diversity',  icon: '🌍', points: 30,  labelKey: 'ach.div3.label',    labelFr: 'Explorateur',           descriptionKey: 'ach.div3.desc',    descriptionFr: 'Utiliser 3 types de listes différents' },
  { id: 'div_5',    category: 'diversity',  icon: '🌐', points: 60,  labelKey: 'ach.div5.label',    labelFr: 'Touche-à-tout',         descriptionKey: 'ach.div5.desc',    descriptionFr: 'Utiliser 5 types de listes différents' },
  { id: 'div_8',    category: 'diversity',  icon: '🏅', points: 100, labelKey: 'ach.div8.label',    labelFr: 'Collectionneur universel', descriptionKey: 'ach.div8.desc',  descriptionFr: 'Utiliser les 8 types de listes' },

  // App
  { id: 'app_lang', category: 'app',        icon: '🌏', points: 10,  labelKey: 'ach.applang.label', labelFr: 'Polyglotte',            descriptionKey: 'ach.applang.desc', descriptionFr: "Changer la langue de l'app" },
  { id: 'app_thm',  category: 'app',        icon: '🎨', points: 10,  labelKey: 'ach.appthm.label',  labelFr: 'Personnalisé',          descriptionKey: 'ach.appthm.desc',  descriptionFr: "Changer le thème de l'app" },
  { id: 'app_ref',  category: 'app',        icon: '🤝', points: 50,  labelKey: 'ach.appref.label',  labelFr: 'Parrain',               descriptionKey: 'ach.appref.desc',  descriptionFr: 'Parrainer un ami' },
  
  // Import/Export
  { id: 'ie_export1',  category: 'import_export', icon: '📤', points: 10, labelKey: 'ach.ie_export1.label',  labelFr: 'Première exportation',    descriptionKey: 'ach.ie_export1.desc',  descriptionFr: 'Exporter une liste pour la première fois' },
  { id: 'ie_import1',  category: 'import_export', icon: '📥', points: 10, labelKey: 'ach.ie_import1.label',  labelFr: 'Première importation',    descriptionKey: 'ach.ie_import1.desc',  descriptionFr: 'Importer une liste pour la première fois' },
  { id: 'ie_export5',  category: 'import_export', icon: '🗺️', points: 30, labelKey: 'ach.ie_export5.label',  labelFr: 'Collectionneur nomade',   descriptionKey: 'ach.ie_export5.desc',  descriptionFr: 'Exporter 5 listes' },
  { id: 'ie_exportall',category: 'import_export', icon: '🗄️', points: 20, labelKey: 'ach.ie_exportall.label',labelFr: 'Archiviste',              descriptionKey: 'ach.ie_exportall.desc',descriptionFr: 'Exporter toutes ses listes en une seule fois' },
];

export const TOTAL_POINTS = ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);