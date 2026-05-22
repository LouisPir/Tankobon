import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ListsHomeScreen } from '../screens/ListsHomeScreen';
import { AddListScreen } from '../screens/AddListScreen';
import { EditListScreen } from '../screens/EditListScreen';
import { EntryListScreen } from '../screens/EntryListScreen';
import { AddEntryScreen } from '../screens/AddEntryScreen';
import { EditEntryScreen } from '../screens/EditEntryScreen';
import { EntryDetailScreen } from '../screens/EntryDetailScreen';
import { Entry } from '../services/entries';
import { deleteList, List, ImportResult, exportAllListsToJSON, deleteAllUserData } from '../services/lists';
import { PasswordScreen } from '../screens/PasswordScreen';
import { ImportListScreen } from '../screens/ImportListScreen';
import { ImportResultScreen } from '../screens/ImportResultScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ExportListScreen } from '../screens/ExportListScreen';
import { SelectListScreen } from '../screens/SelectListScreen';
import { ChangeEmailScreen } from '../screens/ChangeEmailScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { supabase } from '../services/supabase';
import { logout } from '../services/auth';
import { AboutScreen } from '../screens/AboutScreen';
import { ThemeScreen } from '../screens/ThemeScreen';
import { LanguageScreen } from '../screens/LanguageScreen';
import { ReferralScreen } from '../screens/ReferralScreen';

type Screen =
  | 'Auth'
  | 'Register'
  | 'ListsHome'
  | 'AddList'
  | 'EditList'
  | 'ImportList'
  | 'Referral'
  | 'ImportResult'
  | 'Password'
  | 'EntryList'
  | 'AddEntry'
  | 'EditEntry'
  | 'EntryDetail'
  | 'Settings'
  | 'ExportList'
  | 'ChangeEmail'
  | 'ChangePassword'
  | 'DeleteAccount'
  | 'PasswordAccount'
  | 'About'
  | 'Theme'
  | 'Language'
  | 'SelectList';
  
  

export const Navigation = () => {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('ListsHome');
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [pendingList, setPendingList] = useState<List | null>(null);
  const [passwordMode, setPasswordMode] = useState<'access' | 'delete'>('access');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importMode, setImportMode] = useState<'new' | 'merge'>('new');
  const [importTargetName, setImportTargetName] = useState('');
  const [settingsFrom, setSettingsFrom] = useState<'ListsHome' | 'EntryList'>('ListsHome');
  const [accountPasswordMode, setAccountPasswordMode] = useState<'deleteAccount' | 'deleteData'>('deleteAccount');

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
          onChangeEmail={() => setScreen('ChangeEmail')}
          onChangePassword={() => setScreen('ChangePassword')}
          onTheme={() => setScreen('Theme')}
          onAbout={() => setScreen('About')}
          onLanguage={() => setScreen('Language')}
          onReferral={() => setScreen('Referral')}
          onEditList={() => {
            if (selectedList) {
              setScreen('EditList');
            } else {
              setScreen('SelectList');
            }
          }}
          onExportAllLists={async () => {
            try {
              await exportAllListsToJSON();
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }}
          onDeleteAccount={() => {
            setAccountPasswordMode('deleteAccount');
            setScreen('PasswordAccount');
          }}
          onDeleteAllData={() => {
            setAccountPasswordMode('deleteData');
            setScreen('PasswordAccount');
          }}
        />
      </SafeAreaProvider>
    );
  }
  if (screen === 'Theme') {
    return (
      <SafeAreaProvider>
        <ThemeScreen onBack={() => setScreen('Settings')} />
      </SafeAreaProvider>
    );
  }
  if (screen === 'Language') {
    return (
      <SafeAreaProvider>
        <LanguageScreen onBack={() => setScreen('Settings')} />
      </SafeAreaProvider>
    );
  }
  if (screen === 'Referral') {
    return (
      <SafeAreaProvider>
        <ReferralScreen onBack={() => setScreen('Settings')} />
      </SafeAreaProvider>
    );
  }
  if (screen === 'ChangeEmail') {
    return (
      <SafeAreaProvider>
        <ChangeEmailScreen
          onBack={() => setScreen('Settings')}
          onSuccess={() => setScreen('Settings')}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'ChangePassword') {
    return (
      <SafeAreaProvider>
        <ChangePasswordScreen
          onBack={() => setScreen('Settings')}
          onSuccess={() => setScreen('Settings')}
        />
      </SafeAreaProvider>
    );
  }
  if (screen === 'About') {
    return (
      <SafeAreaProvider>
        <AboutScreen onBack={() => setScreen('Settings')} />
      </SafeAreaProvider>
    );
  }

  if (screen === 'PasswordAccount') {
    return (
      <SafeAreaProvider>
        <PasswordScreen
          listName={accountPasswordMode === 'deleteAccount' ? 'ton compte' : 'toutes tes données'}
          subtitle={
            accountPasswordMode === 'deleteAccount'
              ? 'Confirme ton mot de passe pour supprimer définitivement ton compte.'
              : 'Confirme ton mot de passe pour supprimer toutes tes données.'
          }
          title={accountPasswordMode === 'deleteAccount' ? 'Supprimer le compte' : 'Supprimer les données'}
          confirmText="Confirmer"
          onCancel={() => setScreen('Settings')}
          onConfirm={async (password) => {
            if (accountPasswordMode === 'deleteAccount') {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Utilisateur non connecté');

                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email: user.email!,
                  password,
                });
                if (signInError) {
                  Alert.alert('Erreur', 'Mot de passe incorrect');
                  return;
                }
                const { data: { session } } = await supabase.auth.getSession();
                const { error: fnError } = await supabase.functions.invoke('delete-account', {
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                  },
                });
                if (fnError) throw fnError;

                await logout();
              } catch (error: any) {
                Alert.alert('Erreur', error.message);
              }
            } else {
              try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) throw new Error('Utilisateur non connecté');

                const { error } = await supabase.auth.signInWithPassword({
                  email: user.email!,
                  password,
                });
                if (error) {
                  Alert.alert('Erreur', 'Mot de passe incorrect');
                  return;
                }

                await deleteAllUserData();
                Alert.alert('Succès', 'Toutes tes données ont été supprimées.');
                setScreen('Settings');
              } catch (error: any) {
                Alert.alert('Erreur', error.message);
              }
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

  if (screen === 'EntryList' && selectedList) {
    return (
      <SafeAreaProvider>
        <EntryListScreen
          listId={selectedList.id}
          listType={selectedList.type}
          onSelectEntry={(entry) => {
            setSelectedEntry(entry);
            setScreen('EntryDetail');
          }}
          onAddEntry={() => setScreen('AddEntry')}
          onBack={() => setScreen('ListsHome')}
          onSettings={() => {
            setSettingsFrom('EntryList');
            setScreen('Settings');
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'AddEntry' && selectedList) {
    return (
      <SafeAreaProvider>
        <AddEntryScreen
          listId={selectedList.id}
          listType={selectedList.type}
          onBack={() => setScreen('EntryList')}
          onSuccess={() => setScreen('EntryList')}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'EditEntry' && selectedEntry) {
    return (
      <SafeAreaProvider>
        <EditEntryScreen
          entry={selectedEntry}
          listType={selectedList!.type}
          onBack={() => setScreen('EntryDetail')}
          onSuccess={() => {
            setScreen('EntryList');
            setSelectedEntry(null);
          }}
        />
      </SafeAreaProvider>
    );
  }

  if (screen === 'EntryDetail' && selectedEntry) {
    return (
      <SafeAreaProvider>
        <EntryDetailScreen
          entry={selectedEntry}
          listType={selectedList!.type}
          onBack={() => setScreen('EntryList')}
          onEdit={() => setScreen('EditEntry')}
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
                setScreen('EntryList');
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
            setScreen('EntryList');
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