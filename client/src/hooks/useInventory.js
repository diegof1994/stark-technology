import { useCallback, useEffect, useState } from 'react';

import {
  createProduct as apiCreate,
  deleteProduct as apiDelete,
  getProducts,
  updateProduct as apiUpdate,
} from '../api/client.js';

const LOCAL_KEY = 'stark_local_inventory';

/**
 * useInventory - ABM del inventario con sincronizacion al backend.
 *
 * Flujo:
 *  1. Intenta leer el catalogo del backend (fuente de verdad).
 *  2. Guarda una copia local en localStorage.
 *  3. Si el backend no responde, opera en modo local (localStorage) y marca
 *     `syncEnabled = false` para avisar al usuario en la UI.
 */
export function useInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [error, setError] = useState(null);

  /* --- Persistencia local (modo offline / respaldo) --- */
  const readLocal = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const writeLocal = useCallback((items) => {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {
      /* noop */
    }
  }, []);

  /* --- Carga inicial --- */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      const items = (data.products ?? []).filter(Boolean);
      setProducts(items);
      writeLocal(items);
      setSyncEnabled(true);
    } catch (err) {
      const local = readLocal();
      setProducts(local);
      setSyncEnabled(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [readLocal, writeLocal]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Crea un producto. Sincroniza con el backend; si falla, lo agrega en local.
   * @returns {Promise<{product: object, synced: boolean}>}
   */
  const create = useCallback(
    async (payload) => {
      try {
        const data = await apiCreate(payload);
        // Si la API devuelve una respuesta inesperada, no agregamos basura al estado.
        if (!data?.product?.id) {
          throw new Error('La API no devolvio el producto creado.');
        }
        setProducts((current) => {
          const next = [...current, data.product];
          writeLocal(next);
          return next;
        });
        setSyncEnabled(true);
        return { product: data.product, synced: true };
      } catch (err) {
        // Fallback local: construimos el producto en el cliente.
        const localProduct = {
          ...payload,
          id: `local-${Date.now().toString(36)}`,
          sku: payload.sku || `STK-LOC-${Date.now().toString().slice(-4)}`,
          slug: payload.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts((current) => {
          const next = [...current, localProduct];
          writeLocal(next);
          return next;
        });
        setError(err.message);
        return { product: localProduct, synced: false };
      }
    },
    [writeLocal],
  );

  /**
   * Actualiza un producto (PUT).
   * @returns {Promise<{product: object, synced: boolean}>}
   */
  const update = useCallback(
    async (id, payload) => {
      try {
        const data = await apiUpdate(id, payload);
        if (!data?.product?.id) {
          throw new Error('La API no devolvio el producto actualizado.');
        }
        setProducts((current) => {
          const next = current.map((product) =>
            product.id === id ? data.product : product,
          );
          writeLocal(next);
          return next;
        });
        setSyncEnabled(true);
        return { product: data.product, synced: true };
      } catch (err) {
        const localProduct = {
          ...payload,
          id,
          updatedAt: new Date().toISOString(),
        };
        setProducts((current) => {
          const next = current.map((product) =>
            product.id === id ? { ...product, ...localProduct } : product,
          );
          writeLocal(next);
          return next;
        });
        setError(err.message);
        return { product: localProduct, synced: false };
      }
    },
    [writeLocal],
  );

  /**
   * Elimina un producto (DELETE).
   * @returns {Promise<{product: object, synced: boolean}>}
   */
  const remove = useCallback(
    async (id) => {
      const target = products.find((product) => product.id === id);
      try {
        const data = await apiDelete(id);
        setProducts((current) => {
          const next = current.filter((product) => product.id !== id);
          writeLocal(next);
          return next;
        });
        setSyncEnabled(true);
        return { product: data.product ?? target, synced: true };
      } catch (err) {
        setProducts((current) => {
          const next = current.filter((product) => product.id !== id);
          writeLocal(next);
          return next;
        });
        setError(err.message);
        return { product: target, synced: false };
      }
    },
    [products, writeLocal],
  );

  /** Fuerza la resincronizacion con el backend. */
  const resync = useCallback(async () => {
    await load();
  }, [load]);

  return { products, loading, syncEnabled, error, create, update, remove, resync };
}

export default useInventory;
