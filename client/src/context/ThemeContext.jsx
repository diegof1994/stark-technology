import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * ThemeContext - Tema oscuro / claro con persistencia.
 *
 * Stark Technology arranca en dark mode (identidad "STARK OS") pero ofrece un
 * tema claro completo: todos los componentes consumen tokens semanticos
 * (`surface-*`, `text-*`, `line`) definidos en `index.css`, de modo que el
 * cambio de tema es instantaneo y sin re-renderizados.
 */

const ThemeContext = createContext(null);
const STORAGE_KEY = 'stark_theme';

/** Colores del meta theme-color por tema (evita la barra blanca del navegador). */
const THEME_COLORS = { dark: '#0b0a09', light: '#f6f4f1' };

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

  // Aplica la clase `dark` / `light` en el elemento <html> y sincroniza el
  // color de la barra del navegador.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.style.backgroundColor = THEME_COLORS[theme];

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);

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
