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
            className="fixed inset-0 z-[110] bg-overlay/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[120] w-[min(58rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-surface-1/95 shadow-panel backdrop-blur-xl"
            role="dialog"
            aria-label="Checkout"
          >
            {/* --- Cabecera --- */}
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-strong">
                  Checkout seguro
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {config?.sandbox
                    ? 'Modo sandbox - simulacion sin cargo real'
                    : 'Pago procesado por Mercado Pago'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar checkout"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-2 text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </header>

            <div className="grid max-h-[75vh] overflow-y-auto md:grid-cols-[1.15fr_0.85fr]">
              {/* --- Formulario --- */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5 border-b border-line p-6 md:border-b-0 md:border-r"
              >
                <div>
                  <h3 className="eyebrow">Datos del comprador</h3>
                  <p className="mt-1.5 text-xs text-muted">
                    Mercado Pago enviara la confirmacion a este email.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
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
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
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
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
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
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
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
                  <div className="flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3">
                    <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                    <p className="text-xs leading-relaxed text-danger">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={step === 'loading' || items.length === 0}
                  className="btn-ember w-full !py-3.5"
                >
                  {step === 'loading' ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" />
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

                <p className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider text-faint">
                  <IconShield className="h-3.5 w-3.5 text-success" />
                  Transaccion cifrada y protegida
                </p>
              </form>

              {/* --- Resumen --- */}
              <aside className="bg-surface-2/50 p-6">
                <h3 className="eyebrow">Resumen del pedido</h3>

                <ul className="mt-5 space-y-3.5">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-body">
                          {item.name}
                        </p>
                        <p className="font-mono text-[10px] text-faint tabular">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                        {/* En ofertas flash mostramos el precio original tachado. */}
                        {item.flashSale && item.compareAtPrice > item.price && (
                          <StruckPrice className="font-mono text-[10px]">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </StruckPrice>
                        )}
                      </div>
                      <span className="font-mono text-xs font-medium text-strong tabular">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
                  {savings > 0 && (
                    <div className="flex justify-between rounded-lg border border-savings-500/30 bg-savings-500/10 px-3 py-2">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-savings-ink">
                        Ahorro en ofertas flash
                      </dt>
                      <dd className="font-mono text-[11px] font-bold text-savings-ink tabular">
                        -{formatPrice(savings)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="font-mono text-body tabular">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Envio</dt>
                    <dd className="font-mono text-body tabular">
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
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

                {config?.sandbox && (
                  <div className="mt-5 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-warning">
                      Modo sandbox
                    </p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-warning/85">
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
