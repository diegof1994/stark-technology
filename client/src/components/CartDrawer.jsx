import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/format.js';
import StruckPrice from './StruckPrice.jsx';
import { IconArrowRight, IconClose, IconMinus, IconPlus, IconTrash, IconTruck } from './Icons.jsx';

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
            className="fixed inset-0 z-[90] bg-ink-950/75 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* --- Drawer --- */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col border-l border-ink-600/70 bg-ink-900/95 shadow-2xl backdrop-blur-xl"
            role="dialog"
            aria-label="Carrito de compras"
          >
            {/* --- Cabecera --- */}
            <header className="flex items-center justify-between border-b border-ink-700/70 px-5 py-4">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
                  Carrito
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {count} {count === 1 ? 'item' : 'items'} en el carrito
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-slate-400 transition-colors hover:border-red-500/60 hover:text-red-300"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </header>

            {/* --- Progreso de envio gratis --- */}
            {items.length > 0 && (
              <div className="border-b border-ink-700/70 px-5 py-3">
                <div className="flex items-center gap-2 text-[11px]">
                  <IconTruck className="h-3.5 w-3.5 text-ember-400" />
                  {freeShipping ? (
                    <span className="font-medium text-lime-400">
                      Tenes envio gratis en esta compra
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Te faltan{' '}
                      <span className="font-semibold text-ember-300">
                        {formatPrice(50000 - subtotal)}
                      </span>{' '}
                      para envio gratis
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
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
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-ink-600 bg-ink-800/60">
                    <IconTruck className="h-7 w-7 text-slate-600" />
                  </div>
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Tu carrito esta vacio
                  </p>
                  <p className="mt-1.5 max-w-[16rem] text-xs text-slate-600">
                    Descubre nuestro catalogo de camaras, redes, drones y mas.
                  </p>
                  <Link
                    to="/catalogo"
                    onClick={closeCart}
                    className="btn-ember mt-5"
                  >
                    Ver catalogo
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="flex gap-3 rounded-xl border border-ink-700/70 bg-ink-850/70 p-3"
                      >
                        <Link
                          to={`/producto/${item.id}`}
                          onClick={closeCart}
                          className="shrink-0"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/producto/${item.id}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-xs font-medium leading-snug text-slate-100 hover:text-ember-300"
                          >
                            {item.name}
                          </Link>
                          <div className="mt-1 flex items-baseline gap-2">
                            <p className="font-mono text-[11px] text-ember-300">
                              {formatPrice(item.price)}
                            </p>
                            {/* En ofertas flash mostramos el precio original tachado. */}
                            {item.flashSale && item.compareAtPrice > item.price && (
                              <StruckPrice className="font-mono text-[11px]">
                                {formatPrice(item.compareAtPrice)}
                              </StruckPrice>
                            )}
                          </div>
                          {item.flashSale && (
                            <p className="mt-0.5 inline-flex w-fit items-center gap-1 rounded border border-savings-500/40 bg-savings-500/12 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-savings-300">
                              🔥 -{item.flashDiscount}% OFF
                            </p>
                          )}

                          <div className="mt-2 flex items-center justify-between gap-2">
                            {/* --- Control de cantidad --- */}
                            <div className="flex items-center rounded-lg border border-ink-600">
                              <button
                                type="button"
                                onClick={() => decrement(item)}
                                disabled={item.quantity <= 1}
                                aria-label="Disminuir cantidad"
                                className="grid h-7 w-7 place-items-center text-slate-400 transition-colors hover:text-ember-300 disabled:opacity-30"
                              >
                                <IconMinus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-bold text-slate-100">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => increment(item)}
                                disabled={item.stock > 0 && item.quantity >= item.stock}
                                aria-label="Aumentar cantidad"
                                className="grid h-7 w-7 place-items-center text-slate-400 transition-colors hover:text-ember-300 disabled:opacity-30"
                              >
                                <IconPlus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm font-bold text-white">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Eliminar ${item.name}`}
                                className="text-slate-600 transition-colors hover:text-red-400"
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
              <footer className="border-t border-ink-700/70 bg-ink-850/60 px-5 py-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Subtotal</dt>
                    <dd className="font-mono text-slate-200">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Envio</dt>
                    <dd
                      className={`font-mono ${
                        freeShipping ? 'text-lime-400' : 'text-slate-200'
                      }`}
                    >
                      {freeShipping ? 'Gratis' : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-ink-700/70 pt-2">
                    <dt className="font-display text-xs font-bold uppercase tracking-[0.14em] text-white">
                      Total
                    </dt>
                    <dd className="font-display text-lg font-bold text-ember-300">
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
                  className="mt-2 w-full rounded-lg py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600 transition-colors hover:text-red-400"
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
