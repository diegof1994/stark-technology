import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * ThemeContext - Modo oscuro / claro con persistencia.
 * Stark Technology nace en dark mode (estetica cyberpunk) pero permite alternar.
 */

const ThemeContext = createContext(null);
const STORAGE_KEY = 'stark_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      return 'dark'; // default del proyecto
    } catch {
      return 'dark';
    }
  });

  // Aplica la clase `dark` / `light` en el elemento <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* noop */
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === 'dark' }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  }
  return context;
}

export default ThemeContext;
