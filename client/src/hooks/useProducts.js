import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCategories, getProducts } from '../api/client.js';

const CACHE_KEY = 'stark_products_cache';

/** Guarda el catalogo en localStorage para poder navegar offline. */
const cacheProducts = (products) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(products));
  } catch {
    /* noop */
  }
};

/** Recupera el catalogo cacheado. */
const readCache = () => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * useProducts - Carga el catalogo desde la API con fallback a localStorage.
 *
 * @param {object} filters { q, category, sort, minPrice, maxPrice, featured }
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const { q, category, sort, minPrice, maxPrice, featured } = filters;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProducts({
        q,
        category,
        sort,
        minPrice,
        maxPrice,
        featured,
      });
      setProducts(data.products ?? []);
      setOffline(false);
      cacheProducts(data.products ?? []);
    } catch (err) {
      // Fallback: usamos el catalogo cacheado y filtramos en el cliente.
      const cached = readCache();
      if (cached) {
        setProducts(cached);
        setOffline(true);
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [q, category, sort, minPrice, maxPrice, featured]);

  useEffect(() => {
    load();
  }, [load]);

  // Categorias (se cargan una sola vez).
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {
        const cached = readCache();
        if (cached) {
          const unique = new Map();
          cached.forEach((product) => {
            if (!unique.has(product.category)) {
              unique.set(product.category, {
                id: product.category,
                label: product.categoryLabel || product.category,
                shortLabel: product.categoryLabel || product.category,
                count: 0,
              });
            }
            unique.get(product.category).count += 1;
          });
          setCategories([...unique.values()]);
        }
      });
  }, []);

  return { products, categories, loading, error, offline, reload: load };
}

/**
 * useFilteredProducts - Filtra el catalogo en el cliente (para el modo offline).
 */
export function useFilteredProducts(products, filters = {}) {
  return useMemo(() => {
    const { q, category, sort, minPrice, maxPrice, featured } = filters;
    const needle = (q ?? '').toLowerCase();

    let result = products.filter((product) => {
      if (category && category !== 'all' && product.category !== category) return false;
      if (featured && !product.featured) return false;
      if (minPrice !== undefined && product.price < Number(minPrice)) return false;
      if (maxPrice !== undefined && product.price > Number(maxPrice)) return false;
      if (needle) {
        const haystack = `${product.name} ${product.brand} ${product.description} ${product.categoryLabel ?? ''}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const sorters = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    result = [...result].sort(sorters[sort] ?? sorters.featured);
    return result;
  }, [products, filters]);
}

export default useProducts;
