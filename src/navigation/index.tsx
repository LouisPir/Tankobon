import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ListsHomeScreen } from '../screens/ListsHomeScreen';
import { AddListScreen } from '../screens/AddListScreen';
import { EditListScreen } from '../screens/EditListScreen';
import { MangaListScreen } from '../screens/MangaListScreen';
import { AddMangaScreen } from '../screens/AddMangaScreen';
import { EditMangaScreen } from '../screens/EditMangaScreen';
import { MangaDetailScreen } from '../screens/MangaDetailScreen';
import { Manga } from '../services/manga';
import { deleteList, List } from '../services/lists';
import { PasswordScreen } from '../screens/PasswordScreen';
import { ImportListScreen } from '../screens/ImportListScreen';
import { ImportResultScreen } from '../screens/ImportResultScreen';
import { ImportResult } from '../services/lists';

type Screen =
  | 'Auth'
  | 'Register'
  | 'ListsHome'
  | 'AddList'
  | 'EditList'
  | 'ImportList'
  | 'ImportResult'
  | 'Password'
  | 'MangaList'
  | 'AddManga'
  | 'EditManga'
  | 'MangaDetail';

export const Navigation = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('ListsHome');
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [pendingList, setPendingList] = useState<List | null>(null);
  const [passwordMode, setPasswordMode] = useState<'access' | 'delete'>('access');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importMode, setImportMode] = useState<'new' | 'merge'>('new');
  const [importTargetName, setImportTargetName] = useState('');

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
        {screen === 'Register' ? (
          <RegisterScreen onGoToLogin={() => setScreen('Auth')} />
        ) : (
          <LoginScreen onGoToRegister={() => setScreen('Register')} />
        )}
      </NavigationContainer>
    );
  }

  if (screen === 'AddList') {
    return (
      <AddListScreen
        onBack={() => setScreen('ListsHome')}
        onSuccess={() => setScreen('ListsHome')}
      />
    );
  }
  if (screen === 'ImportList') {
    return (
      <ImportListScreen
        onBack={() => setScreen('ListsHome')}
        onSuccess={(result, mode, targetListName) => {
          setImportResult(result);
          setImportMode(mode);
          setImportTargetName(targetListName);
          setScreen('ImportResult');
        }}
      />
    );
  }
  if (screen === 'ImportResult' && importResult) {
    return (
      <ImportResultScreen
        result={importResult}
        mode={importMode}
        targetListName={importTargetName}
        onDone={() => {
          setImportResult(null);
          setScreen('ListsHome');
        }}
      />
    );
  }
  if (screen === 'EditList' && selectedList) {
    return (
      <EditListScreen
        list={selectedList}
        onBack={() => setScreen('MangaList')}
        onSuccess={() => {
          setScreen('ListsHome');
          setSelectedList(null);
        }}
      />
    );
  }

  if (screen === 'MangaList' && selectedList) {
    return (
      <MangaListScreen
        listId={selectedList.id}
        onSelectManga={(manga) => {
          setSelectedManga(manga);
          setScreen('MangaDetail');
        }}
        onAddManga={() => setScreen('AddManga')}
        onBack={() => setScreen('ListsHome')}
        onEditList={() => setScreen('EditList')}
      />
    );
  }

  if (screen === 'AddManga' && selectedList) {
    return (
      <AddMangaScreen
        listId={selectedList.id}
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

  if (screen === 'Password' && pendingList) {
    return (
      <PasswordScreen
        listName={pendingList.name}
        onCancel={() => {
          setScreen('ListsHome');
          setPendingList(null);
        }}
        onConfirm={async (password) => {
          if (password === pendingList.password_hash) {
            if (passwordMode === 'access') {
              setSelectedList(pendingList);
              setPendingList(null);
              setScreen('MangaList');
            } else {
              try {
                await deleteList(pendingList.id);
                setPendingList(null);
                setScreen('ListsHome');
              } catch (error: any) {
                Alert.alert('Erreur', error.message);
              }
            }
          } else {
            Alert.alert('Erreur', 'Mot de passe incorrect');
          }
        }}
      />
    );
  }

  return (
    <ListsHomeScreen
      onSelectList={(list) => {
        if (list.password_hash) {
          setPendingList(list);
          setPasswordMode('access');
          setScreen('Password');
        } else {
          setSelectedList(list);
          setScreen('MangaList');
        }
      }}
      onAddList={() => setScreen('AddList')}
      onDeleteProtected={(list) => {
        setPendingList(list);
        setPasswordMode('delete');
        setScreen('Password');
      }}
      onImportList={() => setScreen('ImportList')}
    />
  );
}