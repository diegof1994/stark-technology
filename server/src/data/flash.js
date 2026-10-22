/**
 * Logica compartida de "Ofertas Flash".
 *
 * Una oferta flash es un producto con `flashSale: true` y un descuento
 * porcentual (`flashDiscount`, 70% por defecto). El precio final del
 * producto es el precio de venta y el precio original (el que va tachado)
 * se DERIVA automaticamente del descuento aplicado.
 *
 *   precioFinal = precioOriginal * (1 - descuento / 100)
 *   =>  precioOriginal = precioFinal / (1 - descuento / 100)
 *
 * Ejemplo con 70%: un producto que sale $100 tiene un original de $333,33.
 */

/** Descuento por defecto de las ofertas flash. */
export const FLASH_DISCOUNT_DEFAULT = 70;

/** Limites permitidos para el descuento de una oferta flash. */
export const FLASH_DISCOUNT_MIN = 5;
export const FLASH_DISCOUNT_MAX = 95;

/** Redondea a dos decimales (evita errores de coma flotante en los precios). */
export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

/**
 * Calcula el precio original (tachado) a partir del precio final y el descuento.
 * @param {number} price Precio final de venta.
 * @param {number} [percent] Porcentaje de descuento (por defecto 70).
 * @returns {number|null} Precio original redondeado, o null si no aplica.
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
 * Normaliza el porcentaje de descuento: entero, dentro de los limites permitidos.
 * @param {number} percent
 * @returns {number}
 */
export const normalizeFlashDiscount = (percent) => {
  const value = Number(percent);
  if (!Number.isFinite(value)) return FLASH_DISCOUNT_DEFAULT;
  return Math.min(FLASH_DISCOUNT_MAX, Math.max(FLASH_DISCOUNT_MIN, Math.round(value)));
};

/**
 * Indica si un producto participa de una oferta flash.
 * @param {object} product
 * @returns {boolean}
 */
export const isFlashProduct = (product) =>
  Boolean(product?.flashSale) && Number(product?.flashDiscount) > 0;

/**
 * Calcula el precio final, el original y el ahorro de una oferta flash.
 * @param {object} product
 * @returns {{final:number, original:number|null, discount:number, savings:number}|null}
 */
export const flashPricing = (product) => {
  if (!isFlashProduct(product)) return null;

  const final = round2(product.price);
  const discount = normalizeFlashDiscount(product.flashDiscount);
  const original = originalPriceFrom(product.price, discount);

  return {
    final,
    original,
    discount,
    savings: original ? round2(original - final) : 0,
  };
};
