import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SEED_PRODUCTS } from './seed.js';
import { CATEGORIES, getCategoryLabel } from './categories.js';
import {
  FLASH_DISCOUNT_DEFAULT,
  normalizeFlashDiscount,
  originalPriceFrom,
} from './flash.js';

/**
 * Almacen de productos de Stark Technology.
 *
 * Estrategia de persistencia:
 *  - Al arrancar, se intenta leer `server/data/products.json`.
 *  - Si el archivo no existe, se genera a partir del catalogo semilla (SEED_PRODUCTS).
 *  - Cada mutacion (ABM) se escribe de forma atomica en ese JSON.
 *
 * En hostings con sistema de archivos efimero (ej. el plan free de Render)
 * la escritura falla silenciosamente y la app sigue funcionando en memoria.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');

/** @type {Array<object>} cache en memoria de todos los productos */
let products = [];
/** indica si el backend puede escribir en disco */
let persistent = true;

/** Normaliza texto para busquedas: sin acentos, sin mayusculas. */
export const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Genera un id slug unico a partir del nombre. */
const slugify = (text) =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Genera un SKU interno tipo STK-XXX-0000. */
const buildSku = (category, index) => {
  const prefix = (category || 'gen').slice(0, 3).toUpperCase();
  return `STK-${prefix}-${String(index).padStart(4, '0')}`;
};

/** Escribe el catalogo en disco de forma atomica (escribe a .tmp y renombra). */
const persist = () => {
  if (!persistent) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(products, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_FILE);
  } catch (error) {
    // En plataformas con disco efimero/lectura pasiva seguimos en memoria.
    persistent = false;
    console.warn(
      '[store] Persistencia en disco no disponible, se opera en memoria:',
      error.message,
    );
  }
};

/** Carga el catalogo inicial desde disco o, en su defecto, desde el seed. */
const load = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        products = parsed;
        console.log(`[store] ${products.length} productos cargados desde ${DATA_FILE}`);
        return;
      }
    }
  } catch (error) {
    console.warn('[store] No se pudo leer products.json, se usa el seed:', error.message);
  }
  products = SEED_PRODUCTS.map((prod) => ({ ...prod }));
  persist();
  console.log(`[store] Catalogo semilla inicializado con ${products.length} productos`);
};

/** Normaliza y valida el cuerpo de un producto recibido por la API. */
export const sanitizeProduct = (input = {}, { partial = false } = {}) => {
  const clean = (value) => (typeof value === 'string' ? value.trim() : value);

  const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const base = {
    name: clean(input.name) || 'Producto sin nombre',
    category: clean(input.category) || 'redes-conectividad',
    brand: clean(input.brand) || 'Stark',
    description: clean(input.description) || '',
    price: Math.max(0, toNumber(input.price, 0)),
    stock: Math.max(0, Math.trunc(toNumber(input.stock, 0))),
    image: clean(input.image) || '',
    compareAtPrice:
      input.compareAtPrice === null || input.compareAtPrice === ''
        ? null
        : Math.max(0, toNumber(input.compareAtPrice, 0)),
    rating: Math.min(5, Math.max(0, toNumber(input.rating, 4.5))),
    reviews: Math.max(0, Math.trunc(toNumber(input.reviews, 0))),
    featured: Boolean(input.featured),
    flashSale: Boolean(input.flashSale),
    flashDiscount: normalizeFlashDiscount(
      input.flashDiscount ?? FLASH_DISCOUNT_DEFAULT
    ),
    features: Array.isArray(input.features)
      ? input.features.map((f) => clean(f)).filter(Boolean).slice(0, 12)
      : [],
    gallery: Array.isArray(input.gallery)
      ? input.gallery.map((g) => clean(g)).filter(Boolean).slice(0, 6)
      : [],
  };

  // En oferta flash el precio original se deriva del precio final: es la
  // garantia de que el tachado y el porcentaje mostrado siempre sean coherentes.
  if (base.flashSale) {
    base.compareAtPrice = originalPriceFrom(base.price, base.flashDiscount);
  }

  if (partial) {
    // En modo parcial solo se toman los campos presentes en el payload.
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      if (key in base) result[key] = value;
    }
    return result;
  }

  return base;
};

/** Listado con filtros, busqueda y ordenamiento. */
export const listProducts = (filters = {}) => {
  const {
    q = '',
    category = '',
    minPrice,
    maxPrice,
    minStock,
    featured,
    flash,
    sort = 'featured',
    page = 1,
    limit = 0,
  } = filters;

  const needle = normalize(q);
  let result = products.filter((prod) => {
    if (category && category !== 'all' && prod.category !== category) return false;
    if (needle) {
      const haystack = normalize(
        [
          prod.name,
          prod.brand,
          prod.description,
          prod.sku,
          getCategoryLabel(prod.category),
          ...(prod.features ?? []),
        ].join(' '),
      );
      if (!haystack.includes(needle)) return false;
    }
    if (minPrice !== undefined && prod.price < Number(minPrice)) return false;
    if (maxPrice !== undefined && prod.price > Number(maxPrice)) return false;
    if (minStock !== undefined && prod.stock < Number(minStock)) return false;
    if (featured === true && !prod.featured) return false;
    if (flash === true && !prod.flashSale) return false;
    if (flash === false && prod.flashSale) return false;
    return true;
  });

  const sorters = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    newest: (a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  result = [...result].sort(sorters[sort] ?? sorters.featured);

  const total = result.length;

  // Paginacion opcional (limit = 0 devuelve todo).
  if (limit > 0) {
    const size = Math.max(1, Number(limit));
    const current = Math.max(1, Number(page));
    result = result.slice((current - 1) * size, current * size);
  }

  return { items: result, total };
};

/** Obtiene un producto por id o por slug. */
export const getProduct = (id) =>
  products.find((prod) => prod.id === id || prod.slug === id) ?? null;

/** Crea un producto nuevo (ABM - Create). */
export const createProduct = (input) => {
  const data = sanitizeProduct(input);
  const baseSlug = slugify(data.name) || 'producto';
  let slug = baseSlug;
  let suffix = 1;
  while (products.some((prod) => prod.slug === slug)) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
  const product = {
    id: `${baseSlug}-${Date.now().toString(36).slice(-4)}`,
    sku: input.sku?.trim() || buildSku(data.category, products.length + 1),
    slug,
    categoryLabel: getCategoryLabel(data.category),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };
  products.push(product);
  persist();
  return product;
};

/** Actualiza un producto existente (ABM - Update). */
export const updateProduct = (id, input) => {
  const index = products.findIndex((prod) => prod.id === id);
  if (index === -1) return null;

  const data = sanitizeProduct(input, { partial: true });
  const current = products[index];

  const merged = {
    ...current,
    ...data,
    id: current.id,
    slug: current.slug,
    sku: current.sku,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
    categoryLabel:
      data.category && data.category !== current.category
        ? getCategoryLabel(data.category)
        : current.categoryLabel,
  };

  // Si el producto es una oferta flash, recalculamos el precio original para
  // que el tachado y el porcentaje sigan siendo coherentes tras el ABM.
  if (merged.flashSale) {
    merged.compareAtPrice = originalPriceFrom(
      merged.price,
      merged.flashDiscount ?? FLASH_DISCOUNT_DEFAULT
    );
  }

  products[index] = merged;
  persist();
  return products[index];
};

/** Elimina un producto (ABM - Delete). */
export const deleteProduct = (id) => {
  const index = products.findIndex((prod) => prod.id === id);
  if (index === -1) return null;
  const [removed] = products.splice(index, 1);
  persist();
  return removed;
};

/** Devuelve las categorias con el conteo de productos de cada una. */
export const listCategories = () =>
  CATEGORIES.map((cat) => ({
    ...cat,
    count: products.filter((prod) => prod.category === cat.id).length,
  }));

/** Metricas basicas del catalogo (para el dashboard del admin). */
export const getStats = () => {
  const prices = products.map((prod) => prod.price);
  const lowStock = products.filter((prod) => prod.stock <= 10).length;
  const outOfStock = products.filter((prod) => prod.stock === 0).length;
  return {
    total: products.length,
    categories: CATEGORIES.length,
    lowStock,
    outOfStock,
    totalStock: products.reduce((acc, prod) => acc + prod.stock, 0),
    inventoryValue: Number(
      products.reduce((acc, prod) => acc + prod.price * prod.stock, 0).toFixed(2),
    ),
    avgPrice: prices.length
      ? Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2))
      : 0,
  };
};

/** Reinicia el catalogo con los datos semilla (util para demos y dev). */
export const resetToSeed = () => {
  products = SEED_PRODUCTS.map((prod) => ({ ...prod }));
  persist();
  return products;
};

// Carga inicial al importar el modulo.
load();
