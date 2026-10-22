import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FlashCountdown from '../components/FlashCountdown.jsx';
import { CATEGORY_ICONS, IconArrowRight, IconBolt, IconShield, IconSparkles, IconTruck } from '../components/Icons.jsx';
import { getCategories, getFlashProducts, getProducts } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { nextDeadline } from '../utils/flash.js';

/**
 * Home - Landing de Stark Technology.
 * Hero con buscador predictivo, rubros destacados, Ofertas Flash, productos
 * destacados y franja de Titulo con Beneficios (garantia, envio, soporte, instalacion).
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

  const featured = useMemo(
    () => products.filter((product) => product.featured).slice(0, 8),
    [products],
  );

  // Si la API de ofertas no responde, caemos al catalogo local.
  const flashDeals = useMemo(() => {
    if (flashProducts.length) return flashProducts;
    return products.filter((product) => product.flashSale).slice(0, 8);
  }, [flashProducts, products]);

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
    { Icon: IconShield, title: 'Garantia extendida', text: 'Hasta 36 meses en productos seleccionados' },
    { Icon: IconTruck, title: 'Envio a todo el pais', text: 'Despachamos en 24hs habiles' },
    { Icon: IconBolt, title: 'Instalacion profesional', text: 'Equipo tecnico certificado en CABA' },
    { Icon: IconSparkles, title: 'Asesoria tecnica', text: 'Preventa gratuita para proyectos' },
  ];

  return (
    <div>
      {/* ==========================================================
          HERO
          ========================================================== */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        {/* Auroras de fondo */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[26rem] w-[52rem] -translate-x-1/2 rounded-full bg-ember-500/12 blur-[120px]" />
          <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-flare-500/12 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-ember-500/35 bg-ember-500/8 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ember-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember-400" />
              Distribuidor oficial de seguridad e informatica
            </span>

            <h1 className="mt-6 font-display text-4xl font-black uppercase leading-[1.08] tracking-[0.02em] text-white sm:text-5xl lg:text-6xl">
              Tecnologia que <span className="text-gradient">protege</span> tu mundo
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400">
              Camaras IP, control de acceso biometrico, redes, drones de inspeccion y
              componentes high-end. Todo el ecosistema de tu casa inteligente y tu
              empresa en un solo lugar.
            </p>

            {/* --- Buscador predictivo --- */}
            <div className="mx-auto mt-9 max-w-2xl">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                products={products}
                categories={categories}
                placeholder="Buscar camaras, NAS, drones, GPUs..."
              />
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">
                10 rubros especializados &middot; 60+ productos en stock
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================================
          OFERTAS FLASH
          ========================================================== */}
      {flashDeals.length > 0 && (
        <section className="relative overflow-hidden border-y border-flare-500/25 bg-gradient-to-b from-flare-500/8 via-transparent to-savings-500/5 px-4 py-16 sm:px-6 lg:px-8">
          {/* Resplandor de fondo de la seccion */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-flare-500/12 blur-[110px]" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-savings-500/10 blur-[100px]" />
          </div>

          <div className="mx-auto max-w-7xl">
            {/* --- Cabecera de la promo --- */}
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-flare-500/40 bg-flare-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-flare-300">
                  <span aria-hidden="true">🔥</span>
                  Oferta Relampago
                </p>
                <h2 className="mt-3 font-display text-3xl font-black uppercase leading-none tracking-[0.02em] text-white sm:text-4xl">
                  <span className="text-gradient">70% OFF</span> en tecnologia
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                  El descuento de tu vida en camaras, redes, componentes y periféricos.
                  Precios validos por tiempo limitado: cuando termine el reloj, vuelven
                  a su valor original.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <FlashCountdown deadline={nextDeadline()} label="Termina en" />
                <Link to="/catalogo?flash=true" className="btn-ghost">
                  Ver todas las ofertas
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* --- Cinta de urgencia --- */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-flare-500/30 bg-ink-900/60 px-4 py-3">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-flare-300">
                <IconBolt className="h-4 w-4 text-ember-400" />
                Solo por hoy - 24h corriendo
              </span>
              <span className="text-flare-500/40" aria-hidden="true">
                |
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Sin limite de compra por unidad
              </span>
              <span className="text-flare-500/40" aria-hidden="true">
                |
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Envio gratis en el pais
              </span>
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Rubros</p>
            <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] text-white sm:text-3xl">
              10 categorias especializadas
            </h2>
          </div>
          <Link to="/catalogo" className="btn-ghost">
            Ver todo el catalogo
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category, index) => {
            const CategoryIcon = CATEGORY_ICONS[category.id];
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
              >
                <Link
                  to={`/catalogo?category=${category.id}`}
                  className="card-tech group relative block h-44 overflow-hidden"
                >
                  <img
                    src={category.cover}
                    alt={category.label}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-55 transition-all duration-500 group-hover:scale-110 group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="mb-2 grid h-9 w-9 place-items-center rounded-lg border border-ember-400/30 bg-ink-950/70 text-ember-300 backdrop-blur">
                      {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                    </span>
                    <h3 className="font-display text-[12px] font-bold uppercase leading-tight tracking-[0.08em] text-white">
                      {category.label}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ember-400">
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Seleccion Stark</p>
            <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em] text-white sm:text-3xl">
              Productos destacados
            </h2>
          </div>
          <Link to="/catalogo?featured=true" className="btn-ghost">
            Ver destacados
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* ==========================================================
          BENEFICIOS
          ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-2xl border border-ink-600/70 bg-ink-850/50 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
          {benefits.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ember-500/30 bg-ember-500/8 text-ember-300">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.1em] text-white">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
