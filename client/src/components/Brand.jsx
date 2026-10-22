import { Link } from 'react-router-dom';

import { IconShield } from './Icons.jsx';

/**
 * Brand - Logotipo de Stark Technology.
 *
 * Version completa: escudo + wordmark en dos lineas ("STARK" / "TECHNOLOGY"),
 * con el subtitulo en monoespaciada para el registro "dato tecnico".
 * En version compacta solo muestra el escudo.
 *
 * @param {object} props
 * @param {boolean} [props.compact] Solo el escudo.
 * @param {boolean} [props.asLink] Envolver en un enlace al home.
 * @param {string} [props.className] Clases extra del contenedor.
 */
export default function Brand({ compact = false, asLink = true, className = '' }) {
  const mark = (
    <span
      className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ember-300 via-ember-400 to-flare-500 text-on-accent transition-transform duration-300 group-hover:scale-105 ${
        compact ? 'h-8 w-8' : ''
      }`}
    >
      <IconShield className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
    </span>
  );

  const content = (
    <span className="inline-flex items-center gap-2.5">
      {mark}
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[15px] font-bold tracking-[0.16em] text-strong">
            STARK
          </span>
          <span className="mt-0.5 block font-mono text-[8px] uppercase tracking-[0.38em] text-accent">
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
    <Link to="/" className={`group ${className}`} aria-label="Stark Technology - Inicio">
      {content}
    </Link>
  );
}
