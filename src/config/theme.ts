export type ThemeName = 'sakura' | 'ninja' | 'spicy';

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
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  fontSize: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    title: number;
  };
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const borderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

const fontSize = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  title: 32,
};

export const themes: Record<ThemeName, Theme> = {
  sakura: {
    colors: {
      primary: '#D4547A',
      primaryLight: '#F2A7BB',
      background: '#FFF8F9',
      surface: '#FFFFFF',
      text: '#2D1B2E',
      textSecondary: '#8C7A8E',
      success: '#7BAE7F',
      border: '#F2D0DA',
      accent: '#FFE4EC',
    },
    spacing,
    borderRadius,
    fontSize,
  },
  ninja: {
    colors: {
      primary: '#1B6CA8',
      primaryLight: '#5BA3D9',
      background: '#0A1628',
      surface: '#0F2140',
      text: '#E8F4FD',
      textSecondary: '#7FB3D3',
      success: '#2ECC71',
      border: '#1E3A5F',
      accent: '#0D1E3A',
    },
    spacing,
    borderRadius,
    fontSize,
  },
  spicy: {
    colors: {
      primary: '#E63946',
      primaryLight: '#FF6B6B',
      background: '#1A0A0A',
      surface: '#2D1010',
      text: '#FFE8E8',
      textSecondary: '#C17070',
      success: '#7BAE7F',
      border: '#4A1515',
      accent: '#3D0F0F',
    },
    spacing,
    borderRadius,
    fontSize,
  },
};

// Export du thème par défaut pour la rétrocompatibilité
export const theme = themes.sakura;