import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MangaListScreen } from '../screens/MangaListScreen';
import { AddMangaScreen } from '../screens/AddMangaScreen';
import { EditMangaScreen } from '../screens/EditMangaScreen';
import { MangaDetailScreen } from '../screens/MangaDetailScreen';
import { Manga } from '../services/manga';

type Screen =
  | 'Home'
  | 'MangaList'
  | 'AddManga'
  | 'EditManga'
  | 'MangaDetail';

export const Navigation = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('Home');
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D4547A" />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        {screen === 'Home' ? (
          <LoginScreen onGoToRegister={() => setScreen('MangaList')} />
        ) : (
          <RegisterScreen onGoToLogin={() => setScreen('Home')} />
        )}
      </NavigationContainer>
    );
  }

  if (screen === 'AddManga') {
    return (
      <AddMangaScreen
        onBack={() => setScreen('MangaList')}
        onSuccess={() => setScreen('MangaList')}
      />
    );
  }

  if (screen === 'EditManga' && selectedManga) {
    return (
      <EditMangaScreen
        manga={selectedManga}
        onBack={() => setScreen('MangaDetail')}
        onSuccess={() => {
          setScreen('MangaList');
          setSelectedManga(null);
        }}
      />
    );
  }

  if (screen === 'MangaDetail' && selectedManga) {
    return (
      <MangaDetailScreen
        manga={selectedManga}
        onBack={() => setScreen('MangaList')}
        onEdit={() => setScreen('EditManga')}
      />
    );
  }

  if (screen === 'MangaList') {
    return (
      <MangaListScreen
        onSelectManga={(manga) => {
          setSelectedManga(manga);
          setScreen('MangaDetail');
        }}
        onAddManga={() => setScreen('AddManga')}
      />
    );
  }

  return (
    <HomeScreen onGoToList={() => setScreen('MangaList')} />
  );
};