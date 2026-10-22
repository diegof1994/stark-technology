import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Brand from './Brand.jsx';
import { IconCart, IconClose, IconMenu, IconMoon, IconSearch, IconSun } from './Icons.jsx';

/**
 * Navbar - Cabecera principal de Stark Technology.
 *
 * Compuesta por: marca, navegacion con indicador de seccion activa, busqueda
 * rapida, cambio de tema y carrito. Al hacer scroll se compacta y suma una
 * barra de progreso de lectura.
 */
export default function Navbar() {
  const { count, openCart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  /* --- Estado de scroll: compactacion + progreso de lectura --- */
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(top > 8);
      setProgress(max > 0 ? Math.min(100, (top / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --- Cierra el menu movil al cambiar de ruta --- */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  /* --- Bloquea el scroll del body con el menu abierto --- */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const search = () => {
    navigate('/catalogo');
    // Catalog escucha este evento para enfocar su buscador.
    window.setTimeout(() => window.dispatchEvent(new Event('stark:focus-search')), 60);
  };

  /* --- Enlaces de navegacion con su regla de estado activo --- */
  const links = [
    {
      to: '/',
      label: 'Inicio',
      match: (pathname) => pathname === '/',
    },
    {
      to: '/catalogo',
      label: 'Catalogo',
      match: (pathname, params) =>
        pathname === '/catalogo' && !params.get('flash') && !params.get('category'),
    },
    {
      to: '/catalogo?flash=true',
      label: 'Ofertas',
      accent: true,
      match: (pathname, params) => pathname === '/catalogo' && params.get('flash') === 'true',
    },
    {
      to: '/catalogo?category=camaras-seguridad',
      label: 'Seguridad',
      match: (pathname, params) =>
        pathname === '/catalogo' && params.get('category') === 'camaras-seguridad',
    },
    {
      to: '/catalogo?category=smart-home',
      label: 'Smart Home',
      match: (pathname, params) =>
        pathname === '/catalogo' && params.get('category') === 'smart-home',
    },
    {
      to: '/admin',
      label: 'Admin',
      match: (pathname) => pathname === '/admin',
    },
  ];

  const params = new URLSearchParams(location.search);
  const isActive = (link) => link.match(location.pathname, params);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-line bg-canvas/85 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        {/* --- Marca --- */}
        <Brand />

        {/* --- Navegacion desktop --- */}
        <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={`relative rounded-full px-3.5 py-2 font-display text-[13px] font-medium transition-colors ${
                  active
                    ? 'text-strong'
                    : link.accent
                      ? 'text-accent-2 hover:text-strong'
                      : 'text-muted hover:text-strong'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-surface-2"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {link.label}
                {link.accent && (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-blink rounded-full bg-flare-500 align-middle" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* --- Busqueda rapida --- */}
          <button
            type="button"
            onClick={search}
            aria-label="Buscar productos"
            className="group hidden h-9 items-center gap-2.5 rounded-full border border-line bg-surface-1 px-3.5 text-muted transition-colors hover:border-line-strong hover:text-strong sm:flex"
          >
            <IconSearch className="h-4 w-4" />
            <span className="font-mono text-[11px]">Buscar</span>
            <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-faint">
              /
            </kbd>
          </button>

          {/* --- Cambio de tema --- */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line bg-surface-1 text-muted transition-colors hover:border-line-strong hover:text-strong"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ y: 12, opacity: 0, rotate: -35 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -12, opacity: 0, rotate: 35 }}
                transition={{ duration: 0.22 }}
                className="absolute"
              >
                {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* --- Carrito --- */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir carrito (${count} productos)`}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-1 text-body transition-colors hover:border-line-strong hover:text-strong"
          >
            <IconCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-ember-400 to-flare-500 px-1 font-mono text-[10px] font-bold text-on-accent">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          {/* --- Menu movil --- */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-1 text-body transition-colors hover:border-line-strong lg:hidden"
          >
            {mobileOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* --- Barra de progreso de lectura --- */}
      <div
        className="h-px origin-left bg-gradient-to-r from-ember-400 to-flare-500 transition-opacity duration-300"
        style={{ transform: `scaleX(${progress / 100})`, opacity: scrolled ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* --- Menu movil a pantalla completa --- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-16 border-b border-line bg-canvas/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col px-4 py-4">
              {links.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.28 }}
                >
                  <Link
                    to={link.to}
                    className={`flex items-center justify-between border-b border-line py-3.5 font-display text-lg font-semibold tracking-tight transition-colors ${
                      isActive(link) ? 'text-accent' : 'text-strong'
                    }`}
                  >
                    {link.label}
                    {link.accent && (
                      <span className="rounded-full bg-flare-500/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-2">
                        70% off
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
