import { Theme } from '../../config/theme';

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const borderRadius = { sm: 8, md: 12, lg: 20, full: 999 };
const fontSize = { sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, title: 32 };

const night: Theme = {
  colors: {
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    background: '#0A0A1A',
    surface: '#12122A',
    text: '#F0EEFF',
    textSecondary: '#8B7EC8',
    success: '#34D399',
    border: '#1E1E40',
    accent: '#1A1A38',
  },
  spacing,
  borderRadius,
  fontSize,
};

export default night;