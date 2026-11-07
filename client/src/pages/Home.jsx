import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard.jsx';
import {
  CATEGORY_ICONS,
  IconHeadset,
  IconLock,
  IconTruck,
  IconWhatsapp,
} from '../components/Icons.jsx';
import { getCategories, getFlashProducts, getProducts } from '../api/client.js';
import { formatPrice } from '../utils/format.js';

/** Bloque de seccion con titulo a la izquierda y "Ver todo" a la derecha. */
function Section({ title, to, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-strong sm:text-[1.75rem]">{title}</h2>
        {to && (
          <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Ver todo
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

const BENEFITS = [
  { Icon: IconTruck, title: 'Envio a todo el pais', text: 'Gratis desde $150.000' },
  { Icon: IconLock, title: 'Compra protegida', text: 'Pagas seguro con Mercado Pago' },
  { Icon: IconHeadset, title: 'Hasta 6 cuotas', text: 'Sin interes con tarjeta' },
  { Icon: IconWhatsapp, title: 'Te asesoramos', text: 'Consultanos por WhatsApp' },
];

/**
 * Home - Portada de tienda convencional: banner principal, beneficios,
 * categorias y grillas de productos.
 */
export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]));
    getProducts({ sort: 'featured' })
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
    getFlashProducts()
      .then((data) => setDeals(data.products ?? []))
      .catch(() => setDeals([]));
  }, []);

  // Portada: productos de herramientas destacados, apilados.
  const heroStack = useMemo(
    () =>
      products
        .filter((product) => product.category === 'herramientas' && product.featured)
        .concat(products.filter((product) => product.category === 'herramientas' && !product.featured))
        .slice(0, 3),
    [products],
  );

  const tools = useMemo(
    () => products.filter((product) => product.category === 'herramientas').slice(0, 4),
    [products],
  );
  const featured = useMemo(
    () =>
      products
        .filter((product) => product.featured && product.category !== 'herramientas')
        .slice(0, 8),
    [products],
  );

  return (
    <div className="pb-12">
      {/* --- Portada: la "estiba" de productos --- */}
      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-[var(--color-navy-900)] text-white">
          {/* Lineas de estanteria */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, transparent 0, transparent 119px, #fff 119px, #fff 120px)',
            }}
          />
          <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:px-14">
            <div>
              <p className="text-sm text-white/70">Negocio familiar con envios a todo el pais</p>
              <h1
                className="mt-3 font-display text-[2.1rem] font-extrabold leading-[1.04] text-white sm:text-6xl"
                style={{ fontStretch: '120%' }}
              >
                Herramientas y tecnologia para trabajar mejor
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
                Elegimos e importamos cada producto. Pagalo en hasta 6 cuotas sin interes y
                recibilo en tu casa.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/catalogo?category=herramientas"
                  className="rounded-full bg-[var(--color-amber-400)] px-6 py-3 text-sm font-semibold text-[var(--color-navy-900)] transition hover:bg-[var(--color-amber-300)]"
                >
                  Ver herramientas
                </Link>
                <Link
                  to="/catalogo?flash=true"
                  className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver ofertas
                </Link>
              </div>
            </div>

            {/* Tres productos apilados como cajas en una estanteria */}
            {heroStack.length > 0 && (
              <div className="relative mx-auto h-[300px] w-full max-w-[420px] sm:h-[360px]">
                {heroStack.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/producto/${product.id}`}
                    className="group absolute flex w-[78%] items-center gap-3 rounded-2xl bg-white p-3 text-strong shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      top: `${index * 31}%`,
                      left: `${[0, 11, 22][index]}%`,
                      zIndex: 3 - index,
                    }}
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-xl bg-surface-2 object-cover sm:h-24 sm:w-24"
                    />
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</span>
                      <span
                        className="mt-1 block font-display text-lg font-bold"
                        style={{ fontStretch: '112%' }}
                      >
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- Beneficios --- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-line py-6 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <Icon className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-strong">{title}</p>
                <p className="text-xs text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Categorias --- */}
      {categories.length > 0 && (
        <Section title="Compra por categoria">
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category.id];
              return (
                <Link
                  key={category.id}
                  to={`/catalogo?category=${category.id}`}
                  title={category.label}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface-1 py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium sm:py-2 sm:pl-2 sm:pr-4 sm:text-sm text-strong transition hover:border-accent hover:text-accent"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ember-100 text-accent">
                    {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                  </span>
                  {category.shortLabel || category.label}
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {deals.length > 0 && (
        <Section title="Ofertas" to="/catalogo?flash=true">
          <ProductGrid products={deals.slice(0, 4)} />
        </Section>
      )}

      {tools.length > 0 && (
        <Section title="Herramientas" to="/catalogo?category=herramientas">
          <ProductGrid products={tools} />
        </Section>
      )}

      {featured.length > 0 && (
        <Section title="Productos destacados" to="/catalogo?featured=true">
          <ProductGrid products={featured} />
        </Section>
      )}
    </div>
  );
}
