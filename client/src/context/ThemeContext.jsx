import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * ThemeContext - Tema oscuro / claro con persistencia.
 *
 * Stark Technology arranca en tema claro calido (crema + terracota) pero ofrece
 * un tema oscuro completo: todos los componentes consumen tokens semanticos
 * (`surface-*`, `text-*`, `line`) definidos en `index.css`, de modo que el
 * cambio de tema es instantaneo y sin re-renderizados.
 */

const ThemeContext = createContext(null);
const STORAGE_KEY = 'stark_theme_v2';

/** Colores del meta theme-color por tema (evita la barra blanca del navegador). */
const THEME_COLORS = { dark: '#1c1915', light: '#faf9f5' };

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      return 'light'; // default del proyecto: estilo calido
    } catch {
      return 'light';
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
