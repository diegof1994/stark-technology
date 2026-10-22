import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import StruckPrice from '../components/StruckPrice.jsx';
import TrustTicker from '../components/TrustTicker.jsx';
import FlashCountdown from '../components/FlashCountdown.jsx';
import {
  CATEGORY_ICONS,
  IconArrowRight,
  IconBolt,
  IconShield,
  IconSparkles,
  IconTruck,
} from '../components/Icons.jsx';
import { getCategories, getFlashProducts, getProducts } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import { flashPricing, nextDeadline } from '../utils/flash.js';

/**
 * Home - Landing de Stark Technology.
 *
 * Recorrido: hero en dos columnas con panel de oferta en vivo, cinta de
 * garantias, bloque de Ofertas Flash, rubros en retícula editorial,
 * productos destacados, beneficios y cierre con llamada a la accion.
 */
export default function Home() {
  const toast = useToast();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flashProducts, setFlashProducts] = useState([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => toast.warning('No se pudieron cargar las categorias'));
    getProducts({ sort: 'featured' })
      .then((data) => setProducts(data.products ?? []))
      .catch(() => toast.warning('No se pudo cargar el catalogo'));
    getFlashProducts()
      .then((data) => setFlashProducts(data.products ?? []))
      .catch(() => setFlashProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Los productos en oferta ya tienen su propio bloque arriba: no se repiten. */
  const featured = useMemo(() => {
    const pool = products.filter((product) => product.featured && !product.flashSale);
    if (pool.length) return pool.slice(0, 8);
    return products.filter((product) => !product.flashSale).slice(0, 8);
  }, [products]);

  // Si la API de ofertas no responde, caemos al catalogo local.
  const flashDeals = useMemo(() => {
    if (flashProducts.length) return flashProducts;
    return products.filter((product) => product.flashSale).slice(0, 8);
  }, [flashProducts, products]);

  const heroDeal = flashDeals[0] ?? null;
  const heroPricing = heroDeal ? flashPricing(heroDeal) : null;

  const handleSearch = (value, categoryId, productId) => {
    // Si la sugerencia fue un producto concreto, abrimos su ficha.
    if (productId) {
      navigate(`/producto/${productId}`);
      return;
    }
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (categoryId) params.set('category', categoryId);
    navigate(`/catalogo?${params.toString()}`);
  };

  const benefits = [
    {
      Icon: IconShield,
      title: 'Garantia extendida',
      text: 'Hasta 36 meses en productos seleccionados',
    },
    {
      Icon: IconTruck,
      title: 'Envio a todo el pais',
      text: 'Despachamos en 24hs habiles',
    },
    {
      Icon: IconBolt,
      title: 'Instalacion profesional',
      text: 'Equipo tecnico certificado en CABA',
    },
    {
      Icon: IconSparkles,
      title: 'Asesoria tecnica',
      text: 'Preventa gratuita para proyectos',
    },
  ];

  return (
    <div>
      {/* ==========================================================
          HERO
          ========================================================== */}
      <section className="relative overflow-hidden px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* --- Columna de mensaje --- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-1/80 py-1.5 pl-2 pr-4 text-muted backdrop-blur">
              <span className="status-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                Distribuidor oficial de seguridad e informatica
              </span>
            </span>

            <h1 className="mt-7 font-display text-[clamp(2.6rem,6.2vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-strong">
              Tecnologia que{' '}
              <span className="text-gradient">protege</span> tu mundo
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
              Camaras IP, control de acceso biometrico, redes, drones de inspeccion y
              componentes high-end. Todo el ecosistema de tu casa inteligente y tu
              empresa en un solo lugar.
            </p>

            {/* --- Buscador predictivo --- */}
            <div className="mt-8 max-w-xl">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                products={products}
                categories={categories}
                placeholder="Buscar camaras, NAS, drones, GPUs..."
              />
            </div>

            {/* --- Indicadores --- */}
            <dl className="mt-9 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { value: '60+', label: 'Productos en stock' },
                { value: '10', label: 'Rubros especializados' },
                { value: '24h', label: 'Despacho habiles' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-bold tracking-tight text-strong">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-faint">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* --- Panel de oferta en vivo --- */}
          <motion.aside
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-flare-500/18 via-transparent to-savings-500/16 blur-2xl" />

            <div className="surface-raised relative overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-2">
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-flare-500" />
                  Oferta en vivo
                </span>
                <FlashCountdown deadline={nextDeadline()} compact />
              </div>

              {heroDeal ? (
                <Link
                  to={`/producto/${heroDeal.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                    <img
                      src={heroDeal.image}
                      alt={heroDeal.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/25 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-flare-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-on-flash shadow-flare">
                      -{heroDeal.flashDiscount}% OFF
                    </span>
                  </div>

                  <div className="px-5 pb-6 pt-1">
                    <p className="tech-label">{heroDeal.categoryLabel || heroDeal.category}</p>
                    <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-tight text-strong transition-colors group-hover:text-accent">
                      {heroDeal.name}
                    </h2>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-display text-3xl font-black leading-none text-savings-ink tabular">
                          {formatPrice(heroPricing?.final ?? heroDeal.price)}
                        </p>
                        {heroPricing?.original && (
                          <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-muted">
                            Precio de lista
                            <StruckPrice size="sm" className="font-mono text-[11px]">
                              {formatPrice(heroPricing.original)}
                            </StruckPrice>
                          </p>
                        )}
                      </div>
                      <span className="btn-quiet">
                        Ver detalle
                        <IconArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="px-5 py-14 text-center">
                  <p className="text-sm text-muted">Cargando la oferta destacada...</p>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </section>

      {/* ==========================================================
          CINTA DE GARANTIAS
          ========================================================== */}
      <TrustTicker />

      {/* ==========================================================
          OFERTAS FLASH
          ========================================================== */}
      {flashDeals.length > 0 && (
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          {/* Resplandor de fondo de la seccion */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-[15%] top-10 h-72 w-72 rounded-full bg-flare-500/12 blur-[120px]" />
            <div className="absolute bottom-0 right-[20%] h-64 w-64 rounded-full bg-savings-500/10 blur-[110px]" />
          </div>

          <div className="mx-auto max-w-7xl">
            <SectionHeading
              kicker="Oferta relampago"
              title={
                <>
                  <span className="text-gradient">70% OFF</span> en tecnologia
                </>
              }
              description="El descuento de tu vida en camaras, redes, componentes y perifericos. Los precios son validos por tiempo limitado: cuando termine el reloj, vuelven a su valor original."
              action={{ to: '/catalogo?flash=true', label: 'Ver todas las ofertas' }}
            />

            {/* --- Cabecera de promo con reloj --- */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-flare-500/25 bg-surface-1/60 px-5 py-4 backdrop-blur">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-2">
                  <IconBolt className="h-4 w-4" />
                  Solo por hoy - 24h corriendo
                </span>
                <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  Sin limite de compra por unidad
                </span>
                <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  Envio gratis en el pais
                </span>
              </div>

              <FlashCountdown deadline={nextDeadline()} label="Termina en" />
            </div>

            {/* --- Grilla de ofertas --- */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {flashDeals.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================================
          RUBROS
          ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Rubros"
          title="10 categorias especializadas"
          description="Desde videovigilancia hasta componentes de alta gama: encuentra el equipo para cada proyecto."
          action={{ to: '/catalogo', label: 'Ver todo el catalogo' }}
        />

        {/* Retícula editorial: la primera categoria ocupa una celda doble. */}
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {categories.map((category, index) => {
            const CategoryIcon = CATEGORY_ICONS[category.id];
            const featured = index === 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.35) }}
                className={featured ? 'lg:row-span-2' : ''}
              >
                <Link
                  to={`/catalogo?category=${category.id}`}
                  className="card-tech group relative flex h-full min-h-[11rem] flex-col justify-end overflow-hidden"
                >
                  <img
                    src={category.cover}
                    alt={category.label}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-45 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-transparent" />

                  <div className="relative p-5">
                    <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface-1/80 text-accent backdrop-blur">
                      {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                    </span>
                    <h3 className="font-display text-sm font-semibold uppercase leading-tight tracking-[0.08em] text-strong">
                      {category.label}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                      {category.count} productos
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ==========================================================
          PRODUCTOS DESTACADOS
          ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Seleccion Stark"
          title="Productos destacados"
          description="El equipo que recomendamos este mes, con stock disponible y envio inmediato."
          action={{ to: '/catalogo?featured=true', label: 'Ver destacados' }}
        />

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* ==========================================================
          BENEFICIOS
          ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ Icon, title, text }) => (
            <div key={title} className="group bg-surface-1 p-6 transition-colors hover:bg-surface-2">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface-2 text-accent transition-colors group-hover:border-accent/40 group-hover:text-accent-strong">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-4 font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-strong">
                {title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================
          CIERRE
          ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-1 px-6 py-12 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,color-mix(in_oklab,var(--color-ember-500)_16%,transparent),transparent)]"
            aria-hidden="true"
          />
          <p className="eyebrow">Proyectos y prevented</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-[clamp(1.7rem,3.6vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-strong">
            Contanos que necesitas y armamos la lista de equipos ideal
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Asesoria tecnica gratuita, instalacion en CABA y garantia extendida.
            Escribinos y te respondemos en menos de 24hs habiles.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/catalogo" className="btn-ember">
              Explorar el catalogo
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:ventas@starktechnology.com.ar"
              className="btn-ghost"
            >
              Hablar con un asesor
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
