import { flashPricing } from '../utils/flash.js';

/**
 * FlashBadge - Sticker de "Oferta Flash" para la esquina de la tarjeta.
 *
 * Calcomania inclinada con degradado rojo/naranja y latido suave: capta la
 * atencion sin tapar la ficha del producto. El texto es siempre blanco
 * porque el degradado es claro en ambos temas.
 *
 * @param {object} props
 * @param {object} [props.product] Producto del que se toma el descuento.
 * @param {number} [props.discount] Descuento explicito (tiene prioridad).
 * @param {string} [props.className] Clases extra del contenedor.
 */
export default function FlashBadge({ product, discount, className = '' }) {
  const pricing = flashPricing(product);
  const percent = discount ?? pricing?.discount;

  if (!percent || percent <= 0) return null;

  return (
    <span
      className={`animate-pulse-flash inline-flex items-center gap-1 rounded-md bg-gradient-to-br from-red-500 via-flare-500 to-ember-500 px-2 py-1 font-display text-[10px] font-black uppercase tracking-[0.08em] text-on-flash shadow-flare ${className}`}
      role="status"
      aria-label={`Oferta flash: ${percent} por ciento de descuento`}
    >
      <span aria-hidden="true">🔥</span>
      {percent}% OFF
    </span>
  );
}
