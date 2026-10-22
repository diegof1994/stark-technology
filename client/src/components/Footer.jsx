import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '../context/ToastContext.jsx';
import Brand from './Brand.jsx';
import { IconArrowRight, IconGithub, IconInstagram, IconMail, IconWhatsapp } from './Icons.jsx';

/**
 * Footer - Pie de pagina de Stark Technology.
 *
 * Cuatro bloques: marca y propuesta de valor, accesos rapidos, rubros y una
 * zona de contacto con newsletter y metodos de pago.
 */
export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');

  const columns = [
    {
      title: 'Catalogo',
      links: [
        { label: 'Camaras IP / CCTV', to: '/catalogo?category=camaras-seguridad' },
        { label: 'Control de Acceso', to: '/catalogo?category=control-acceso' },
        { label: 'Redes y Conectividad', to: '/catalogo?category=redes-conectividad' },
        { label: 'Smart Home', to: '/catalogo?category=smart-home' },
        { label: 'Almacenamiento y NAS', to: '/catalogo?category=almacenamiento-nas' },
      ],
    },
    {
      title: 'Tecnologia',
      links: [
        { label: 'Componentes High-End', to: '/catalogo?category=componentes-pc' },
        { label: 'Perifericos Gaming', to: '/catalogo?category=perifericos-gaming' },
        { label: 'Energia y UPS', to: '/catalogo?category=energia-ups' },
        { label: 'Drones de Monitoreo', to: '/catalogo?category=drones-monitoreo' },
        { label: 'Monitores Industriales', to: '/catalogo?category=monitores-industriales' },
      ],
    },
    {
      title: 'Institucional',
      links: [
        { label: 'Ofertas relampago', to: '/catalogo?flash=true' },
        { label: 'Todos los productos', to: '/catalogo' },
        { label: 'Panel de administracion', to: '/admin' },
      ],
    },
  ];

  const submitNewsletter = (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Ingresa un email valido para suscribirte');
      return;
    }
    toast.success('Listo: te avisamos de cada oferta relampago');
    setEmail('');
  };

  const socials = [
    { Icon: IconInstagram, label: 'Instagram' },
    { Icon: IconGithub, label: 'GitHub' },
    { Icon: IconWhatsapp, label: 'WhatsApp' },
    { Icon: IconMail, label: 'Email' },
  ];

  return (
    <footer className="relative mt-24 border-t border-line bg-surface-1/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr]">
          {/* --- Marca --- */}
          <div>
            <Brand />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Especialistas en informatica, videovigilancia y seguridad electronica.
              Soluciones para hogares, oficinas e industria con soporte tecnico
              certificado y garantia extendida.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  onClick={(event) => event.preventDefault()}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-2 text-muted transition-colors hover:border-line-strong hover:text-strong"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* --- Columnas de enlaces --- */}
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="tech-label text-accent">{column.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="link-underline text-sm text-muted"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- Newsletter + medios de pago --- */}
        <div className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h4 className="font-display text-base font-semibold tracking-tight text-strong">
              Ofertas relampago en tu inbox
            </h4>
            <p className="mt-1.5 max-w-md text-sm text-muted">
              Te avisamos cuando bajamos el precio de camaras, redes y
              componentes. Un email por semana, sin spam.
            </p>
            <form onSubmit={submitNewsletter} className="mt-4 flex max-w-md gap-2">
              <label className="sr-only" htmlFor="newsletter-email">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@email.com"
                className="field"
              />
              <button type="submit" className="btn-ember shrink-0">
                Suscribirme
                <IconArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="lg:text-right">
            <h4 className="tech-label text-accent">Metodos de pago</h4>
            <div className="mt-4 flex flex-wrap items-center gap-2 lg:justify-end">
              {['Mercado Pago', 'Visa', 'Mastercard', 'Amex', 'Transferencia'].map(
                (method) => (
                  <span
                    key={method}
                    className="rounded-md border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted"
                  >
                    {method}
                  </span>
                ),
              )}
            </div>
            <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-faint lg:justify-end">
              <span className="status-dot" />
              Sistemas online &middot; Argentina
            </p>
          </div>
        </div>

        {/* --- Barra inferior --- */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-faint">
            &copy; {new Date().getFullYear()} Stark Technology. Todos los derechos
            reservados.
          </p>
          <p className="font-mono text-[11px] text-faint">
            Construido para operar 24/7 &middot; v2.0
          </p>
        </div>
      </div>
    </footer>
  );
}
