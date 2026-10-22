import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';

import { IconAlert, IconArrowRight, IconCart, IconCheck, IconShield, IconStar, IconTruck } from '../components/Icons.jsx';
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

/**
 * ProductDetail - Ficha de producto con galeria, specs y agregado al carrito.
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
          <div className="aspect-square animate-pulse rounded-2xl bg-ink-800" />
          <div className="space-y-4">
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-700" />
            <div className="h-8 w-4/5 animate-pulse rounded bg-ink-700" />
            <div className="h-4 w-full animate-pulse rounded bg-ink-700" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-ink-700" />
            <div className="h-12 w-1/2 animate-pulse rounded bg-ink-700" />
          </div>
        </div>
      </div>
    );
  }

  /* --- Error --- */
  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <IconAlert className="h-10 w-10 text-red-400" />
        <h1 className="mt-5 font-display text-lg font-bold uppercase tracking-[0.12em] text-white">
          Producto no encontrado
        </h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link to="/catalogo" className="btn-ember mt-6">
          Volver al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* --- Migas de pan --- */}
      <nav className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-600">
        <Link to="/" className="transition-colors hover:text-ember-300">
          Inicio
        </Link>
        <span>/</span>
        <Link to="/catalogo" className="transition-colors hover:text-ember-300">
          Catalogo
        </Link>
        <span>/</span>
        <Link
          to={`/catalogo?category=${product.category}`}
          className="transition-colors hover:text-ember-300"
        >
          {product.categoryLabel || product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* ==========================================================
            GALERIA
            ========================================================== */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-tech relative aspect-square overflow-hidden"
          >
            <img
              src={gallery[activeImage] || product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-xl bg-gradient-to-br from-flare-400 to-flare-500 px-3 py-1.5 font-display text-xs font-bold shadow-flare">
                -{discount}%
              </span>
            )}
            {product.stock <= 0 && (
              <div className="absolute inset-0 grid place-items-center bg-ink-950/75 backdrop-blur-[2px]">
                <span className="rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.15em] text-red-300">
                  Sin stock
                </span>
              </div>
            )}
          </motion.div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border transition-all ${
                    activeImage === index
                      ? 'border-ember-400 shadow-ember'
                      : 'border-ink-600 opacity-60 hover:opacity-100'
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
            <span className="chip !border-ember-500/40 !text-ember-300">
              {product.categoryLabel || product.category}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {product.brand} &middot; {product.sku}
            </span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold uppercase leading-tight tracking-[0.02em] text-white sm:text-3xl">
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
                      ? 'text-amber-400'
                      : 'text-ink-600'
                  }`}
                />
              ))}
            </span>
            <span className="font-mono text-xs text-slate-400">
              {Number(product.rating ?? 0).toFixed(1)} ({product.reviews ?? 0} resenas)
            </span>
          </div>

          {/* --- Precio --- */}
          {flash ? (
            <div className="mt-6">
              {/* Cabecera de oferta flash: sticker + cuenta regresiva */}
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <FlashBadge product={product} className="!px-3 !py-1.5 !text-xs" />
                <FlashCountdown deadline={nextDeadline()} />
              </div>

              <FlashPrice product={product} size="detail" />

              <div className="mt-3">
                <FlashUrgency product={product} />
              </div>

              <p className="mt-2 font-mono text-[10px] font-light uppercase tracking-wider text-slate-400">
                Precio con IVA &middot; 3 y 6 cuotas sin interes &middot;{' '}
                <span className="text-savings-400">
                  -{flash.discount}% sobre el precio de lista
                </span>
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-end gap-3">
                <span className="font-display text-4xl font-black text-white">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <>
                    <StruckPrice size="lg">
                      {formatPrice(product.compareAtPrice)}
                    </StruckPrice>
                    <span className="rounded-lg bg-flare-500/15 px-2.5 py-1 font-mono text-xs font-normal text-flare-300">
                      AHORRAS {formatPrice(product.compareAtPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1.5 font-mono text-[10px] font-light uppercase tracking-wider text-slate-400">
                Precio con IVA &middot; 3 y 6 cuotas sin interes
              </p>
            </>
          )}

          {/* --- Descripcion --- */}
          <p className="mt-6 text-sm leading-relaxed text-slate-400">
            {product.description}
          </p>

          {/* --- Caracteristicas --- */}
          {product.features?.length > 0 && (
            <ul className="mt-6 space-y-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* --- Compra --- */}
          <div className="mt-8 rounded-2xl border border-ink-600/70 bg-ink-850/60 p-5">
            <div className="flex flex-wrap items-center gap-4">
              {/* Cantidad */}
              <div className="flex items-center rounded-xl border border-ink-600 bg-ink-900">
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="grid h-11 w-11 place-items-center text-slate-400 transition-colors hover:text-ember-300 disabled:opacity-30"
                >
                  &minus;
                </button>
                <span className="w-10 text-center font-display text-sm font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(product.stock || 99, value + 1))
                  }
                  disabled={quantity >= (product.stock || 99)}
                  aria-label="Aumentar cantidad"
                  className="grid h-11 w-11 place-items-center text-slate-400 transition-colors hover:text-ember-300 disabled:opacity-30"
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

            <p
              className={`mt-3 font-mono text-[11px] font-light uppercase tracking-wider ${
                product.stock <= 0
                  ? 'text-red-400'
                  : product.stock <= 10
                    ? 'text-amber-400'
                    : 'text-slate-400'
              }`}
            >
              {product.stock <= 0
                ? 'Producto agotado'
                : product.stock <= 10
                  ? `Solo quedan ${product.stock} unidades`
                  : `${product.stock} unidades disponibles`}
            </p>
          </div>

          {/* --- Beneficios --- */}
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { Icon: IconShield, text: 'Garantia de fabrica' },
              { Icon: IconTruck, text: 'Envio gratis +$50.000' },
              { Icon: IconCheck, text: 'Soporte tecnico 24/7' },
            ].map(({ Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <Icon className="h-4 w-4 shrink-0 text-ember-400" />
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
        <section className="mt-20">
          <p className="eyebrow">Tambien te puede interesar</p>
          <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-[0.04em] text-white">
            De la misma categoria
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/producto/${item.id}`}
                className="card-tech group block p-4"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-ink-800">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-xs font-medium leading-snug text-slate-200 transition-colors group-hover:text-ember-300">
                  {item.name}
                </p>
                {item.flashSale ? (
                  /* En ofertas flash se muestra el precio original tachado. */
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <p className="font-mono text-sm font-bold text-savings-400">
                      {formatPrice(item.price)}
                    </p>
                    <StruckPrice>{formatPrice(item.compareAtPrice)}</StruckPrice>
                  </div>
                ) : (
                  <p className="mt-1.5 font-mono text-sm font-bold text-ember-300">
                    {formatPrice(item.price)}
                  </p>
                )}
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
