import sakura from '../context/themes/sakura';
import ninja from '../context/themes/ninja';
import spicy from '../context/themes/spicy';
import night from '../context/themes/night';

export type ThemeName = 'sakura' | 'ninja' | 'spicy' | 'night';


export type Theme = {
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    border: string;
    accent: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  borderRadius: { sm: number; md: number; lg: number; full: number };
  fontSize: { sm: number; md: number; lg: number; xl: number; xxl: number; title: number };
};



export const themes: Record<ThemeName, Theme> = { sakura, ninja, spicy, night };
export const theme = themes.sakura;