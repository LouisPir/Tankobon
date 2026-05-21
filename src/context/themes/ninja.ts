import { Theme } from '../../config/theme';

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const borderRadius = { sm: 8, md: 12, lg: 20, full: 999 };
const fontSize = { sm: 12, md: 14, lg: 16, xl: 20, xxl: 28, title: 32 };

const ninja: Theme = {
  colors: {
    primary: '#2E86C1',
    primaryLight: '#7FB3D3',
    background: '#0D2137',
    surface: '#162D45',
    text: '#E8F4FD',
    textSecondary: '#7FB3D3',
    success: '#2ECC71',
    border: '#1E3A5F',
    accent: '#1A3A5C',    
  },
  spacing,
  borderRadius,
  fontSize,
};

export default ninja;