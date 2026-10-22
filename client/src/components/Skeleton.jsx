/**
 * Skeleton - Bloque de carga con barrido de luz.
 *
 * @param {object} props
 * @param {string} [props.className] Tamano y forma (usa utilidades Tailwind).
 */
export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Tarjeta de producto en estado de carga, con la misma anatomia que la real. */
export function ProductCardSkeleton() {
  return (
    <div className="surface overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-2.5 w-1/3" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
