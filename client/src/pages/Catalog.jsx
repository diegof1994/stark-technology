import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import CategoryFilter from '../components/CategoryFilter.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';
import { IconAlert, IconBox, IconClose, IconFilter } from '../components/Icons.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Catalog - Pagina principal del catalogo.
 *
 * Buscador predictivo, rail lateral de filtros, segmentado de ordenamiento y
 * grilla de productos. Los filtros se reflejan en la URL (query params) para
 * poder compartirlos, y se listan como pills removibles sobre la grilla.
 */
export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  /* --- Estado sincronizado con la URL --- */
  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const sort = searchParams.get('sort') ?? 'featured';
  const featured = searchParams.get('featured') === 'true';
  const flash = searchParams.get('flash') === 'true';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const [text, setText] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [focusSearch, setFocusSearch] = useState(false);

  useEffect(() => {
    setText(query);
  }, [query]);

  /* --- El navbar puede pedir que se enfoque el buscador --- */
  useEffect(() => {
    const onFocus = () => setFocusSearch(true);
    window.addEventListener('stark:focus-search', onFocus);
    return () => window.removeEventListener('stark:focus-search', onFocus);
  }, []);

  const { products, categories, loading, error, offline, reload } = useProducts({
    q: query,
    category,
    sort,
    featured: featured || undefined,
    flash: flash || undefined,
    maxPrice: maxPrice || undefined,
  });

  /** Actualiza la URL con los filtros aplicados. */
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value || value === 'all' || value === false) next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  };

  const handleSearch = (value) => {
    updateParams({ q: value || undefined });
  };

  const sortOptions = [
    { value: 'featured', label: 'Destacados' },
    { value: 'price-asc', label: 'Precio asc' },
    { value: 'price-desc', label: 'Precio desc' },
    { value: 'rating', label: 'Mejor valorados' },
    { value: 'name', label: 'Nombre A-Z' },
  ];

  const activeCategory = categories.find((c) => c.id === category);

  /* --- Pillas de filtros activos --- */
  const activeFilters = useMemo(() => {
    const pills = [];
    if (query) pills.push({ key: 'q', label: `"${query}"`, clear: { q: undefined } });
    if (category !== 'all') {
      pills.push({
        key: 'category',
        label: activeCategory?.label ?? category,
        clear: { category: undefined },
      });
    }
    if (flash) pills.push({ key: 'flash', label: 'Ofertas flash', clear: { flash: false } });
    if (featured) pills.push({ key: 'featured', label: 'Destacados', clear: { featured: false } });
    if (maxPrice) {
      pills.push({
        key: 'maxPrice',
        label: `Hasta $ ${maxPrice}`,
        clear: { maxPrice: undefined },
      });
    }
    return pills;
  }, [query, category, flash, featured, maxPrice, activeCategory]);

  const resultLabel = useMemo(() => {
    if (loading) return 'Cargando...';
    return `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
  }, [products.length, loading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* --- Cabecera --- */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1 className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold leading-[1.05] tracking-[-0.025em] text-strong">
            {category === 'all'
              ? 'Todos los productos'
              : activeCategory?.label ?? 'Productos'}
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            {resultLabel}
            {offline && ' · modo offline (cache local)'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((value) => !value)}
          className="btn-ghost lg:hidden"
        >
          <IconFilter className="h-4 w-4" />
          Filtros
        </button>
      </header>

      {/* --- Buscador --- */}
      <div className="mt-7">
        <SearchBar
          value={text}
          onChange={setText}
          onSearch={handleSearch}
          products={products}
          categories={categories}
          autoFocus={focusSearch}
        />
      </div>

      {/* --- Layout --- */}
      <div className="mt-7 grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* --- Rail lateral de filtros --- */}
        <aside className={`${showFilters ? 'block' : 'hidden'} space-y-6 lg:block`}>
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="surface rounded-xl p-4">
              <CategoryFilter
                categories={categories}
                selected={category}
                onSelect={(value) => updateParams({ category: value })}
              />
            </div>

            {/* --- Ordenamiento (segmentado) --- */}
            <div className="surface rounded-xl p-4">
              <h3 className="tech-label">Ordenar por</h3>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateParams({ sort: option.value })}
                    className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                      sort === option.value
                        ? 'border-accent/50 bg-accent/10 text-accent'
                        : 'border-line bg-surface-2 text-muted hover:border-line-strong hover:text-strong'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Precio maximo --- */}
            <div className="surface rounded-xl p-4">
              <h3 className="tech-label">Precio maximo</h3>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => updateParams({ maxPrice: event.target.value || undefined })}
                placeholder="Sin limite"
                className="field mt-3 !py-2 text-xs"
              />
            </div>

            {/* --- Interruptores --- */}
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-1 px-3.5 py-3 transition-colors hover:border-line-strong">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => updateParams({ featured: event.target.checked })}
                  className="h-4 w-4 accent-ember-500"
                />
                <span className="text-xs text-body">Solo destacados</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-flare-500/35 bg-flare-500/8 px-3.5 py-3 transition-colors hover:border-flare-500/60">
                <input
                  type="checkbox"
                  checked={flash}
                  onChange={(event) => updateParams({ flash: event.target.checked })}
                  className="h-4 w-4 accent-flare-400"
                />
                <span className="text-xs font-medium text-accent-2">
                  🔥 Solo ofertas flash
                </span>
              </label>
            </div>

            {searchParams.toString() && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="btn-quiet w-full justify-center py-2 text-xs"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* --- Resultados --- */}
        <section>
          {/* --- Pills de filtros activos --- */}
          {activeFilters.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeFilters.map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => updateParams(pill.clear)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-2 text-[11px] font-medium text-body transition-colors hover:border-line-strong hover:text-strong"
                >
                  {pill.label}
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-surface-3 text-faint transition-colors group-hover:bg-accent group-hover:text-on-accent">
                    <IconClose className="h-2.5 w-2.5" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {error && !products.length && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/8 px-6 py-16 text-center">
              <IconAlert className="h-9 w-9 text-danger" />
              <p className="mt-4 font-display text-sm font-semibold text-strong">
                No pudimos cargar el catalogo
              </p>
              <p className="mt-1.5 max-w-sm text-xs text-muted">{error}</p>
              <button type="button" onClick={reload} className="btn-ember mt-5">
                Reintentar
              </button>
            </div>
          )}

          {loading && !products.length && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface-1 px-6 py-20 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-xl border border-line bg-surface-2">
                <IconBox className="h-6 w-6 text-faint" />
              </span>
              <p className="mt-5 font-display text-sm font-semibold uppercase tracking-[0.12em] text-strong">
                Sin resultados
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                No encontramos productos que coincidan con tu busqueda. Prueba con
                otros terminos o quita los filtros aplicados.
              </p>
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="btn-ember mt-6"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {products.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
