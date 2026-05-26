import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeName, Theme } from '../config/theme';
import { unlockAchievement } from '../services/grades';

type ThemeContextType = {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'sakura',
  theme: themes.sakura,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('sakura');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved && saved in themes) {
        setThemeName(saved as ThemeName);
      }
    });
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    await AsyncStorage.setItem('theme', name);
    unlockAchievement('app_thm');
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme: themes[themeName], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);