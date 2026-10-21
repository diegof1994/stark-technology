import { Link } from 'react-router-dom';

import { IconGithub, IconInstagram, IconMail, IconShield, IconWhatsapp } from './Icons.jsx';

/** Footer de Stark Technology con enlaces, contacto y newsletter ficticio. */
export default function Footer() {
  const year = new Date().getFullYear();

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
        { label: 'Panel de Administracion', to: '/admin' },
        { label: 'Todos los productos', to: '/catalogo' },
        { label: 'Ofertas destacadas', to: '/catalogo?featured=true' },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-ink-600/60 bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]">
          {/* --- Marca --- */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-400 to-plasma-500 text-ink-950">
                <IconShield className="h-5 w-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-sm font-black tracking-[0.2em] text-white">
                  STARK
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.34em] text-neon-400">
                  Technology
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Especialistas en informatica, videovigilancia y seguridad electronica.
              Soluciones para hogares, oficinas e industria con soporte tecnico
              certificado y garantia extendida.
            </p>

            <div className="mt-6 flex gap-2">
              {[
                { Icon: IconInstagram, label: 'Instagram' },
                { Icon: IconGithub, label: 'GitHub' },
                { Icon: IconWhatsapp, label: 'WhatsApp' },
                { Icon: IconMail, label: 'Email' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  onClick={(event) => event.preventDefault()}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-ink-600 bg-ink-800/60 text-slate-400 transition-colors hover:border-neon-500/60 hover:text-neon-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* --- Columnas de enlaces --- */}
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-neon-400">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-slate-400 transition-colors hover:text-neon-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* --- Barra inferior --- */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-700/70 pt-6 sm:flex-row">
          <p className="font-mono text-[11px] text-slate-500">
            &copy; {year} Stark Technology. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid-400" />
              Sistemas online
            </span>
            <span>Argentina</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
