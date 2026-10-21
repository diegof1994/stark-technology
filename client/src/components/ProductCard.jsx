import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';
import { FALLBACK_IMAGE } from '../utils/fallbackImage.js';
import { IconCart, IconStar } from './Icons.jsx';

/**
 * ProductCard - Tarjeta de producto del catalogo.
 * Incluye: imagen con overlay, badges, precio, stock y boton de agregado rapido.
 */
export default function ProductCard({ product, index = 0 }) {
  const { addItem, openCart } = useCart();
  const toast = useToast();

  const discount = discountPercent(product.price, product.compareAtPrice);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 10;

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) {
      toast.warning('Producto sin stock disponible');
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="card-tech group flex h-full flex-col"
    >
      <Link
        to={`/producto/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink-800"
      >
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent opacity-80" />

        {/* --- Badges --- */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="rounded-lg bg-gradient-to-br from-flare-400 to-flare-500 px-2 py-1 font-display text-[10px] font-bold tracking-wider text-white shadow-flare">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="rounded-lg bg-ember-500/90 px-2 py-1 font-display text-[10px] font-bold tracking-wider text-ink-950">
              DESTACADO
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/75 backdrop-blur-[2px]">
            <span className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-red-300">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      {/* --- Contenido --- */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-ember-400/90">
            {product.categoryLabel || product.category}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-amber-300">
            <IconStar className="h-3 w-3" filled />
            {Number(product.rating ?? 0).toFixed(1)}
          </span>
        </div>

        <Link to={`/producto/${product.id}`} className="group/link">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-slate-100 transition-colors group-hover/link:text-ember-300">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
          {product.description}
        </p>

        {/* --- Precio --- */}
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-slate-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 font-mono text-[10px] uppercase tracking-wider ${
                outOfStock
                  ? 'text-red-400'
                  : lowStock
                    ? 'text-amber-400'
                    : 'text-slate-500'
              }`}
            >
              {outOfStock
                ? 'Agotado'
                : lowStock
                  ? `Ultimas ${product.stock} unidades`
                  : `${product.stock} en stock`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Agregar ${product.name} al carrito`}
            className="btn-ember h-10 w-10 shrink-0 !px-0"
          >
            <IconCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
