import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ListsHomeScreen } from '../screens/ListsHomeScreen';
import { AddListScreen } from '../screens/AddListScreen';
import { ShareListScreen } from '../screens/ShareListScreen';
import { SharedWithMeScreen } from '../screens/SharedWithMeScreen';
import { FriendProfileScreen } from '../screens/FriendProfileScreen';
import { SharedEntryListScreen } from '../screens/SharedEntryListScreen';
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
import { Friend } from '../services/friends';
import { StatsScreen } from '../screens/StatsScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { AchievementToastProvider, useAchievementToast } from '../context/AchievementToastContext';
import { AchievementToast } from '../components/AchievementToast';
import { unlockAndCheck, computeGrades } from '../services/grades';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { SharedList } from '../services/sharedLists';

type Screen =
  | 'Auth'
  | 'Register'
  | 'ListsHome'
  | 'AddList'
  | 'EditList'
  | 'ShareList'
  | 'SharedWithMe'
  | 'SharedEntryList'
  | 'ImportList'
  | 'Referral'
  | 'ImportResult'
  | 'FriendProfile'
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
  | 'Stats'
  | 'Profile'
  | 'Achievements'
  | 'Friends'
  | 'SelectList';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { current, onHide } = useAchievementToast();
  const [screen, setScreen] = useState<Screen>('ListsHome');
  const [selectedSharedList, setSelectedSharedList] = useState<SharedList | null>(null);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [pendingList, setPendingList] = useState<List | null>(null);
  const [passwordMode, setPasswordMode] = useState<'access' | 'delete'>('access');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importMode, setImportMode] = useState<'new' | 'merge'>('new');
  const [importTargetName, setImportTargetName] = useState('');
  const [settingsFrom, setSettingsFrom] = useState<'ListsHome' | 'EntryList'>('ListsHome');
  const [accountPasswordMode, setAccountPasswordMode] = useState<'deleteAccount' | 'deleteData'>('deleteAccount');
  const { showAchievements } = useAchievementToast();
  const renderScreen = () => {
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

    if (screen === 'Settings') {
      return (
        <SettingsScreen
          onBack={() => setScreen(settingsFrom)}
          selectedList={selectedList ?? undefined}
          onImportList={() => setScreen('ImportList')}
          onExportList={() => setScreen('ExportList')}
          onChangeEmail={() => setScreen('ChangeEmail')}
          onProfile={() => setScreen('Profile')}
          onChangePassword={() => setScreen('ChangePassword')}
          onTheme={() => setScreen('Theme')}
          onAbout={() => setScreen('About')}
          onLanguage={() => setScreen('Language')}
          onStats={() => setScreen('Stats')}
          onFriends={() => setScreen('Friends')}
          onReferral={() => setScreen('Referral')}
          onAchievements={() => setScreen('Achievements')}
          onShareList={() => setScreen('ShareList')}
          onSharedWithMe={() => setScreen('SharedWithMe')}
          onEditList={() => {
            if (selectedList) { setScreen('EditList'); } else { setScreen('SelectList'); }
          }}
          onExportAllLists={async () => {
            try {
              await exportAllListsToJSON();
              const newAch = await unlockAndCheck('ie_exportall');
              const result = await computeGrades();
              const toShow = [...(newAch ? [newAch] : []), ...result.newlyUnlocked];
              if (toShow.length > 0) showAchievements(toShow);
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }}
          onDeleteAccount={() => { setAccountPasswordMode('deleteAccount'); setScreen('PasswordAccount'); }}
          onDeleteAllData={() => { setAccountPasswordMode('deleteData'); setScreen('PasswordAccount'); }}
        />
      );
    }

    if (screen === 'Theme') return <ThemeScreen onBack={() => setScreen('Settings')} />;
    if (screen === 'Language') return <LanguageScreen onBack={() => setScreen('Settings')} />;
    if (screen === 'Referral') return <ReferralScreen onBack={() => setScreen('Settings')} />;
    if (screen === 'About') return <AboutScreen onBack={() => setScreen('Settings')} />;

    if (screen === 'ChangeEmail') {
      return <ChangeEmailScreen onBack={() => setScreen('Settings')} onSuccess={() => setScreen('Settings')} />;
    }
    if (screen === 'ChangePassword') {
      return <ChangePasswordScreen onBack={() => setScreen('Settings')} onSuccess={() => setScreen('Settings')} />;
    }
    if (screen === 'Stats') {
      return <StatsScreen onBack={() => setScreen('Settings')} selectedList={selectedList ?? undefined} />;
    }
    if (screen === 'ShareList') {
      if (!selectedList) {
        return (
          <SelectListScreen
            onBack={() => setScreen('Settings')}
            onSelectList={(list) => {
              setSelectedList(list);
            }}
          />
        );
      }
      return (
        <ShareListScreen
          onBack={() => setScreen('Settings')}
          list={selectedList}
        />
      );
    }

    if (screen === 'SharedWithMe') {
      return (
        <SharedWithMeScreen
          onBack={() => setScreen('Settings')}
          onSelectList={(sharedList) => {
            setSelectedSharedList(sharedList);
            setScreen('SharedEntryList');
          }}
        />
      );
    }

    if (screen === 'SharedEntryList' && selectedSharedList) {
      return (
        <SharedEntryListScreen
          onBack={() => setScreen('SharedWithMe')}
          onSelectEntry={(entry) => { setSelectedEntry(entry); setScreen('EntryDetail'); }}
          sharedList={selectedSharedList}
        />
      );
    }
    if (screen === 'Achievements') {
      return <AchievementsScreen onBack={() => setScreen('Settings')} />;
    }
    if (screen === 'Profile') {
      return <ProfileScreen onBack={() => setScreen('Settings')} />;
    }
    if (screen === 'Friends') {
      return <FriendsScreen 
        onBack={() => setScreen('Settings')} 
        onFriendPress={(friend) => { setSelectedFriend(friend); setScreen('FriendProfile'); }}
      />;
    }
    if (screen === 'FriendProfile' && selectedFriend) {
      return <FriendProfileScreen onBack={() => setScreen('Friends')} friend={selectedFriend} />;
    }
    if (screen === 'PasswordAccount') {
      return (
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
                const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email!, password });
                if (signInError) { Alert.alert('Erreur', 'Mot de passe incorrect'); return; }
                const { data: { session } } = await supabase.auth.getSession();
                const { error: fnError } = await supabase.functions.invoke('delete-account', {
                  headers: { Authorization: `Bearer ${session?.access_token}` },
                });
                if (fnError) throw fnError;
                await logout();
              } catch (error: any) { Alert.alert('Erreur', error.message); }
            } else {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Utilisateur non connecté');
                const { error } = await supabase.auth.signInWithPassword({ email: user.email!, password });
                if (error) { Alert.alert('Erreur', 'Mot de passe incorrect'); return; }
                await deleteAllUserData();
                Alert.alert('Succès', 'Toutes tes données ont été supprimées.');
                setScreen('Settings');
              } catch (error: any) { Alert.alert('Erreur', error.message); }
            }
          }}
        />
      );
    }

    if (screen === 'SelectList') {
      return (
        <SelectListScreen
          onBack={() => setScreen('Settings')}
          onSelectList={(list) => { setSelectedList(list); setScreen('EditList'); }}
        />
      );
    }
    if (screen === 'ExportList') {
      return <ExportListScreen onBack={() => setScreen('Settings')} preselectedList={selectedList ?? undefined} />;
    }
    if (screen === 'ImportList') {
      return (
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
      );
    }
    if (screen === 'ImportResult' && importResult) {
      return (
        <ImportResultScreen
          result={importResult}
          mode={importMode}
          targetListName={importTargetName}
          onDone={() => { setImportResult(null); setScreen(settingsFrom); }}
        />
      );
    }
    if (screen === 'AddList') {
      return <AddListScreen onBack={() => setScreen('ListsHome')} onSuccess={() => setScreen('ListsHome')} />;
    }
    if (screen === 'EditList' && selectedList) {
      return (
        <EditListScreen
          list={selectedList}
          onBack={() => setScreen('Settings')}
          onSuccess={() => { setScreen(settingsFrom); if (settingsFrom === 'ListsHome') setSelectedList(null); }}
        />
      );
    }
    if (screen === 'EntryList' && selectedList) {
      return (
        <EntryListScreen
          listId={selectedList.id}
          listType={selectedList.type}
          onSelectEntry={(entry) => { setSelectedEntry(entry); setScreen('EntryDetail'); }}
          onAddEntry={() => setScreen('AddEntry')}
          onBack={() => setScreen('ListsHome')}
          onSettings={() => { setSettingsFrom('EntryList'); setScreen('Settings'); }}
        />
      );
    }
    if (screen === 'AddEntry' && selectedList) {
      return (
        <AddEntryScreen
          listId={selectedList.id}
          listType={selectedList.type}
          onBack={() => setScreen('EntryList')}
          onSuccess={() => setScreen('EntryList')}
        />
      );
    }
    if (screen === 'EditEntry' && selectedEntry) {
      return (
        <EditEntryScreen
          entry={selectedEntry}
          listType={selectedList!.type}
          onBack={() => setScreen('EntryDetail')}
          onSuccess={() => { setScreen('EntryList'); setSelectedEntry(null); }}
        />
      );
    }
    if (screen === 'EntryDetail' && selectedEntry) {
      return (
        <EntryDetailScreen
          entry={selectedEntry}
          listType={selectedList!.type}
          onBack={() => setScreen('EntryList')}
          onEdit={() => setScreen('EditEntry')}
        />
      );
    }
    if (screen === 'Password' && pendingList) {
      return (
        <PasswordScreen
          listName={pendingList.name}
          onCancel={() => { setScreen('ListsHome'); setPendingList(null); }}
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
                } catch (error: any) { Alert.alert('Erreur', error.message); }
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
          if (list.password_hash) { setPendingList(list); setPasswordMode('access'); setScreen('Password'); }
          else { setSelectedList(list); setScreen('EntryList'); }
        }}
        onAddList={() => setScreen('AddList')}
        onDeleteProtected={(list) => { setPendingList(list); setPasswordMode('delete'); setScreen('Password'); }}
        onSettings={() => { setSelectedList(null); setSettingsFrom('ListsHome'); setScreen('Settings'); }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <AchievementToast achievement={current} onHide={onHide} />
    </View>
  );
};

export const Navigation = () => {
  return (
    <SafeAreaProvider>
      <AchievementToastProvider>
        <AppContent />
      </AchievementToastProvider>
    </SafeAreaProvider>
  );
};