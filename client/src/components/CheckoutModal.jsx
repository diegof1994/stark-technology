import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { createPreference, getPaymentConfig } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import StruckPrice from './StruckPrice.jsx';
import { IconAlert, IconArrowRight, IconClose, IconLock, IconShield } from './Icons.jsx';

/**
 * CheckoutModal - Checkout con pasarela de pagos Mercado Pago.
 *
 * - Si el backend tiene credenciales de Mercado Pago, genera una preferencia real
 *   y redirige al checkout alojado por Mercado Pago (init_point).
 * - Sin credenciales, el backend responde en modo sandbox y se muestra un
 *   checkout simulado local para completar el flujo de prueba.
 */
export default function CheckoutModal({ open, onClose }) {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const toast = useToast();

  const [step, setStep] = useState('form'); // form | loading | error
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
  });

  /* --- Carga la configuracion de pagos al abrir --- */
  useEffect(() => {
    if (!open) return;
    setStep('form');
    setError('');
    getPaymentConfig()
      .then((data) => setConfig(data))
      .catch(() => setConfig({ sandbox: true, publicKey: null }));
  }, [open]);

  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  /**
   * Ahorro total del pedido por productos en Oferta Flash.
   * Refuerza la percepcion de valor justo antes de pagar.
   */
  const savings = useMemo(
    () =>
      items.reduce((acc, item) => {
        if (!item.flashSale || !(item.compareAtPrice > item.price)) return acc;
        return acc + (item.compareAtPrice - item.price) * item.quantity;
      }, 0),
    [items],
  );

  /** Genera la preferencia de pago y redirige al checkout de Mercado Pago. */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError('Completa tu nombre y tu email para continuar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('El email no tiene un formato valido.');
      return;
    }

    setStep('loading');
    setError('');

    try {
      const payload = await createPreference({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          description: item.categoryLabel || item.category,
        })),
        payer: {
          name: form.name,
          surname: form.surname,
          email: form.email,
          phone: form.phone,
        },
      });

      if (!payload?.initPoint) {
        throw new Error('La pasarela de pagos no devolvio una URL de checkout.');
      }

      // Guarda el pedido en sesion para recuperarlo al volver del checkout.
      window.sessionStorage.setItem(
        'stark_last_order',
        JSON.stringify({
          preferenceId: payload.preferenceId,
          total: payload.total ?? total,
          items: items.map((item) => ({ ...item })),
          payer: form,
          date: new Date().toISOString(),
        }),
      );

      // Sandbox local: navegamos al checkout simulado de la propia app.
      if (payload.sandbox && payload.initPoint.includes('/checkout/simulado')) {
        clearCart();
        window.location.href = payload.initPoint;
        return;
      }

      // Pasarela real: redirigimos al checkout de Mercado Pago.
      window.location.href = payload.initPoint;
    } catch (err) {
      setStep('error');
      setError(err.message || 'No se pudo generar la preferencia de pago.');
      toast.error('Error al iniciar el pago');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-ink-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[120] w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-ink-600/80 bg-ink-900/95 shadow-2xl backdrop-blur-xl"
            role="dialog"
            aria-label="Checkout"
          >
            {/* --- Cabecera --- */}
            <header className="flex items-center justify-between border-b border-ink-700/70 px-6 py-4">
              <div>
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
                  Checkout seguro
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {config?.sandbox
                    ? 'Modo sandbox - simulacion sin cargo real'
                    : 'Pago procesado por Mercado Pago'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar checkout"
                className="grid h-9 w-9 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-slate-400 transition-colors hover:border-red-500/60 hover:text-red-300"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </header>

            <div className="grid max-h-[75vh] overflow-y-auto md:grid-cols-[1.15fr_0.85fr]">
              {/* --- Formulario --- */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5 border-b border-ink-700/70 p-6 md:border-b-0 md:border-r"
              >
                <div>
                  <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ember-400">
                    Datos del comprador
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Mercado Pago enviara la confirmacion a este email.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      Nombre *
                    </span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="Juan"
                      className="field"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                      Apellido
                    </span>
                    <input
                      type="text"
                      value={form.surname}
                      onChange={updateField('surname')}
                      placeholder="Perez"
                      className="field"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    Email *
                  </span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="correo@empresa.com"
                    className="field"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    Telefono
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={updateField('phone')}
                    placeholder="11 1234 5678"
                    className="field"
                  />
                </label>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
                    <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="text-xs leading-relaxed text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={step === 'loading' || items.length === 0}
                  className="btn-ember w-full !py-3.5"
                >
                  {step === 'loading' ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                      Generando preferencia...
                    </>
                  ) : (
                    <>
                      <IconLock className="h-4 w-4" />
                      Pagar {formatPrice(total)}
                      <IconArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  <IconShield className="h-3.5 w-3.5 text-lime-400" />
                  Transaccion cifrada y protegida
                </p>
              </form>

              {/* --- Resumen --- */}
              <aside className="bg-ink-850/50 p-6">
                <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-ember-400">
                  Resumen del pedido
                </h3>

                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-200">
                          {item.name}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                        {/* En ofertas flash mostramos el precio original tachado. */}
                        {item.flashSale && item.compareAtPrice > item.price && (
                          <StruckPrice className="font-mono text-[10px]">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </StruckPrice>
                        )}
                      </div>
                      <span className="font-mono text-xs text-slate-300">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 space-y-2 border-t border-ink-700/70 pt-4 text-sm">
                  {savings > 0 && (
                    <div className="flex justify-between">
                      <dt className="font-mono text-[11px] uppercase tracking-wider text-savings-400">
                        Ahorro en ofertas flash
                      </dt>
                      <dd className="font-mono text-[11px] font-bold text-savings-400">
                        -{formatPrice(savings)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Subtotal</dt>
                    <dd className="font-mono text-slate-200">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Envio</dt>
                    <dd className="font-mono text-slate-200">
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
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

                {config?.sandbox && (
                  <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300">
                      Modo sandbox
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-amber-200/80">
                      No se realizara ningun cargo real. Configura{' '}
                      <code className="font-mono">MERCADO_PAGO_SECRET_KEY</code> en el
                      servidor para activar la pasarela real.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
