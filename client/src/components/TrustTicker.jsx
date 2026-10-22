import { IconBolt, IconHeadset, IconShield, IconTruck } from './Icons.jsx';

/**
 * TrustTicker - Cinta horizontal de garantias con desplazamiento infinito.
 *
 * Replica el contenido dos veces para que el bucle de `marquee` sea
 * imperceptible (translateX de -50% sobre la lista completa).
 */
export default function TrustTicker({ className = '' }) {
  const items = [
    { Icon: IconTruck, label: 'Envio gratis en compras +$50.000' },
    { Icon: IconShield, label: 'Garantia extendida hasta 36 meses' },
    { Icon: IconBolt, label: 'Despachamos en 24hs habiles' },
    { Icon: IconHeadset, label: 'Soporte tecnico 24/7' },
    { Icon: IconShield, label: 'Distribuidor oficial' },
    { Icon: IconTruck, label: 'Instalacion en CABA' },
  ];

  const Row = ({ duplicate = false }) => (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={duplicate ? 'true' : undefined}
    >
      {items.map(({ Icon, label }, index) => (
        <li
          key={`${label}-${index}`}
          className="flex shrink-0 items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
        >
          <Icon className="h-3.5 w-3.5 text-accent" />
          {label}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`relative flex overflow-hidden border-y border-line bg-surface-1/60 py-3.5 ${className}`}
    >
      {/* Degradados de salida: el texto se disuelve en los bordes. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-canvas to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-canvas to-transparent"
        aria-hidden="true"
      />

      <div className="ticker-track flex min-w-max items-center">
        <Row />
        <Row duplicate />
      </div>
    </div>
  );
}
