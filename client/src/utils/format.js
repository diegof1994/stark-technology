/** Utilidades de formato para toda la aplicacion. */

/** Formatea un numero como moneda argentina (ARS). */
export const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

/** Formatea un numero simple con separador de miles. */
export const formatNumber = (value) =>
  new Intl.NumberFormat('es-AR').format(Number(value) || 0);

/** Normaliza texto para busquedas: sin acentos ni mayusculas. */
export const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Genera un id unico para elementos locales. */
export const uid = () => Math.random().toString(36).slice(2, 10);

/** Convierte un texto en un slug SEO-friendly. */
export const slugify = (text = '') =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Calcula el descuento porcentual entre precio actual y precio anterior. */
export const discountPercent = (price, compareAtPrice) => {
  const p = Number(price);
  const c = Number(compareAtPrice);
  if (!c || c <= p) return 0;
  return Math.round(((c - p) / c) * 100);
};

/** Devuelve las iniciales de un nombre (para avatares). */
export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

/** Formatea una fecha ISO a formato legible es-AR. */
export const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '-';
  }
};
