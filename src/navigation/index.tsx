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
import { deleteList, List, ImportResult } from '../services/lists';
import { PasswordScreen } from '../screens/PasswordScreen';
import { ImportListScreen } from '../screens/ImportListScreen';
import { ImportResultScreen } from '../screens/ImportResultScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ExportListScreen } from '../screens/ExportListScreen';
import { SelectListScreen } from '../screens/SelectListScreen';

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
  | 'MangaDetail'
  | 'Settings'
  | 'ExportList'
  | 'SelectList';

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
  const [settingsFrom, setSettingsFrom] = useState<'ListsHome' | 'MangaList'>('ListsHome');

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D4547A" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          {screen === 'Register' ? (
            <RegisterScreen onGoToLogin={() => setScreen('Auth')} />
          ) : (
            <LoginScreen onGoToRegister={() => setScreen('Register')} />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  if (screen === 'Settings') {
    return (
      <SafeAreaProvider>
        <SettingsScreen
          onBack={() => setScreen(settingsFrom)}
          selectedList={selectedList ?? undefined}
          onImportList={() => setScreen('ImportList')}
          onExportList={() => setScreen('ExportList')}
          onEditList={() => {
            if (selectedList) {
              setScreen('EditList');
            } else {
              setScreen('SelectList');
            }
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'SelectList') {
    return (
      <SafeAreaProvider>
        <SelectListScreen
          onBack={() => setScreen('Settings')}
          onSelectList={(list) => {
            setSelectedList(list);
            setScreen('EditList');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'ExportList') {
    return (
      <SafeAreaProvider>
        <ExportListScreen
          onBack={() => setScreen('Settings')}
          preselectedList={selectedList ?? undefined}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'ImportList') {
    return (
      <SafeAreaProvider>
        <ImportListScreen
          onBack={() => setScreen('Settings')}
          preselectedList={selectedList ?? undefined}
          onSuccess={(result, mode, targetListName) => {
            setImportResult(result);
            setImportMode(mode);
            setImportTargetName(targetListName);
            setScreen('ImportResult');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'ImportResult' && importResult) {
    return (
      <SafeAreaProvider>
        <ImportResultScreen
          result={importResult}
          mode={importMode}
          targetListName={importTargetName}
          onDone={() => {
            setImportResult(null);
            setScreen(settingsFrom);
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'AddList') {
    return (
      <SafeAreaProvider>
        <AddListScreen
          onBack={() => setScreen('ListsHome')}
          onSuccess={() => setScreen('ListsHome')}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'EditList' && selectedList) {
    return (
      <SafeAreaProvider>
        <EditListScreen
          list={selectedList}
          onBack={() => setScreen('Settings')}
          onSuccess={() => {
            setScreen(settingsFrom);
            if (settingsFrom === 'ListsHome') setSelectedList(null);
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'MangaList' && selectedList) {
    return (
      <SafeAreaProvider>
        <MangaListScreen
          listId={selectedList.id}
          onSelectManga={(manga) => {
            setSelectedManga(manga);
            setScreen('MangaDetail');
          }}
          onAddManga={() => setScreen('AddManga')}
          onBack={() => setScreen('ListsHome')}
          onSettings={() => {
            setSettingsFrom('MangaList');
            setScreen('Settings');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'AddManga' && selectedList) {
    return (
      <SafeAreaProvider>
        <AddMangaScreen
          listId={selectedList.id}
          onBack={() => setScreen('MangaList')}
          onSuccess={() => setScreen('MangaList')}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'EditManga' && selectedManga) {
    return (
      <SafeAreaProvider>
        <EditMangaScreen
          manga={selectedManga}
          onBack={() => setScreen('MangaDetail')}
          onSuccess={() => {
            setScreen('MangaList');
            setSelectedManga(null);
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'MangaDetail' && selectedManga) {
    return (
      <SafeAreaProvider>
        <MangaDetailScreen
          manga={selectedManga}
          onBack={() => setScreen('MangaList')}
          onEdit={() => setScreen('EditManga')}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'Password' && pendingList) {
    return (
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
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
        onSettings={() => {
          setSelectedList(null);
          setSettingsFrom('ListsHome');
          setScreen('Settings');
        }}
      />
    </SafeAreaProvider>
  );
};