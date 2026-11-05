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
 * y redirige al checkout alojado por Mercado Pago (init_point).
 * - Sin credenciales, el backend responde en modo sandbox y se muestra un
 * checkout simulado local para completar el flujo de prueba.
 */
const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes',
  'Entre Rios', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
];

/** Campo de formulario con etiqueta. */
function Field({ label, className = '', ...props }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-body">{label}</span>
      <input type="text" {...props} className="field" />
    </label>
  );
}

export default function CheckoutModal({ open, onClose }) {
  const { items, subtotal, shipping: cartShipping, clearCart } = useCart();
  const toast = useToast();

  const [step, setStep] = useState('form'); // form | loading | error
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    dni: '',
    method: 'envio',
    street: '',
    number: '',
    apartment: '',
    city: '',
    province: '',
    zip: '',
    notes: '',
  });

  // El retiro en persona no paga envio.
  const shipping = form.method === 'retiro' ? 0 : cartShipping;
  const total = subtotal + shipping;

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

    const digits = (value) => value.replace(/\D/g, '');
    if (!form.name.trim() || !form.surname.trim()) {
      setError('Completa tu nombre y apellido.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('El email no tiene un formato valido.');
      return;
    }
    if (digits(form.phone).length < 8) {
      setError('Ingresa un telefono valido (con codigo de area).');
      return;
    }
    if (digits(form.dni).length < 7 || digits(form.dni).length > 9) {
      setError('Ingresa un DNI valido.');
      return;
    }
    if (
      form.method === 'envio' &&
      ['street', 'number', 'city', 'province', 'zip'].some((key) => !form[key].trim())
    ) {
      setError('Completa la direccion de envio.');
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
        buyer: {
          name: form.name,
          surname: form.surname,
          email: form.email,
          phone: form.phone,
          dni: form.dni,
        },
        shipping: {
          method: form.method,
          street: form.street,
          number: form.number,
          apartment: form.apartment,
          city: form.city,
          province: form.province,
          zip: form.zip,
          notes: form.notes,
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
          orderCode: payload.orderCode,
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

          <div className="pointer-events-none fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="pointer-events-auto flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface-1 shadow-panel sm:max-h-[90vh] sm:max-w-[58rem] sm:rounded-2xl"
            role="dialog"
            aria-label="Checkout"
          >
            {/* --- Cabecera --- */}
            <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-strong">
                  Finalizar compra
                </h2>
                <p className="mt-0.5 text-xs text-faint">
                  Pago procesado por Mercado Pago
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

            <div className="grid min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid-cols-[1.15fr_0.85fr]">
              {/* --- Formulario --- */}
              <form
                onSubmit={handleSubmit}
                className="min-w-0 space-y-5 border-b border-line p-5 sm:p-6 md:border-b-0 md:border-r"
              >
                <div>
                  <h3 className="eyebrow">Compra rapida, sin crear cuenta</h3>
                  <p className="mt-1.5 text-xs text-muted">
                    Solo necesitamos tus datos para el comprobante y el envio.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre *" value={form.name} onChange={updateField('name')} autoComplete="given-name" />
                  <Field label="Apellido *" value={form.surname} onChange={updateField('surname')} autoComplete="family-name" />
                  <Field label="Email *" type="email" value={form.email} onChange={updateField('email')} autoComplete="email" placeholder="tu@email.com" />
                  <Field label="Telefono *" type="tel" value={form.phone} onChange={updateField('phone')} autoComplete="tel" placeholder="11 1234 5678" />
                  <Field label="DNI *" inputMode="numeric" value={form.dni} onChange={updateField('dni')} placeholder="Sin puntos" />
                </div>

                <fieldset>
                  <legend className="eyebrow">Entrega</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {[
                      { id: 'envio', title: 'Envio a domicilio', text: cartShipping === 0 ? 'Gratis' : formatPrice(cartShipping) },
                      { id: 'retiro', title: 'Retiro en persona', text: 'Gratis · coordinamos por WhatsApp' },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                          form.method === option.id ? 'border-accent bg-accent/5' : 'border-line'
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={option.id}
                          checked={form.method === option.id}
                          onChange={updateField('method')}
                          className="mt-1 accent-[var(--accent)]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-strong">{option.title}</span>
                          <span className="block text-xs text-muted">{option.text}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {form.method === 'envio' && (
                  <div className="grid grid-cols-6 gap-4">
                    <Field className="col-span-4" label="Calle *" value={form.street} onChange={updateField('street')} autoComplete="address-line1" />
                    <Field className="col-span-2" label="Numero *" value={form.number} onChange={updateField('number')} />
                    <Field className="col-span-3" label="Piso / Depto" value={form.apartment} onChange={updateField('apartment')} autoComplete="address-line2" />
                    <Field className="col-span-3" label="Codigo postal *" value={form.zip} onChange={updateField('zip')} autoComplete="postal-code" />
                    <Field className="col-span-6 sm:col-span-3" label="Localidad *" value={form.city} onChange={updateField('city')} autoComplete="address-level2" />
                    <label className="col-span-6 block sm:col-span-3">
                      <span className="mb-1.5 block text-xs font-medium text-body">Provincia *</span>
                      <select value={form.province} onChange={updateField('province')} className="field">
                        <option value="">Elegi...</option>
                        {PROVINCES.map((province) => (
                          <option key={province}>{province}</option>
                        ))}
                      </select>
                    </label>
                    <Field className="col-span-6" label="Indicaciones para la entrega" value={form.notes} onChange={updateField('notes')} placeholder="Opcional" />
                  </div>
                )}

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

                <p className="flex items-center justify-center gap-2 text-xs text-faint">
                  <IconShield className="h-3.5 w-3.5 text-success" />
                  Transaccion cifrada y protegida
                </p>
              </form>

              {/* --- Resumen --- */}
              <aside className="min-w-0 bg-surface-2/50 p-5 pb-8 sm:p-6">
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
                        <p className="text-xs text-faint tabular">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                        {/* En ofertas flash mostramos el precio original tachado. */}
                        {item.flashSale && item.compareAtPrice > item.price && (
                          <StruckPrice className="text-xs">
                            {formatPrice(item.compareAtPrice * item.quantity)}
                          </StruckPrice>
                        )}
                      </div>
                      <span className="text-xs font-medium text-strong tabular">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
                  {savings > 0 && (
                    <div className="flex justify-between rounded-lg border border-savings-500/30 bg-savings-500/10 px-3 py-2">
                      <dt className="text-xs text-savings-ink">
                        Ahorro en ofertas flash
                      </dt>
                      <dd className="text-[11px] font-bold text-savings-ink tabular">
                        -{formatPrice(savings)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="text-body tabular">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Envio</dt>
                    <dd className="text-body tabular">
                      {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex items-end justify-between border-t border-line pt-3">
                    <dt className="font-display text-xs font-bold text-strong">
                      Total
                    </dt>
                    <dd className="font-display text-xl font-bold text-strong tabular">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>

              </aside>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
