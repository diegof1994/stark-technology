import { formatPrice } from '../utils/format.js';
import { flashPricing } from '../utils/flash.js';
import StruckPrice from './StruckPrice.jsx';

/**
 * FlashPrice - Bloque de precio para una Oferta Flash.
 *
 * Muestra el precio final (grande, en verde esmeralda de acento) junto al
 * precio original con tachado DIAGONAL y el ahorro en pesos. Si el producto
 * no es una oferta flash, degrada al precio normal sin tachado.
 *
 * @param {object} props
 * @param {object} props.product Producto a mostrar.
 * @param {'card'|'detail'} [props.size] Variante de tamaño.
 * @param {boolean} [props.showSavings] Muestra el chip de ahorro.
 */
export default function FlashPrice({ product, size = 'card', showSavings = true }) {
  const pricing = flashPricing(product);

  // --- Producto normal: precio simple, sin tachado. ---
  if (!pricing) {
    return (
      <span className="font-display text-lg font-bold text-white">
        {formatPrice(product.price)}
      </span>
    );
  }

  const isDetail = size === 'detail';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        {/* --- Precio final (destacado, color neón) --- */}
        <span
          className={`font-display font-black leading-none text-savings-400 ${
            isDetail ? 'text-4xl sm:text-5xl' : 'text-xl'
          }`}
          data-testid="flash-final-price"
        >
          {formatPrice(pricing.final)}
        </span>

        {/* --- Precio original con tachado diagonal --- */}
        {pricing.original && (
          <StruckPrice
            size={isDetail ? 'base' : 'sm'}
            data-testid="flash-original-price"
          >
            {formatPrice(pricing.original)}
          </StruckPrice>
        )}
      </div>

      {/* --- Ahorro en pesos --- */}
      {showSavings && pricing.savings > 0 && (
        <span
          className="inline-flex w-fit items-center gap-1 rounded-md border border-savings-500/40 bg-savings-500/12 px-1.5 py-0.5 font-mono text-[10px] font-normal uppercase tracking-wider text-savings-300"
          data-testid="flash-savings"
        >
          Ahorras {formatPrice(pricing.savings)}
        </span>
      )}
    </div>
  );
}
