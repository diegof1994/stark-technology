import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

import { formatPrice } from '../utils/format.js';
import StruckPrice from '../components/StruckPrice.jsx';
import { IconArrowRight, IconCheck, IconLock, IconShield } from '../components/Icons.jsx';

/**
 * SimulatedCheckout - Checkout de prueba que reemplaza a Mercado Pago cuando
 * el backend opera en modo sandbox (sin credenciales reales).
 *
 * Simula el flujo completo:_-> revisar -> pagar -> aprobado / rechazado.
 */
export default function SimulatedCheckout() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('review'); // review | processing | approved | rejected
  const [order, setOrder] = useState(null);

  const preferenceId = params.get('preference_id') || 'SIM-DEMO';
  const totalParam = Number(params.get('total') || 0);

  /* --- Recupera el pedido guardado antes de redirigir al checkout --- */
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('stark_last_order');
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const total = order?.total ?? totalParam;

  const pay = () => {
    setStatus('processing');
    setTimeout(() => setStatus('approved'), 1600);
  };

  const reject = () => {
    setStatus('processing');
    setTimeout(() => setStatus('rejected'), 1200);
  };

  /* --- Resultado aprobado --- */
  if (status === 'approved') {
    return (
      <Shell title="Pago aprobado" accent="text-lime-400">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-lime-400/40 bg-lime-400/10">
          <IconCheck className="h-8 w-8 text-lime-400" />
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
          Gracias por tu compra
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Tu pedido fue confirmado. Recibimos la orden{' '}
          <span className="font-mono text-ember-300">{preferenceId}</span> por{' '}
          <span className="font-mono text-ember-300">{formatPrice(total)}</span>.
          Nuestro equipo te contactara para coordinar la entrega.
        </p>

        {order?.items?.length > 0 && (
          <div className="mt-6 rounded-xl border border-ink-700 bg-ink-850/60 p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Detalle del pedido
            </p>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="truncate text-slate-300">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    {/* En ofertas flash mostramos el precio original tachado. */}
                    {item.flashSale && item.compareAtPrice > item.price && (
                      <StruckPrice className="font-mono text-[10px]">
                        {formatPrice(item.compareAtPrice * item.quantity)}
                      </StruckPrice>
                    )}
                    <span className="font-mono shrink-0 text-slate-400">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/catalogo" className="btn-ember mt-7">
          Volver al catalogo
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </Shell>
    );
  }

  /* --- Resultado rechazado --- */
  if (status === 'rejected') {
    return (
      <Shell title="Pago rechazado" accent="text-red-400">
        <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-red-500/40 bg-red-500/10">
          <span className="font-display text-2xl font-bold text-red-400">!</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
          No pudimos procesar el pago
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          El pago fue rechazado por el proveedor. Puedes intentarlo nuevamente con otro
          medio de pago.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={() => setStatus('review')} className="btn-ember">
            Reintentar
          </button>
          <Link to="/catalogo" className="btn-ghost">
            Volver al catalogo
          </Link>
        </div>
      </Shell>
    );
  }

  /* --- Revision / pago --- */
  return (
    <Shell title="Checkout simulado" accent="text-ember-300">
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
        <IconLock className="h-4 w-4 shrink-0 text-amber-300" />
        <p className="text-[11px] leading-relaxed text-amber-200/85">
          <strong className="font-semibold">Modo sandbox.</strong> Esta pantalla simula
          el checkout de Mercado Pago para probar el flujo sin generar cargos reales.
        </p>
      </div>

      <h1 className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
        Mercado Pago
      </h1>
      <p className="mt-1 font-mono text-[11px] text-slate-500">
        Preferencia: {preferenceId}
      </p>

      {/* --- Metodos de pago simulados --- */}
      <div className="mt-6 space-y-3">
        {[
          { id: 'visa', label: 'Visa **** 4242', color: 'text-blue-300' },
          { id: 'mc', label: 'Mastercard **** 5555', color: 'text-red-300' },
          { id: 'mp', label: 'Dinero en cuenta Mercado Pago', color: 'text-sky-300' },
        ].map((method, index) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              index === 0
                ? 'border-ember-500/60 bg-ember-500/8'
                : 'border-ink-700 bg-ink-850/50 hover:border-ember-500/40'
            }`}
          >
            <input
              type="radio"
              name="metodo"
              defaultChecked={index === 0}
              className="accent-ember-400"
            />
            <span className={`font-mono text-xs ${method.color}`}>{method.label}</span>
          </label>
        ))}
      </div>

      {/* --- Total --- */}
      <div className="mt-6 flex items-baseline justify-between border-t border-ink-700/70 pt-4">
        <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
          Total a pagar
        </span>
        <span className="font-display text-2xl font-bold text-ember-300">
          {formatPrice(total)}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={pay}
          disabled={status === 'processing'}
          className="btn-ember flex-1 !py-3.5"
        >
          {status === 'processing' ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
              Procesando...
            </>
          ) : (
            <>
              <IconShield className="h-4 w-4" />
              Pagar {formatPrice(total)}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={reject}
          className="btn-ghost"
          disabled={status === 'processing'}
        >
          Simular fallo
        </button>
      </div>
    </Shell>
  );
}

/** Contenedor visual comun del checkout simulado. */
function Shell({ title, accent, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg rounded-2xl border border-ink-600/80 bg-ink-900/90 p-8 shadow-2xl backdrop-blur-xl"
      >
        <p className={`font-mono text-[10px] uppercase tracking-[0.28em] ${accent}`}>
          {title}
        </p>
        <div className="mt-6">{children}</div>
      </motion.div>
    </div>
  );
}
