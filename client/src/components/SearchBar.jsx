import { useEffect, useMemo, useRef, useState } from 'react';

import { normalize } from '../utils/format.js';
import { IconClose, IconSearch } from './Icons.jsx';

/**
 * SearchBar - Buscador con sugerencias predictivas.
 *
 * @param {object} props
 * @param {string} props.value          Valor controlado del texto.
 * @param {Function} props.onChange      Callback al escribir.
 * @param {Function} props.onSearch      Callback al confirmar la busqueda.
 * @param {Array} props.products        Catalogo para construir las sugerencias.
 * @param {Array} props.categories      Rubros para sugerir por categoria.
 * @param {Function} props.onFocus       Callback opcional al enfocar.
 */
export default function SearchBar({
  value,
  onChange,
  onSearch,
  products = [],
  categories = [],
  onFocus,
  autoFocus = false,
  placeholder = 'Buscar camaras, NAS, drones, GPUs...',
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  /* --- Sugerencias calculadas a partir del texto --- */
  const suggestions = useMemo(() => {
    const needle = normalize(value).trim();
    if (needle.length < 2) return [];

    const productHits = products
      .filter((product) =>
        normalize(
          `${product.name} ${product.brand} ${product.category} ${product.description}`,
        ).includes(needle),
      )
      .slice(0, 6)
      .map((product) => ({
        type: 'product',
        id: product.id,
        label: product.name,
        hint: product.categoryLabel || product.brand,
        image: product.image,
      }));

    const categoryHits = categories
      .filter((category) => normalize(category.label).includes(needle))
      .slice(0, 3)
      .map((category) => ({
        type: 'category',
        id: category.id,
        label: category.label,
        hint: `${category.count ?? 0} productos`,
      }));

    return [...categoryHits, ...productHits];
  }, [value, products, categories]);

  /* --- Cierra el panel al hacer click fuera --- */
  useEffect(() => {
    const onClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  /* --- Atajo global "/" para enfocar el buscador --- */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (event) => {
    event?.preventDefault();
    setOpen(false);
    setHighlight(-1);
    onSearch?.(value);
  };

  const chooseSuggestion = (suggestion) => {
    setOpen(false);
    setHighlight(-1);
    if (suggestion.type === 'category') {
      onChange(suggestion.label);
      onSearch?.(suggestion.label, suggestion.id);
    } else {
      // Sugerencia de producto: llevamos directo a la ficha.
      onSearch?.(suggestion.label, null, suggestion.id);
    }
  };

  const onKeyDown = (event) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && highlight >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions[highlight]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-ink-850/80 px-4 transition-all duration-300 ${
            open
              ? 'border-neon-500/70 shadow-neon'
              : 'border-ink-600/70 focus-within:border-neon-500/70'
          }`}
        >
          <IconSearch className="h-5 w-5 shrink-0 text-neon-400" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            autoFocus={autoFocus}
            onChange={(event) => {
              onChange(event.target.value);
              setOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => {
              setOpen(true);
              onFocus?.();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Buscar productos"
            className="w-full bg-transparent py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Limpiar busqueda"
              className="shrink-0 text-slate-500 transition-colors hover:text-neon-300"
            >
              <IconClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* --- Panel de sugerencias predictivas --- */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 animate-fade-up overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-850/95 shadow-2xl backdrop-blur-xl">
          <p className="border-b border-ink-700/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Sugerencias
          </p>
          <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.type}-${suggestion.id}`}>
                <button
                  type="button"
                  onClick={() => chooseSuggestion(suggestion)}
                  onMouseEnter={() => setHighlight(index)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    highlight === index
                      ? 'bg-neon-500/10'
                      : 'hover:bg-ink-800/70'
                  }`}
                >
                  {suggestion.image ? (
                    <img
                      src={suggestion.image}
                      alt=""
                      loading="lazy"
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neon-500/15 font-mono text-[10px] uppercase text-neon-300">
                      {suggestion.type === 'category' ? 'cat' : 'sku'}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-100">
                      {suggestion.label}
                    </span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">
                      {suggestion.hint}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
