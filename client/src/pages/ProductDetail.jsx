import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';

import {
  IconAlert,
  IconArrowRight,
  IconCart,
  IconCheck,
  IconShield,
  IconStar,
  IconTruck,
} from '../components/Icons.jsx';
import { getProduct, getProducts } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';
import { flashPricing, nextDeadline } from '../utils/flash.js';
import FlashBadge from '../components/FlashBadge.jsx';
import FlashCountdown from '../components/FlashCountdown.jsx';
import FlashPrice from '../components/FlashPrice.jsx';
import FlashUrgency from '../components/FlashUrgency.jsx';
import StruckPrice from '../components/StruckPrice.jsx';
import Skeleton from '../components/Skeleton.jsx';

/**
 * ProductDetail - Ficha de producto.
 *
 * Dos columnas: galeria con miniaturas (sticky en desktop) y ficha de
 * compra con precio, caracteristicas y panel de accion. En productos en
 * Oferta Flash suma la cabecera de cuenta regresiva y el precio neón.
 */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setQuantity(1);
    setActiveImage(0);

    getProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data.product);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* --- Productos relacionados de la misma categoria --- */
  useEffect(() => {
    if (!product) return;
    getProducts({ category: product.category })
      .then((data) =>
        setRelated(
          (data.products ?? [])
            .filter((item) => item.id !== product.id)
            .slice(0, 4),
        ),
      )
      .catch(() => setRelated([]));
  }, [product]);

  const handleAdd = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.warning('Producto sin stock');
      return;
    }
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  const discount = product ? discountPercent(product.price, product.compareAtPrice) : 0;
  const flash = product ? flashPricing(product) : null;
  const gallery = product
    ? [product.image, ...(product.gallery ?? [])].filter(Boolean)
    : [];

  /* --- Estado de carga --- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-1/2 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  /* --- Error --- */
  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-xl border border-danger/30 bg-danger/10">
          <IconAlert className="h-6 w-6 text-danger" />
        </span>
        <h1 className="mt-5 font-display text-lg font-bold tracking-tight text-strong">
          Producto no encontrado
        </h1>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <Link to="/catalogo" className="btn-ember mt-6">
          Volver al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* --- Migas de pan --- */}
      <nav className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
        <Link to="/" className="transition-colors hover:text-accent">
          Inicio
        </Link>
        <span className="text-line-strong">/</span>
        <Link to="/catalogo" className="transition-colors hover:text-accent">
          Catalogo
        </Link>
        <span className="text-line-strong">/</span>
        <Link
          to={`/catalogo?category=${product.category}`}
          className="transition-colors hover:text-accent"
        >
          {product.categoryLabel || product.category}
        </Link>
        <span className="text-line-strong">/</span>
        <span className="text-muted">{product.name}</span>
      </nav>

      {/* ==========================================================
          BANDEJA DE OFERTA FLASH
          ========================================================== */}
      {flash && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-flare-500/35 bg-gradient-to-r from-flare-500/16 via-red-500/8 to-transparent px-5 py-3.5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <FlashBadge product={product} className="!px-3 !py-1.5 !text-xs" />
            <span className="font-display text-sm font-semibold tracking-tight text-strong">
              -{flash.discount}% OFF en esta unidad
            </span>
          </div>
          <FlashCountdown deadline={nextDeadline()} />
        </motion.div>
      )}

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_1fr] xl:gap-16">
        {/* ==========================================================
            GALERIA
            ========================================================== */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="surface overflow-hidden"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
              <img
                src={gallery[activeImage] || product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {discount > 0 && !flash && (
                <span className="absolute left-4 top-4 rounded-lg bg-gradient-to-br from-flare-400 to-flare-500 px-3 py-1.5 font-display text-xs font-bold text-on-flash shadow-flare">
                  -{discount}%
                </span>
              )}
              {flash && (
                <div className="absolute left-4 top-4">
                  <FlashBadge product={product} className="!px-3 !py-1.5 !text-xs" />
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 grid place-items-center bg-overlay/75 backdrop-blur-[2px]">
                  <span className="rounded-lg border border-danger/40 bg-danger/12 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.15em] text-danger">
                    Sin stock
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Ver vista ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border transition-all ${
                    activeImage === index
                      ? 'border-accent-strong shadow-ember'
                      : 'border-line opacity-55 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} vista ${index + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ==========================================================
            INFORMACION
            ========================================================== */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip !border-accent/40 !text-accent">
              {product.categoryLabel || product.category}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
              {product.brand} &middot; {product.sku}
            </span>
          </div>

          <h1 className="mt-4 font-display text-[clamp(1.6rem,3.2vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.025em] text-strong">
            {product.name}
          </h1>

          {/* --- Rating --- */}
          <div className="mt-3 flex items-center gap-2.5">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <IconStar
                  key={index}
                  filled={index < Math.round(product.rating ?? 0)}
                  className={`h-4 w-4 ${
                    index < Math.round(product.rating ?? 0)
                      ? 'text-warning'
                      : 'text-faint'
                  }`}
                />
              ))}
            </span>
            <span className="font-mono text-[11px] text-muted tabular">
              {Number(product.rating ?? 0).toFixed(1)} &middot; {product.reviews ?? 0}{' '}
              resenas
            </span>
          </div>

          {/* --- Precio --- */}
          {flash ? (
            <div className="mt-7">
              <FlashPrice product={product} size="detail" />

              <div className="mt-3.5">
                <FlashUrgency product={product} />
              </div>

              <p className="mt-3 font-mono text-[10px] font-light uppercase tracking-[0.14em] text-muted">
                Precio con IVA &middot; 3 y 6 cuotas sin interes &middot;{' '}
                <span className="text-savings-ink">
                  -{flash.discount}% sobre el precio de lista
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-7">
              <div className="flex flex-wrap items-end gap-3">
                <span className="font-display text-4xl font-bold tracking-tight text-strong tabular">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <>
                    <StruckPrice size="lg">
                      {formatPrice(product.compareAtPrice)}
                    </StruckPrice>
                    <span className="rounded-md border border-accent-2/30 bg-accent-2/10 px-2.5 py-1 font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-accent-2">
                      Ahorras {formatPrice(product.compareAtPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2.5 font-mono text-[10px] font-light uppercase tracking-[0.14em] text-muted">
                Precio con IVA &middot; 3 y 6 cuotas sin interes
              </p>
            </div>
          )}

          {/* --- Descripcion --- */}
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          {/* --- Caracteristicas --- */}
          {product.features?.length > 0 && (
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-1 px-3.5 py-2.5 text-[13px] leading-snug"
                >
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-body">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* --- Panel de compra --- */}
          <div className="surface mt-8 rounded-xl p-5">
            <div className="flex flex-wrap items-center gap-3">
              {/* Cantidad */}
              <div className="flex items-center rounded-full border border-line bg-surface-2">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="grid h-11 w-11 place-items-center rounded-l-full text-muted transition-colors hover:text-accent disabled:opacity-30"
                >
                  &minus;
                </button>
                <span className="w-10 text-center font-display text-sm font-bold text-strong tabular">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(product.stock || 99, value + 1))
                  }
                  disabled={quantity >= (product.stock || 99)}
                  aria-label="Aumentar cantidad"
                  className="grid h-11 w-11 place-items-center rounded-r-full text-muted transition-colors hover:text-accent disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`btn-ember flex-1 !py-3.5 ${flash ? 'btn-flash' : ''}`}
              >
                <IconCart className="h-4 w-4" />
                {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>

            {/* Barra de stock */}
            {product.stock > 0 && (
              <div className="mt-4">
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      product.stock <= 10 ? 'bg-danger' : 'bg-accent-strong'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(6, (product.stock / 120) * 100))}%`,
                    }}
                  />
                </div>
                <p
                  className={`mt-2.5 font-mono text-[10px] font-light uppercase tracking-[0.14em] ${
                    product.stock <= 0
                      ? 'text-danger'
                      : product.stock <= 10
                        ? 'text-warning'
                        : 'text-muted'
                  }`}
                >
                  {product.stock <= 0
                    ? 'Producto agotado'
                    : product.stock <= 10
                      ? `Solo quedan ${product.stock} unidades`
                      : `${product.stock} unidades disponibles`}
                </p>
              </div>
            )}
          </div>

          {/* --- Beneficios --- */}
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { Icon: IconShield, text: 'Garantia de fabrica' },
              { Icon: IconTruck, text: 'Envio gratis +$50.000' },
              { Icon: IconCheck, text: 'Soporte tecnico 24/7' },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs text-muted">
                <Icon className="h-4 w-4 shrink-0 text-accent" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ==========================================================
          RELACIONADOS
          ========================================================== */}
      {related.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow">Tambien te puede interesar</p>
          <h2 className="mt-2 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold tracking-[-0.02em] text-strong">
            De la misma categoria
          </h2>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/producto/${item.id}`}
                className="card-tech group block overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 min-h-[2.25rem] font-display text-[13px] font-semibold leading-snug text-strong transition-colors group-hover:text-accent">
                    {item.name}
                  </p>
                  {item.flashSale ? (
                    /* En ofertas flash el precio final va en verde neon. */
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-savings-ink tabular">
                        {formatPrice(item.price)}
                      </span>
                      <StruckPrice>{formatPrice(item.compareAtPrice)}</StruckPrice>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap items-baseline gap-2">
                      <span className="font-display text-lg font-bold text-strong tabular">
                        {formatPrice(item.price)}
                      </span>
                      {item.compareAtPrice > item.price && (
                        <StruckPrice>{formatPrice(item.compareAtPrice)}</StruckPrice>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/catalogo?category=${product.category}`)}
            className="btn-ghost mt-8"
          >
            Ver toda la categoria
            <IconArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      )}
    </div>
  );
}
