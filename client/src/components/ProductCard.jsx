import { useState } from 'react';
import { Link } from 'react-router-dom';

import QuickView from './QuickView.jsx';

import { useCart } from '../context/CartContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';
import { FALLBACK_IMAGE } from '../utils/fallbackImage.js';
import { flashPricing } from '../utils/flash.js';

export const INSTALLMENTS = 6;
export const FREE_SHIPPING_FROM = 150000;

/**
 * ProductCard - Tarjeta de producto estilo tienda convencional.
 *
 * Foto, nombre, precio (con el anterior tachado si hay descuento), cuotas,
 * envio gratis cuando corresponde y boton de agregar al carrito.
 * No muestra datos internos (stock exacto, SKU, rubro tecnico).
 */
export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const [quickOpen, setQuickOpen] = useState(false);

  // Precio "antes": el de la oferta si existe, si no el compareAtPrice.
  const flash = flashPricing(product);
  const before = flash?.original ?? product.compareAtPrice;
  const discount = discountPercent(product.price, before);

  const outOfStock = product.stock <= 0;
  const lastUnits = !outOfStock && product.stock <= 5;
  const freeShipping = product.price >= FREE_SHIPPING_FROM;

  const handleAdd = (event) => {
    event.preventDefault();
    if (outOfStock) return;
    addItem(product, 1);
    openCart();
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface-1 transition-shadow duration-200 hover:shadow-lift">
      <button
        type="button"
        onClick={() => setQuickOpen(true)}
        aria-label={`Vista rapida de ${product.name}`}
        className="relative block aspect-square w-full overflow-hidden bg-surface-2"
      >
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-on-accent">
            {discount}% OFF
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-strong/80 py-1.5 text-center text-xs font-semibold text-surface-1">
            Sin stock
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-surface-1/95 py-2 text-center text-xs font-semibold text-strong opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100">
          Vista rapida
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/producto/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] font-sans text-sm leading-5 text-strong transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3">
          {discount > 0 && (
            <p className="text-xs text-faint line-through">{formatPrice(before)}</p>
          )}
          <p className="text-2xl font-semibold tracking-tight text-strong tabular">
            {formatPrice(product.price)}
          </p>
          <p className="mt-0.5 text-xs text-success">
            {INSTALLMENTS} cuotas sin interes de {formatPrice(product.price / INSTALLMENTS)}
          </p>
          {freeShipping && <p className="mt-0.5 text-xs font-semibold text-success">Envio gratis</p>}
          {lastUnits && <p className="mt-0.5 text-xs text-warning">Ultimas unidades</p>}
        </div>

        <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={`Agregar ${product.name} al carrito`}
          className="w-full rounded-full border border-accent py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-on-accent disabled:cursor-not-allowed disabled:border-line disabled:text-faint disabled:hover:bg-transparent"
        >
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
        </div>
      </div>

      {quickOpen && <QuickView product={product} onClose={() => setQuickOpen(false)} />}
    </article>
  );
}
