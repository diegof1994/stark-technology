/**
 * Utilidades de "Ofertas Flash" para el frontend.
 *
 * Espejo de la logica del servidor (`server/src/data/flash.js`): el precio
 * original de una oferta flash NO se guarda a mano, se deriva del precio
 * final y del descuento aplicado.
 *
 *   precioFinal = precioOriginal * (1 - descuento / 100)
 *   =>  precioOriginal = precioFinal / (1 - descuento / 100)
 */

/** Descuento por defecto de las ofertas flash. */
export const FLASH_DISCOUNT_DEFAULT = 70;

/** Limites permitidos para el descuento de una oferta flash. */
export const FLASH_DISCOUNT_MIN = 5;
export const FLASH_DISCOUNT_MAX = 95;

/** Redondea a dos decimales (evita errores de coma flotante). */
export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

/**
 * Indica si un producto participa de una oferta flash.
 * @param {object} product
 * @returns {boolean}
 */
export const isFlashProduct = (product) =>
  Boolean(product?.flashSale) && Number(product?.flashDiscount) > 0;

/**
 * Calcula el precio original (tachado) a partir del precio final y el descuento.
 * @param {number} price Precio final de venta.
 * @param {number} [percent] Porcentaje de descuento (por defecto 70).
 * @returns {number|null}
 */
export const originalPriceFrom = (price, percent = FLASH_DISCOUNT_DEFAULT) => {
  const finalPrice = Number(price) || 0;
  const discount = Number(percent) || 0;
  if (finalPrice <= 0 || discount <= 0) return null;

  const factor = 1 - discount / 100;
  if (factor <= 0) return null;

  return round2(finalPrice / factor);
};

/**
 * Resuelve todos los datos de precio de una oferta flash.
 * @param {object} product
 * @returns {{final:number, original:number|null, discount:number, savings:number}|null}
 */
export const flashPricing = (product) => {
  if (!isFlashProduct(product)) return null;

  const final = round2(product.price);
  const discount = Number(product.flashDiscount) || FLASH_DISCOUNT_DEFAULT;
  // Preferimos el precio original que manda el servidor; si falta, lo derivamos.
  const original =
    Number(product.compareAtPrice) > final
      ? round2(product.compareAtPrice)
      : originalPriceFrom(final, discount);

  return {
    final,
    original,
    discount,
    savings: original ? round2(original - final) : 0,
  };
};

/**
 * Copys de urgencia comercial. Se rotan de forma deterministica por producto
 * para que el mensaje no cambie en cada render.
 */
export const URGENCY_MESSAGES = [
  '¡El descuento de tu vida!',
  '¡Solo por hoy - 24h corriendo!',
  'Últimas unidades a este precio',
  '¡Precio relámpago!',
  '¡No va a durar!',
];

/**
 * Elige el copy de urgencia de forma estable para un producto dado.
 * @param {string} seed Identificador del producto.
 * @returns {string}
 */
export const urgencyMessage = (seed = '') => {
  const hash = [...String(seed)].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000,
    7,
  );
  return URGENCY_MESSAGES[hash % URGENCY_MESSAGES.length];
};

/**
 * Momento de vencimiento de la oferta: la medianoche del dia siguiente.
 * Genera una ventana de 24h reales que se renueva sola cada dia.
 * @param {number} [now]
 * @returns {number} Timestamp en ms.
 */
export const nextDeadline = (now = Date.now()) => {
  const date = new Date(now);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
};

/**
 * Descompone los milisegundos restantes en unidades de cuenta regresiva.
 * @param {number} ms
 * @returns {{hours:string, minutes:string, seconds:string}}
 */
export const countdownParts = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
    seconds: String(total % 60).padStart(2, '0'),
  };
};
