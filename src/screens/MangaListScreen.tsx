import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { theme } from '../config/theme';
import { getMangas, deleteManga, Manga } from '../services/manga';

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    ongoing: { label: 'EN COURS', color: theme.colors.primary },
    completed: { label: 'TERMINÉ', color: theme.colors.success },
    dropped: { label: 'ABANDONNÉ', color: theme.colors.textSecondary },
  };

  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.ongoing;

  return (
    <View style={[styles.badge, { borderColor: config.color }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const MangaCard = ({
  manga,
  onDelete,
  onPress,
}: {
  manga: Manga;
  onDelete: (id: string) => void;
  onPress: (manga: Manga) => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(manga)}>
    <View style={styles.cardCover}>
      <Text style={styles.cardEmoji}>📖</Text>
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle}>{manga.title.toUpperCase()}</Text>
      <Text style={styles.cardChapter}>Chapitre {manga.current_chapter}</Text>
      <StatusBadge status={manga.status} />
      {manga.rating && (
        <Text style={styles.cardRating}>{'⭐'.repeat(manga.rating)}</Text>
      )}
    </View>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(manga.id)}
    >
      <Text style={styles.deleteText}>🗑️</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

export const MangaListScreen = ({ onSelectManga }: { onSelectManga: (manga: Manga) => void }) => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMangas = async () => {
    try {
      const data = await getMangas();
      setMangas(data);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Es-tu sûr de vouloir supprimer ce manga ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteManga(id);
              setMangas((prev) => prev.filter((m) => m.id !== id));
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌸 Ma Collection</Text>
        <Text style={styles.headerCount}>{mangas.length} manga{mangas.length > 1 ? 's' : ''}</Text>
      </View>

      {mangas.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌸</Text>
          <Text style={styles.emptyTitle}>Aucun manga pour l'instant</Text>
          <Text style={styles.emptySubtitle}>Ajoute ton premier manga !</Text>
        </View>
      ) : (
        <FlatList
          data={mangas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MangaCard
              manga={item}
              onDelete={handleDelete}
              onPress={onSelectManga}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerCount: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  cardCover: {
    width: 56,
    height: 80,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardChapter: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardRating: {
    fontSize: theme.fontSize.sm,
    marginTop: 4,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  deleteText: {
    fontSize: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});