import { Navigation } from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Navigation />
      </LanguageProvider>
    </ThemeProvider>
  );
}