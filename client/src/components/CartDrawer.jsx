import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/format.js';
import StruckPrice from './StruckPrice.jsx';
import {
  IconArrowRight,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash,
  IconTruck,
} from './Icons.jsx';

/**
 * CartDrawer - Drawer lateral deslizante del carrito de compras.
 * Permite ajustar cantidades, eliminar items y pasar al checkout.
 */
export default function CartDrawer({ onCheckout }) {
  const {
    items,
    count,
    subtotal,
    shipping,
    total,
    isOpen,
    closeCart,
    increment,
    decrement,
    removeItem,
    clearCart,
  } = useCart();

  const freeShipping = subtotal >= 50000;
  const progress = Math.min(100, (subtotal / 50000) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* --- Overlay --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-overlay/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* --- Drawer --- */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col border-l border-line bg-surface-1/95 shadow-panel backdrop-blur-xl"
            role="dialog"
            aria-label="Carrito de compras"
          >
            {/* --- Cabecera --- */}
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-strong">
                  Carrito
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {count} {count === 1 ? 'item' : 'items'} en el carrito
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-2 text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </header>

            {/* --- Progreso de envio gratis --- */}
            {items.length > 0 && (
              <div className="border-b border-line px-5 py-3.5">
                <div className="flex items-center gap-2 text-[11px]">
                  <IconTruck className="h-3.5 w-3.5 shrink-0 text-accent" />
                  {freeShipping ? (
                    <span className="font-medium text-success">
                      Tenes envio gratis en esta compra
                    </span>
                  ) : (
                    <span className="text-muted">
                      Te faltan{' '}
                      <span className="font-semibold text-accent tabular">
                        {formatPrice(50000 - subtotal)}
                      </span>{' '}
                      para envio gratis
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45 }}
                    className="h-full rounded-full bg-gradient-to-r from-ember-400 to-flare-400"
                  />
                </div>
              </div>
            )}

            {/* --- Items --- */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface-2">
                    <IconTruck className="h-7 w-7 text-faint" />
                  </span>
                  <p className="mt-5 font-display text-sm font-semibold tracking-tight text-strong">
                    Tu carrito esta vacio
                  </p>
                  <p className="mt-1.5 max-w-[16rem] text-xs text-muted">
                    Descubre nuestro catalogo de camaras, redes, drones y mas.
                  </p>
                  <Link to="/catalogo" onClick={closeCart} className="btn-ember mt-6">
                    Ver catalogo
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex gap-3 rounded-xl border border-line bg-surface-1 p-3"
                      >
                        <Link
                          to={`/producto/${item.id}`}
                          onClick={closeCart}
                          className="shrink-0 overflow-hidden rounded-lg"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-16 w-16 rounded-lg object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/producto/${item.id}`}
                            onClick={closeCart}
                            className="line-clamp-2 font-display text-[13px] font-medium leading-snug text-strong transition-colors hover:text-accent"
                          >
                            {item.name}
                          </Link>

                          <div className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="font-display text-[13px] font-bold text-savings-ink tabular">
                              {formatPrice(item.price)}
                            </span>
                            {/* En ofertas flash mostramos el precio original tachado. */}
                            {item.flashSale && item.compareAtPrice > item.price && (
                              <StruckPrice className="font-mono text-[11px]">
                                {formatPrice(item.compareAtPrice)}
                              </StruckPrice>
                            )}
                          </div>

                          {item.flashSale && (
                            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded border border-savings-500/40 bg-savings-500/10 px-1.5 py-0.5 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-savings-ink">
                              🔥 -{item.flashDiscount}% OFF
                            </span>
                          )}

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            {/* --- Control de cantidad --- */}
                            <div className="flex items-center rounded-full border border-line bg-surface-2">
                              <button
                                type="button"
                                onClick={() => decrement(item)}
                                disabled={item.quantity <= 1}
                                aria-label="Disminuir cantidad"
                                className="grid h-7 w-7 place-items-center rounded-l-full text-muted transition-colors hover:text-accent disabled:opacity-30"
                              >
                                <IconMinus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-bold text-strong tabular">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increment(item)}
                                disabled={item.stock > 0 && item.quantity >= item.stock}
                                aria-label="Aumentar cantidad"
                                className="grid h-7 w-7 place-items-center rounded-r-full text-muted transition-colors hover:text-accent disabled:opacity-30"
                              >
                                <IconPlus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="font-display text-sm font-bold text-strong tabular">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Eliminar ${item.name}`}
                                className="text-faint transition-colors hover:text-danger"
                              >
                                <IconTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* --- Resumen + checkout --- */}
            {items.length > 0 && (
              <footer className="border-t border-line bg-surface-2/50 px-5 py-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="font-mono text-body tabular">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Envio</dt>
                    <dd
                      className={`font-mono tabular ${
                        freeShipping ? 'text-success' : 'text-body'
                      }`}
                    >
                      {freeShipping ? 'Gratis' : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex items-end justify-between border-t border-line pt-3">
                    <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-strong">
                      Total
                    </dt>
                    <dd className="font-display text-xl font-bold text-strong tabular">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    onCheckout?.();
                  }}
                  className="btn-ember mt-4 w-full !py-3.5"
                >
                  Finalizar compra
                  <IconArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-2 w-full rounded-lg py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-danger"
                >
                  Vaciar carrito
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
