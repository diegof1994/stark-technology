import { useEffect, useState } from 'react';

import { IconClock } from './Icons.jsx';
import { countdownParts } from '../utils/flash.js';

/**
 * FlashCountdown - Cuenta regresiva en vivo de la Oferta Flash.
 *
 * Muestra las horas, minutos y segundos restantes para que la urgencia sea
 * tangible. Cuando el tiempo se agota, avisa que la oferta finalizo.
 *
 * @param {object} props
 * @param {number} props.deadline Timestamp (ms) de vencimiento.
 * @param {string} [props.className] Clases extra del contenedor.
 * @param {string} [props.label] Texto previo al reloj.
 */
export default function FlashCountdown({ deadline, className = '', label = 'Termina en' }) {
  const [remaining, setRemaining] = useState(() => deadline - Date.now());

  useEffect(() => {
    // Actualiza el reloj cada segundo para mantener la cuenta regresiva viva.
    const timer = setInterval(() => setRemaining(deadline - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const expired = remaining <= 0;
  const { hours, minutes, seconds } = countdownParts(remaining);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-flare-500/40 bg-flare-500/10 px-2.5 py-1.5 ${className}`}
      role="timer"
      aria-live="off"
    >
      <IconClock className="h-3.5 w-3.5 shrink-0 text-flare-400" />
      {expired ? (
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-red-400">
          Oferta finalizada
        </span>
      ) : (
        <>
          <span className="font-mono text-[10px] uppercase tracking-wider text-flare-300/80">
            {label}
          </span>
          <span
            className="font-mono text-[13px] font-bold tabular-nums text-white"
            data-testid="flash-countdown"
          >
            {hours}:{minutes}:{seconds}
          </span>
        </>
      )}
    </div>
  );
}
