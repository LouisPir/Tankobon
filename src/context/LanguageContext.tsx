import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'back': '← Retour',
    'settings': 'Paramètres',
    'save': 'Sauvegarder 🌸',
    'cancel': 'Annuler',
    'delete': 'Supprimer',
    'confirm': 'Confirmer',
    'error': 'Erreur',
    'success': 'Succès',

    // ListsHome
    'lists.title': '🌸 Tankobon',
    'lists.search': '🔍 Rechercher une liste...',
    'lists.empty': 'Aucune liste pour l\'instant',
    'lists.empty.subtitle': 'Crée ta première liste !',
    'lists.no_results': 'Aucun résultat',
    'lists.delete.confirm': 'Es-tu sûr de vouloir supprimer cette liste et tous ses mangas ?',

    // MangaList
    'manga.search': '🔍 Rechercher un manga...',
    'manga.empty': 'Aucun manga pour l\'instant',
    'manga.empty.subtitle': 'Ajoute ton premier manga !',
    'manga.collection': '🌸 Ma Collection',
    'manga.delete.confirm': 'Es-tu sûr de vouloir supprimer ce manga ?',

    // Status
    'status.ongoing': 'EN COURS',
    'status.completed': 'TERMINÉ',
    'status.dropped': 'ABANDONNÉ',

    // AddList / EditList
    'list.name': 'Nom *',
    'list.description': 'Description',
    'list.password': 'Mot de passe 🔒',
    'list.add.title': 'Nouvelle liste',
    'list.edit.title': 'Modifier la liste',
    'list.add.button': 'Créer la liste 🌸',

    // AddManga / EditManga
    'manga.title': 'Titre *',
    'manga.status': 'Statut',
    'manga.chapter': 'Dernier chapitre lu',
    'manga.rating': 'Note',
    'manga.review': 'Mon avis',
    'manga.add.title': 'Nouveau manga',
    'manga.edit.title': 'Modifier',

    // Settings
    'settings.lists': 'Listes',
    'settings.import': 'Importer une liste',
    'settings.import.this': 'Importer dans cette liste',
    'settings.export': 'Exporter une liste',
    'settings.export.this': 'Exporter cette liste',
    'settings.edit': 'Modifier une liste',
    'settings.edit.this': 'Modifier cette liste',
    'settings.account': 'Compte',
    'settings.email': '✉️ Changer l\'email',
    'settings.password': '🔑 Changer le mot de passe',
    'settings.delete.account': '🗑️ Supprimer mon compte',
    'settings.data': 'Données',
    'settings.export.all': '📤 Exporter toutes les listes',
    'settings.delete.data': '🗑️ Supprimer toutes mes données',
    'settings.preferences': 'Préférences',
    'settings.theme': '🎨 Thème',
    'settings.language': '🌍 Langue',
    'settings.info': 'Informations',
    'settings.about': 'ℹ️ À propos',
    'settings.logout': 'Se déconnecter',
    'settings.logout.confirm': 'Es-tu sûr de vouloir te déconnecter ?',
    'settings.logout.title': 'Déconnexion',

    // Import
    'import.title': 'Importer une liste',
    'import.how': 'Comment importer ?',
    'import.new': 'Nouvelle liste',
    'import.new.subtitle': 'Créer une nouvelle liste depuis le fichier',
    'import.merge': 'Fusionner',
    'import.merge.subtitle': 'Ajouter dans une liste existante',
    'import.pick': 'Choisir un fichier',
    'import.loaded': '✅ Fichier chargé',
    'import.create': 'Créer la liste 🌸',
    'import.merge.button': 'Fusionner 🌸',
    'import.change': 'Changer de fichier',
    'import.list.name': 'Nom de la nouvelle liste *',
    'import.target': 'Fusionner dans *',
    'import.done': 'Import terminé !',
    'import.result.new': 'Nouvelle liste créée',
    'import.result.merge': 'Fusionné dans',
    'import.processed': 'Traités',
    'import.added': 'Ajoutés',
    'import.overwritten': 'Écrasés',
    'import.ignored': 'Ignorés',
    'import.duplicates': 'Doublons',
    'import.back': 'Retour aux listes 🌸',
    'import.duplicates.question': 'Doublons détectés ?',
    'import.duplicates.subtitle': 'Si des entrées du fichier existent déjà dans la liste, que faire ?',
    'import.ignore': 'Ignorer',
    'import.overwrite': 'Écraser',

    // Auth
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.logout': 'Quitter',

    // About
    'about.title': 'À propos',
    'about.description': 'Suis ta progression de lecture de mangas, anime, films et bien plus encore.',
    'about.source': '📦 Code source',
    'about.dev': '👨‍💻 Développé par',
    'about.stack': '🛠️ Stack',
    'about.footer': 'Fait avec 🌸 et beaucoup de manga',

    // Theme
    'theme.title': 'Thème',
    'theme.active': '✓ Actif',
    'theme.sakura': 'Sakura',
    'theme.ninja': 'Ninja de l\'eau',
    'theme.spicy': 'Spicy',

    // Language
    'language.title': 'Langue',
    'language.fr': '🇫🇷 Français',
    'language.en': '🇬🇧 English',

    'list.created': 'Créée le',
    'list.name_required': 'Le nom est obligatoire',
    'list.password.hint': 'Optionnel — protège l\'accès à cette liste',
    'list.password.placeholder': 'Laisser vide pour ne pas protéger',
    'manga.title_required': 'Le titre est obligatoire',
    'manga.chapter_label': 'Chapitre',
    'manga.review.placeholder': 'Qu\'as-tu pensé de ce manga ?',
    'manga.add.button': 'Ajouter 🌸',
    'lists.no_results_for': 'Pas de liste pour',
  },
  en: {
    // Navigation
    'back': '← Back',
    'settings': 'Settings',
    'save': 'Save 🌸',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'confirm': 'Confirm',
    'error': 'Error',
    'success': 'Success',

    // ListsHome
    'lists.title': '🌸 Tankobon',
    'lists.search': '🔍 Search a list...',
    'lists.empty': 'No lists yet',
    'lists.empty.subtitle': 'Create your first list!',
    'lists.no_results': 'No results',
    'lists.delete.confirm': 'Are you sure you want to delete this list and all its entries?',
    'lists.no_results_for': 'No list for',

    // MangaList
    'manga.search': '🔍 Search a manga...',
    'manga.empty': 'No manga yet',
    'manga.empty.subtitle': 'Add your first manga!',
    'manga.collection': '🌸 My Collection',
    'manga.delete.confirm': 'Are you sure you want to delete this manga?',
    
    // Status
    'status.ongoing': 'ONGOING',
    'status.completed': 'COMPLETED',
    'status.dropped': 'DROPPED',

    // AddList / EditList
    'list.name': 'Name *',
    'list.description': 'Description',
    'list.password': 'Password 🔒',
    'list.add.title': 'New list',
    'list.edit.title': 'Edit list',
    'list.add.button': 'Create list 🌸',
    'list.created': 'Created on',
    'list.name_required': 'Name is required',
    'list.password.hint': 'Optional — protects access to this list',
    'list.password.placeholder': 'Leave empty for no protection',
    

    // AddManga / EditManga
    'manga.title': 'Title *',
    'manga.status': 'Status',
    'manga.chapter': 'Last chapter read',
    'manga.rating': 'Rating',
    'manga.review': 'My review',
    'manga.add.title': 'New manga',
    'manga.edit.title': 'Edit',
    'manga.title_required': 'Title is required',
    'manga.chapter_label': 'Chapter',
    'manga.review.placeholder': 'What did you think of this manga?',
    'manga.add.button': 'Add 🌸',
    // Settings
    'settings.lists': 'Lists',
    'settings.import': 'Import a list',
    'settings.import.this': 'Import into this list',
    'settings.export': 'Export a list',
    'settings.export.this': 'Export this list',
    'settings.edit': 'Edit a list',
    'settings.edit.this': 'Edit this list',
    'settings.account': 'Account',
    'settings.email': '✉️ Change email',
    'settings.password': '🔑 Change password',
    'settings.delete.account': '🗑️ Delete my account',
    'settings.data': 'Data',
    'settings.export.all': '📤 Export all lists',
    'settings.delete.data': '🗑️ Delete all my data',
    'settings.preferences': 'Preferences',
    'settings.theme': '🎨 Theme',
    'settings.language': '🌍 Language',
    'settings.info': 'Information',
    'settings.about': 'ℹ️ About',
    'settings.logout': 'Log out',
    'settings.logout.confirm': 'Are you sure you want to log out?',
    'settings.logout.title': 'Log out',

    // Import
    'import.title': 'Import a list',
    'import.how': 'How to import?',
    'import.new': 'New list',
    'import.new.subtitle': 'Create a new list from the file',
    'import.merge': 'Merge',
    'import.merge.subtitle': 'Add to an existing list',
    'import.pick': 'Choose a file',
    'import.loaded': '✅ File loaded',
    'import.create': 'Create list 🌸',
    'import.merge.button': 'Merge 🌸',
    'import.change': 'Change file',
    'import.list.name': 'New list name *',
    'import.target': 'Merge into *',
    'import.done': 'Import done!',
    'import.result.new': 'New list created',
    'import.result.merge': 'Merged into',
    'import.processed': 'Processed',
    'import.added': 'Added',
    'import.overwritten': 'Overwritten',
    'import.ignored': 'Ignored',
    'import.duplicates': 'Duplicates',
    'import.back': 'Back to lists 🌸',
    'import.duplicates.question': 'Duplicates found?',
    'import.duplicates.subtitle': 'If entries from the file already exist in the list, what to do?',
    'import.ignore': 'Ignore',
    'import.overwrite': 'Overwrite',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.logout': 'Logout',

    // About
    'about.title': 'About',
    'about.description': 'Track your reading progress for manga, anime, movies and more.',
    'about.source': '📦 Source code',
    'about.dev': '👨‍💻 Developed by',
    'about.stack': '🛠️ Stack',
    'about.footer': 'Made with 🌸 and lots of manga',

    // Theme
    'theme.title': 'Theme',
    'theme.active': '✓ Active',
    'theme.sakura': 'Sakura',
    'theme.ninja': 'Water Ninja',
    'theme.spicy': 'Spicy',

    // Language
    'language.title': 'Language',
    'language.fr': '🇫🇷 French',
    'language.en': '🇬🇧 English',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    AsyncStorage.getItem('language').then((saved) => {
      if (saved === 'fr' || saved === 'en') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);