import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import Brand from './Brand.jsx';
import { IconCart, IconClose, IconMenu, IconSearch, IconTruck } from './Icons.jsx';

/** Rubros que se muestran en la barra de categorias. */
export const NAV_CATEGORIES = [
  { id: 'herramientas', label: 'Herramientas' },
  { id: 'camaras-seguridad', label: 'Seguridad' },
  { id: 'smart-home', label: 'Smart Home' },
  { id: 'redes-conectividad', label: 'Redes' },
  { id: 'componentes-pc', label: 'Computacion' },
  { id: 'perifericos-gaming', label: 'Gaming' },
  { id: 'energia-ups', label: 'Energia' },
];

/**
 * Navbar - Cabecera de tienda convencional.
 *
 * Tres franjas: aviso de envio, fila principal (logo + buscador + carrito) y
 * barra de categorias. En celular las categorias van en un menu desplegable.
 */
export default function Navbar() {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [term, setTerm] = useState(params.get('q') ?? '');

  useEffect(() => {
    setMobileOpen(false);
    setTerm(new URLSearchParams(location.search).get('q') ?? '');
  }, [location.pathname, location.search]);

  const submit = (event) => {
    event.preventDefault();
    const value = term.trim();
    navigate(value ? `/catalogo?q=${encodeURIComponent(value)}` : '/catalogo');
  };

  const activeCategory = location.pathname === '/catalogo' ? params.get('category') : null;
  const linkClass = (active) =>
    `whitespace-nowrap py-3 text-sm transition-colors ${
      active ? 'font-semibold text-accent' : 'text-body hover:text-accent'
    }`;

  const searchForm = (
    <form onSubmit={submit} role="search" className="relative w-full">
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Buscar productos, marcas y mas..."
        aria-label="Buscar en la tienda"
        className="h-11 w-full rounded-full border border-line-strong bg-surface-1 pl-5 pr-12 text-sm text-strong outline-none transition placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-accent text-on-accent transition hover:bg-accent-strong"
      >
        <IconSearch className="h-4 w-4" />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface-1">
      {/* --- Aviso superior --- */}
      <div className="bg-[var(--color-navy-900)] text-white">
        <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium">
          <IconTruck className="h-3.5 w-3.5 shrink-0" />
          Envio gratis desde $150.000
          <span className="hidden sm:inline">y hasta 6 cuotas sin interes</span>
        </p>
      </div>

      {/* --- Fila principal --- */}
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          className="grid h-10 w-10 place-items-center rounded-full text-body hover:bg-surface-2 lg:hidden"
        >
          {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>

        <Brand />

        <div className="hidden flex-1 md:block">{searchForm}</div>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Abrir carrito (${count} productos)`}
          className="relative ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-strong transition hover:bg-surface-2 md:ml-0"
        >
          <span className="relative">
            <IconCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </span>
          <span className="hidden text-sm font-medium lg:inline">Mi carrito</span>
        </button>
      </div>

      {/* --- Buscador en celular --- */}
      <div className="px-4 pb-3 md:hidden">{searchForm}</div>

      {/* --- Barra de categorias (desktop) --- */}
      <nav className="hidden border-t border-line lg:block" aria-label="Categorias">
        <div className="mx-auto flex max-w-7xl items-center gap-7 px-8">
          <NavLink to="/catalogo" end className={() => linkClass(location.pathname === '/catalogo' && !activeCategory && !params.get('flash'))}>
            Todos los productos
          </NavLink>
          {NAV_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/catalogo?category=${category.id}`}
              className={linkClass(activeCategory === category.id)}
            >
              {category.label}
            </Link>
          ))}
          <Link
            to="/catalogo?flash=true"
            className={`ml-auto ${linkClass(params.get('flash') === 'true')} font-semibold text-accent`}
          >
            Ofertas
          </Link>
        </div>
      </nav>

      {/* --- Menu movil --- */}
      {mobileOpen && (
        <nav className="border-t border-line bg-surface-1 px-4 pb-4 lg:hidden" aria-label="Categorias">
          <Link to="/catalogo" className="block border-b border-line py-3 text-base text-strong">
            Todos los productos
          </Link>
          {NAV_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`/catalogo?category=${category.id}`}
              className="block border-b border-line py-3 text-base text-strong"
            >
              {category.label}
            </Link>
          ))}
          <Link to="/catalogo?flash=true" className="block py-3 text-base font-semibold text-accent">
            Ofertas
          </Link>
        </nav>
      )}
    </header>
  );
}
