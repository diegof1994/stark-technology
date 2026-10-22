import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';
import { FALLBACK_IMAGE } from '../utils/fallbackImage.js';
import { flashPricing } from '../utils/flash.js';
import FlashBadge from './FlashBadge.jsx';
import FlashPrice from './FlashPrice.jsx';
import FlashUrgency from './FlashUrgency.jsx';
import StruckPrice from './StruckPrice.jsx';
import { IconCart, IconStar } from './Icons.jsx';

/**
 * ProductCard - Tarjeta de producto del catalogo.
 *
 * Anatomia: imagen con zoom y etiquetas superpuestas, ficha tecnica, bloque
 * de precio y accion de agregado rapido. En productos en Oferta Flash suma el
 * sticker de descuento, el precio original tachado y el bloque de urgencia.
 */
export default function ProductCard({ product, index = 0 }) {
  const { addItem, openCart } = useCart();
  const toast = useToast();

  const flash = flashPricing(product);
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
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}
      className={`card-tech group flex h-full flex-col ${
        flash ? 'border-savings-500/40' : ''
      }`}
    >
      {/* ---------------------------------------------------------
          Imagen
          --------------------------------------------------------- */}
      <Link
        to={`/producto/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-2"
      >
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Velo inferior para legibilidad de las etiquetas */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/85 via-canvas/10 to-transparent opacity-80" />

        {/* --- Etiquetas superiores --- */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && !flash && (
            <span className="rounded-md bg-flare-500 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-on-flash">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="rounded-md border border-line bg-surface-1/85 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-strong backdrop-blur">
              Destacado
            </span>
          )}
        </div>

        {/* --- Sticker de oferta flash (esquina superior derecha) --- */}
        {flash && (
          <div className="absolute right-3 top-3">
            <FlashBadge product={product} />
          </div>
        )}

        {/* --- Valoracion sobre la imagen --- */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-line bg-surface-1/85 px-2 py-1 backdrop-blur">
          <IconStar className="h-3 w-3 text-warning" filled />
          <span className="font-mono text-[10px] font-medium text-strong tabular">
            {Number(product.rating ?? 0).toFixed(1)}
          </span>
        </div>

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-canvas/80 backdrop-blur-[2px]">
            <span className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-danger">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      {/* ---------------------------------------------------------
          Contenido
          --------------------------------------------------------- */}
      <div className="flex flex-1 flex-col p-5">
        <p className="tech-label truncate">{product.categoryLabel || product.category}</p>

        <Link to={`/producto/${product.id}`} className="group/link mt-2">
          <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-[15px] font-semibold leading-snug tracking-tight text-strong transition-colors group-hover/link:text-accent">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {product.description}
        </p>

        {/* --- Urgencia comercial (solo ofertas flash) --- */}
        {flash && (
          <FlashUrgency product={product} className="mt-4 w-full justify-center" />
        )}

        {/* ---------------------------------------------------------
            Precio + accion
            --------------------------------------------------------- */}
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <div className="min-w-0">
            {flash ? (
              <FlashPrice product={product} />
            ) : (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-strong tabular">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <StruckPrice>{formatPrice(product.compareAtPrice)}</StruckPrice>
                )}
              </div>
            )}

            {/* Etiqueta de unidades: fina y sutil para no competir con el precio. */}
            <p
              className={`mt-1.5 font-mono text-[10px] font-light uppercase tracking-[0.12em] ${
                outOfStock
                  ? 'text-danger'
                  : lowStock
                    ? 'text-warning'
                    : 'text-faint'
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
            className={`btn-ember h-10 w-10 shrink-0 !px-0 ${flash ? 'btn-flash' : ''}`}
          >
            <IconCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
