import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import CategoryFilter from '../components/CategoryFilter.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { IconAlert, IconBox, IconFilter } from '../components/Icons.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Catalog - Pagina principal del catalogo.
 * Buscador predictivo, filtros por rubro, ordenamiento y grid de productos.
 * Los filtros se reflejan en la URL (query params) para poder compartirlos.
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

  useEffect(() => {
    setText(query);
  }, [query]);

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
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'rating', label: 'Mejor puntuados' },
    { value: 'name', label: 'Nombre (A-Z)' },
  ];

  const resultLabel = useMemo(() => {
    if (loading) return 'Cargando...';
    return `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
  }, [products.length, loading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* --- Cabecera --- */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Catalogo</p>
          <h1 className="mt-1.5 font-display text-2xl font-black uppercase tracking-[0.04em] text-white sm:text-3xl">
            {category === 'all'
              ? 'Todos los productos'
              : categories.find((c) => c.id === category)?.label ?? 'Productos'}
          </h1>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {resultLabel}
            {offline && ' · modo offline (cache local)'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="btn-ghost lg:hidden"
          >
            <IconFilter className="h-3.5 w-3.5" />
            Filtros
          </button>
        </div>
      </header>

      {/* --- Buscador --- */}
      <div className="mt-7">
        <SearchBar
          value={text}
          onChange={setText}
          onSearch={handleSearch}
          products={products}
          categories={categories}
        />
      </div>

      {/* --- Layout --- */}
      <div className="mt-7 grid gap-8 lg:grid-cols-[17rem_1fr]">
        {/* --- Panel lateral de filtros --- */}
        <aside
          className={`${showFilters ? 'block' : 'hidden'} space-y-6 lg:block`}
        >
          <div className="lg:sticky lg:top-24 space-y-6">
            <CategoryFilter
              categories={categories}
              selected={category}
              onSelect={(value) => updateParams({ category: value })}
            />

            {/* --- Ordenamiento --- */}
            <div>
              <h3 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Ordenar por
              </h3>
              <div className="space-y-1.5">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateParams({ sort: option.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      sort === option.value
                        ? 'border-ember-400/60 bg-ember-500/10 text-ember-300'
                        : 'border-ink-700 bg-ink-850/50 text-slate-400 hover:border-ember-500/40 hover:text-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Precio maximo --- */}
            <div>
              <h3 className="mb-3 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Precio maximo
              </h3>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => updateParams({ maxPrice: event.target.value || undefined })}
                placeholder="Sin limite"
                className="field !py-2 text-xs"
              />
            </div>

            {/* --- Solo destacados --- */}
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-850/50 px-3.5 py-3">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => updateParams({ featured: event.target.checked })}
                className="h-4 w-4 accent-ember-400"
              />
              <span className="text-xs text-slate-300">Solo destacados</span>
            </label>

            {/* --- Solo ofertas flash --- */}
            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-flare-500/35 bg-flare-500/8 px-3.5 py-3">
              <input
                type="checkbox"
                checked={flash}
                onChange={(event) => updateParams({ flash: event.target.checked })}
                className="h-4 w-4 accent-flare-400"
              />
              <span className="text-xs text-flare-300">🔥 Solo ofertas flash</span>
            </label>

            {searchParams.toString() && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="w-full rounded-lg py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600 transition-colors hover:text-ember-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* --- Resultados --- */}
        <section>
          {error && !products.length && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/8 px-6 py-16 text-center">
              <IconAlert className="h-9 w-9 text-red-400" />
              <p className="mt-4 text-sm font-medium text-slate-200">
                No pudimos cargar el catalogo
              </p>
              <p className="mt-1.5 max-w-sm text-xs text-slate-500">{error}</p>
              <button type="button" onClick={reload} className="btn-ember mt-5">
                Reintentar
              </button>
            </div>
          )}

          {loading && !products.length && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="card-tech overflow-hidden"
                  aria-hidden="true"
                >
                  <div className="aspect-[4/3] animate-pulse bg-ink-800" />
                  <div className="space-y-3 p-4">
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-ink-700" />
                    <div className="h-3.5 w-4/5 animate-pulse rounded bg-ink-700" />
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-ink-700" />
                    <div className="h-6 w-1/2 animate-pulse rounded bg-ink-700" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-600/70 bg-ink-850/50 px-6 py-16 text-center">
              <IconBox className="h-9 w-9 text-slate-600" />
              <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                Sin resultados
              </p>
              <p className="mt-1.5 max-w-sm text-xs text-slate-500">
                No encontramos productos que coincidan con tu busqueda. Prueba con
                otros terminos o quita los filtros aplicados.
              </p>
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="btn-ember mt-5"
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
