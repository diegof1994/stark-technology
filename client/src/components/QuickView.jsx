import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';
import { FALLBACK_IMAGE } from '../utils/fallbackImage.js';
import { flashPricing } from '../utils/flash.js';
import { IconClose, IconMinus, IconPlus } from './Icons.jsx';

const INSTALLMENTS = 6;
const FREE_SHIPPING_FROM = 150000;

/**
 * QuickView - Vista rapida de un producto en un modal.
 * Permite ver foto, precio y descripcion y agregar al carrito sin salir de la pagina.
 */
export default function QuickView({ product, onClose }) {
  const { addItem, openCart } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);

  // Cierre con Escape y bloqueo del scroll de fondo.
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const flash = flashPricing(product);
  const before = flash?.original ?? product.compareAtPrice;
  const discount = discountPercent(product.price, before);
  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(1, Math.min(product.stock, 10));

  const add = () => {
    if (outOfStock) return;
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
    onClose();
    openCart();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-overlay/60 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Vista rapida: ${product.name}`}
        onClick={(event) => event.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-surface-1 shadow-panel sm:grid-cols-2 sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista rapida"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface-1/90 text-strong shadow-card hover:bg-surface-2"
        >
          <IconClose className="h-4 w-4" />
        </button>

        <div className="relative aspect-square bg-surface-2">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover"
          />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-on-accent">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="flex flex-col p-6">
          <p className="text-xs text-muted">{product.brand}</p>
          <h2 className="mt-1 font-sans text-xl font-semibold leading-snug text-strong">
            {product.name}
          </h2>

          <div className="mt-4">
            {discount > 0 && (
              <p className="text-sm text-faint line-through">{formatPrice(before)}</p>
            )}
            <p className="text-3xl font-semibold tracking-tight text-strong tabular">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 text-sm text-success">
              {INSTALLMENTS} cuotas sin interes de {formatPrice(product.price / INSTALLMENTS)}
            </p>
            {product.price >= FREE_SHIPPING_FROM && (
              <p className="text-sm font-semibold text-success">Envio gratis</p>
            )}
          </div>

          <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-body">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-line-strong">
              <button
                type="button"
                aria-label="Restar unidad"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center text-muted hover:text-accent"
              >
                <IconMinus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular">{quantity}</span>
              <button
                type="button"
                aria-label="Sumar unidad"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                className="grid h-10 w-10 place-items-center text-muted hover:text-accent"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={add}
              disabled={outOfStock}
              className="btn-ember h-10 flex-1"
            >
              {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>

          <Link
            to={`/producto/${product.id}`}
            onClick={onClose}
            className="mt-4 text-center text-sm font-medium text-accent hover:underline"
          >
            Ver detalle completo
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
