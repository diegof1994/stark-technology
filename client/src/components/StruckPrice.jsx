/**
 * StruckPrice - Precio original con tachado DIAGONAL (cruzado).
 *
 * Sustituye al `line-through` horizontal: el numero se muestra en gris suave
 * (`text-muted`) y una linea roja absoluta lo cruza en diagonal, con el
 * aspecto de un sello de oferta marcado a mano.
 *
 *   <StruckPrice>{formatPrice(299.67)}</StruckPrice>
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Contenido del precio original.
 * @param {'sm'|'base'|'lg'} [props.size] Tamano del texto.
 * @param {string} [props.className] Clases extra del contenedor.
 * @param {object} [props.rest] Props adicionales (data-testid, aria-*, ...).
 */
export default function StruckPrice({
  children,
  size = 'sm',
  className = '',
  ...rest
}) {
  const sizes = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  return (
    <span
      className={`relative inline-block font-semibold text-muted ${sizes[size] ?? sizes.sm} ${className}`}
      {...rest}
    >
      {children}
      {/* Linea diagonal absoluta que cruza el precio de lado a lado. */}
      <span className="absolute inset-0 flex items-center" aria-hidden="true">
        <span
          data-testid="strike-line"
          className="h-[2px] w-full rotate-[-12deg] transform bg-strike"
        />
      </span>
    </span>
  );
}
