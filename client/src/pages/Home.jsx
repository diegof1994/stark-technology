import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import ProductCard from '../components/ProductCard.jsx';
import {
  CATEGORY_ICONS,
  IconArrowRight,
  IconHeadset,
  IconLock,
  IconTruck,
  IconWhatsapp,
} from '../components/Icons.jsx';
import { getCategories, getFlashProducts, getProducts } from '../api/client.js';

/** Bloque de seccion con titulo a la izquierda y "Ver todo" a la derecha. */
function Section({ title, to, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-strong">{title}</h2>
        {to && (
          <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
            Ver todo
            <IconArrowRight className="h-4 w-4" />
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
      {/* --- Banners --- */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <Link
            to="/catalogo?category=herramientas"
            className="group relative flex min-h-[14rem] overflow-hidden sm:min-h-[18rem] rounded-2xl bg-gradient-to-br from-ember-100 via-cream-100 to-ember-200 lg:col-span-2"
          >
            <div className="relative z-10 flex max-w-sm flex-col justify-center p-7 sm:p-10">
              <p className="text-sm font-semibold text-accent">Nuevo ingreso</p>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-strong sm:text-4xl">
                Herramientas para tu taller
              </h1>
              <p className="mt-3 text-sm text-body sm:text-base">
                Taladros, amoladoras y juegos de llaves. Pagalos en hasta 6 cuotas sin interes.
              </p>
              <span className="btn-ember mt-6 w-fit">
                Ver herramientas
                <IconArrowRight className="h-4 w-4" />
              </span>
            </div>
            <img
              src="/productos/taladro.svg"
              alt=""
              aria-hidden="true"
              className="absolute -right-10 bottom-0 hidden h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105 sm:block"
            />
          </Link>

          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/catalogo?flash=true"
              className="group flex flex-col justify-center rounded-2xl bg-strong p-7 text-surface-1"
            >
              <p className="text-sm font-semibold text-ember-300">Ofertas de la semana</p>
              <p className="mt-1 font-display text-2xl font-semibold leading-tight">
                Hasta 25% OFF en tecnologia
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ember-200 group-hover:underline">
                Ver ofertas <IconArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              to="/catalogo?category=camaras-seguridad"
              className="group flex flex-col justify-center rounded-2xl border border-line bg-surface-1 p-7"
            >
              <p className="text-sm font-semibold text-accent">Seguridad para tu casa</p>
              <p className="mt-1 font-display text-2xl font-semibold leading-tight text-strong">
                Camaras y alarmas
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:underline">
                Ver productos <IconArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Beneficios --- */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-line bg-surface-1 p-5 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-100 text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-strong">{title}</p>
                <p className="text-xs text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Categorias --- */}
      {categories.length > 0 && (
        <Section title="Compra por categoria">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => {
              const CategoryIcon = CATEGORY_ICONS[category.id];
              return (
                <Link
                  key={category.id}
                  to={`/catalogo?category=${category.id}`}
                  title={category.label}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-line bg-surface-1 px-2 py-5 text-center transition hover:border-accent/50 hover:shadow-card"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-accent transition group-hover:bg-ember-100">
                    {CategoryIcon && <CategoryIcon className="h-6 w-6" />}
                  </span>
                  <span className="text-xs font-medium leading-tight text-strong sm:text-sm">
                    {category.shortLabel || category.label}
                  </span>
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
