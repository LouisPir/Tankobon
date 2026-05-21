import { Theme } from '../../config/theme';

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const borderRadius = { sm: 8, md: 12, lg: 20, full: 999 };
const fontSize = { sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, title: 32 };

const spicy: Theme = {
  colors: {
    primary: '#E63946',
    primaryLight: '#FF6B6B',
    background: '#2D0A0A',
    surface: '#451515',
    text: '#FFE8E8',
    textSecondary: '#D4848A',
    success: '#7BAE7F',
    border: '#6B2020',
    accent: '#5C1A1A',
  },
  spacing,
  borderRadius,
  fontSize,
};

export default spicy;