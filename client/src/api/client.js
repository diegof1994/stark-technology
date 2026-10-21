/**
 * Cliente HTTP de Stark Technology.
 *
 * En desarrollo usa el proxy de Vite (`/api` -> http://localhost:4000).
 * En produccion se define `VITE_API_URL` con la URL del servicio de Render.
 */

const RAW_BASE = import.meta.env.VITE_API_URL ?? '';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

/** Token de administrador (cabecera x-admin-token). */
export const ADMIN_TOKEN =
  import.meta.env.VITE_ADMIN_TOKEN || 'stark-dev-admin';

/** Error enriquecido con el status HTTP para branching en la UI. */
export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Wrapper de fetch con JSON, timeout y errores normalizados.
 * @param {string} path Ruta relativa a /api (ej: '/products')
 * @param {RequestInit} options
 */
const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}/api${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.admin ? { 'x-admin-token': ADMIN_TOKEN } : {}),
        ...(options.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new ApiError(
        payload.message || `Error ${response.status} al llamar a ${path}`,
        response.status,
        payload,
      );
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw new ApiError('La peticion tardo demasiado. Revisa tu conexion.', 408, {});
    }
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend este corriendo.',
      0,
      {},
    );
  } finally {
    clearTimeout(timeout);
  }
};

/* ------------------------------------------------------------------
 * API de productos
 * ------------------------------------------------------------------ */

/**
 * GET /api/products
 * @param {{ q?: string, category?: string, sort?: string, minPrice?: number,
 *           maxPrice?: number, featured?: boolean, limit?: number }} filters
 */
export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return request(`/products${qs ? `?${qs}` : ''}`);
};

/** GET /api/products/:id */
export const getProduct = (id) => request(`/products/${encodeURIComponent(id)}`);

/** GET /api/categories */
export const getCategories = () => request('/categories');

/** GET /api/products/stats */
export const getStats = () => request('/products/stats');

/* ------------------------------------------------------------------
 * API de administracion (ABM)
 * ------------------------------------------------------------------ */

/** POST /api/products */
export const createProduct = (product) =>
  request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
    admin: true,
  });

/** PUT /api/products/:id */
export const updateProduct = (id, product) =>
  request(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(product),
    admin: true,
  });

/** DELETE /api/products/:id */
export const deleteProduct = (id) =>
  request(`/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    admin: true,
  });

/* ------------------------------------------------------------------
 * API de pagos
 * ------------------------------------------------------------------ */

/** POST /api/create-preference */
export const createPreference = (payload) =>
  request('/create-preference', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/** GET /api/payments/config */
export const getPaymentConfig = () => request('/payments/config');

export default {
  getProducts,
  getProduct,
  getCategories,
  getStats,
  createProduct,
  updateProduct,
  deleteProduct,
  createPreference,
  getPaymentConfig,
};
