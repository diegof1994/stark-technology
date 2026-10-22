import { IconBolt } from './Icons.jsx';
import { flashPricing, urgencyMessage } from '../utils/flash.js';

/**
 * FlashUrgency - Bloque de urgencia comercial de la Oferta Flash.
 *
 * Combina un copy rotativo ("¡El descuento de tu vida!") con la escasez real
 * del inventario ("¡Quedan 12!"). Se usa debajo del precio en la tarjeta y
 * en la ficha del producto.
 *
 * @param {object} props
 * @param {object} props.product Producto en oferta.
 * @param {string} [props.className] Clases extra del contenedor.
 * @param {boolean} [props.showStock] Muestra el aviso de escasez.
 */
export default function FlashUrgency({ product, className = '', showStock = true }) {
  const pricing = flashPricing(product);
  if (!pricing) return null;

  const message = urgencyMessage(product?.id);
  const lowStock = Number(product.stock) > 0 && Number(product.stock) <= 15;

  return (
    <p
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-flare-500/45 bg-gradient-to-r from-flare-500/15 via-red-500/10 to-transparent px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-flare-300 ${className}`}
      data-testid="flash-urgency"
    >
      <span className="inline-flex items-center gap-1">
        <IconBolt className="h-3.5 w-3.5 shrink-0 text-ember-400" />
        {message}
      </span>

      {showStock && lowStock && (
        <>
          <span className="text-flare-500/50" aria-hidden="true">
            |
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-400">
            ¡Quedan {product.stock}!
          </span>
        </>
      )}
    </p>
  );
}
