import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  IconCart,
  IconClose,
  IconMenu,
  IconMoon,
  IconSearch,
  IconShield,
  IconSun,
} from './Icons.jsx';

/**
 * Navbar - Cabecera principal de Stark Technology.
 * Incluye: logo, navegacion, busqueda rapida, toggle de tema y boton de carrito.
 */
export default function Navbar({ onFocusSearch }) {
  const { count, openCart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Sombreado de la cabecera al hacer scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menu movil al cambiar de ruta.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catalogo' },
    { to: '/catalogo?category=smart-home', label: 'Smart Home' },
    { to: '/catalogo?category=camaras-seguridad', label: 'Seguridad' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink-600/60 bg-ink-950/85 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* --- Logo --- */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-400 to-plasma-500 text-ink-950 shadow-neon transition-transform duration-300 group-hover:scale-105">
            <IconShield className="h-5 w-5" />
            <span className="absolute inset-0 animate-pulse-neon rounded-xl" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-sm font-black tracking-[0.2em] text-white">
              STARK
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.34em] text-neon-400">
              Technology
            </span>
          </span>
        </Link>

        {/* --- Navegacion desktop --- */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.13em] transition-colors ${
                  isActive && link.to === location.pathname
                    ? 'text-neon-300'
                    : 'text-slate-400 hover:text-slate-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* --- Busqu rapida --- */}
          <button
            type="button"
            onClick={() => {
              navigate('/catalogo');
              onFocusSearch?.();
            }}
            aria-label="Buscar productos"
            className="hidden h-9 items-center gap-2 rounded-xl border border-ink-600 bg-ink-800/60 px-3 text-slate-400 transition-colors hover:border-neon-500/60 hover:text-neon-300 sm:flex"
          >
            <IconSearch className="h-4 w-4" />
            <span className="font-mono text-[11px]">Buscar...</span>
            <kbd className="rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
              /
            </kbd>
          </button>

          {/* --- Toggle de tema --- */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="grid h-9 w-9 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-slate-300 transition-colors hover:border-neon-500/60 hover:text-neon-300"
          >
            {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
          </button>

          {/* --- Carrito --- */}
          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir carrito (${count} productos)`}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-slate-200 transition-colors hover:border-neon-500/60 hover:text-neon-300"
          >
            <IconCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-br from-plasma-400 to-plasma-500 px-1 font-mono text-[10px] font-bold text-white shadow-plasma">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          {/* --- Menu movil --- */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-slate-300 lg:hidden"
          >
            {mobileOpen ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* --- Menu movil desplegable --- */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-ink-600/60 bg-ink-900/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.13em] text-slate-300 transition-colors hover:bg-ink-800 hover:text-neon-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
