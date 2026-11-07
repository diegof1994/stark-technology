import { Link } from 'react-router-dom';

/**
 * Isotipo de Stack Technology: tres cajas apiladas y corridas,
 * como mercaderia estibada. Usa currentColor para adaptarse al fondo.
 */
export function StackMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--color-ember-500)" />
      <rect x="9" y="24" width="22" height="7" rx="2" fill="#ffffff" />
      <rect x="12" y="15.5" width="19" height="7" rx="2" fill="#ffffff" opacity="0.8" />
      <rect x="15" y="7" width="16" height="7" rx="2" fill="var(--color-amber-400)" />
    </svg>
  );
}

/**
 * Brand - Logotipo de Stack Technology (isotipo + nombre).
 *
 * @param {object} props
 * @param {boolean} [props.compact] Solo el isotipo.
 * @param {boolean} [props.asLink] Envolver en un enlace al inicio.
 * @param {boolean} [props.inverted] Texto claro para fondos oscuros.
 * @param {string} [props.className] Clases extra del contenedor.
 */
export default function Brand({ compact = false, asLink = true, inverted = false, className = '' }) {
  const content = (
    <span className="inline-flex items-center gap-2.5">
      <StackMark className={compact ? 'h-8 w-8' : 'h-9 w-9'} />
      {!compact && (
        <span className="leading-none">
          <span
            className={`block font-display text-[20px] font-extrabold tracking-[-0.01em] ${
              inverted ? 'text-white' : 'text-strong'
            }`}
            style={{ fontStretch: '118%' }}
          >
            Stack
          </span>
          <span className={`mt-0.5 block text-[11px] font-medium ${inverted ? 'text-white/70' : 'text-muted'}`}>
            Technology
          </span>
        </span>
      )}
    </span>
  );

  if (!asLink) {
    return <span className={`group ${className}`}>{content}</span>;
  }

  return (
    <Link to="/" className={`group ${className}`} aria-label="Stack Technology - Inicio">
      {content}
    </Link>
  );
}
