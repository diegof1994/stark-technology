import { Link } from 'react-router-dom';

import { IconArrowRight } from './Icons.jsx';

/**
 * SectionHeading - Cabecera de seccion del sitio.
 *
 * Compone un kicker monoespaciado, un titular en Space Grotesk con tracking
 * cerrado y una regla de acento; opcionalmente una descripcion y una accion
 * a la derecha.
 *
 * @param {object} props
 * @param {string} [props.kicker]    Etiqueta tecnica superior.
 * @param {string} props.title        Titular de la seccion.
 * @param {string} [props.description] Texto de apoyo.
 * @param {object} [props.action]    { to, label } para un enlace de accion.
 * @param {'left'|'center'} [props.align] Alineacion del bloque.
 */
export default function SectionHeading({
  kicker,
  title,
  description,
  action,
  align = 'left',
  className = '',
}) {
  const centered = align === 'center';

  return (
    <div
      className={`flex flex-col gap-5 ${
        centered
          ? 'items-center text-center'
          : 'md:flex-row md:items-end md:justify-between'
      } ${className}`}
    >
      <div className={centered ? 'max-w-2xl' : 'max-w-2xl'}>
        {kicker && (
          <div className="flex items-center gap-2.5">
            {centered && <span className="h-px w-6 rule-accent" aria-hidden="true" />}
            <p className="eyebrow">{kicker}</p>
            {centered && <span className="h-px w-6 rule-accent" aria-hidden="true" />}
          </div>
        )}

        <h2 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.02em] text-strong">
          {title}
        </h2>

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>

      {action && (
        <Link
          to={action.to}
          className="btn-quiet shrink-0 whitespace-nowrap self-start md:self-auto"
        >
          {action.label}
          <IconArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
