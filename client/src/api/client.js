/**
 * Cliente HTTP de Stack Technology.
 *
 * En desarrollo usa el proxy de Vite (`/api` -> http://localhost:4000).
 * En produccion se define `VITE_API_URL` con la URL del servicio de Render.
 */

const RAW_BASE = import.meta.env.VITE_API_URL ?? '';
export const API_BASE = RAW_BASE.replace(/\/+$/, '');

/**
 * Clave de administrador (cabecera x-admin-token).
 * La escribe el administrador al iniciar sesion y se guarda solo en esta
 * pestana (sessionStorage). Nunca se incluye en el codigo publicado.
 */
const TOKEN_KEY = 'stark_admin_token';

export const getAdminToken = () => {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAdminToken = (token) => {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
};

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
        ...(options.admin ? { 'x-admin-token': getAdminToken() } : {}),
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
 *           maxPrice?: number, featured?: boolean, flash?: boolean,
 *           limit?: number }} filters
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

/**
 * GET /api/products/flash
 * Devuelve unicamente los productos en Oferta Flash.
 * @param {{ limit?: number, sort?: string }} options
 */
export const getFlashProducts = (options = {}) => {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const qs = params.toString();
  return request(`/products/flash${qs ? `?${qs}` : ''}`);
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

/** POST /api/orders/:code/simulate (solo modo simulacion) */
export const simulatePayment = (code, status) =>
  request(`/orders/${encodeURIComponent(code)}/simulate`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });

/* ------------------------------------------------------------------
 * Pedidos (admin)
 * ------------------------------------------------------------------ */

/** GET /api/orders */
export const getOrders = () => request('/orders', { admin: true });

/** PATCH /api/orders/:id */
export const updateOrderStatus = (id, status) =>
  request(`/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    admin: true,
  });

export default {
  getProducts,
  getFlashProducts,
  getProduct,
  getCategories,
  getStats,
  createProduct,
  updateProduct,
  deleteProduct,
  createPreference,
  getPaymentConfig,
};
