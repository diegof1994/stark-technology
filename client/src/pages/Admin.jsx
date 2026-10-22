import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

import ProductFormModal from '../components/ProductFormModal.jsx';
import StruckPrice from '../components/StruckPrice.jsx';
import {
  IconAlert,
  IconBox,
  IconChart,
  IconEdit,
  IconLock,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShield,
  IconTrash,
  IconUser,
} from '../components/Icons.jsx';
import { useInventory } from '../hooks/useInventory.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatNumber, formatPrice, normalize } from '../utils/format.js';
import { safeImage } from '../utils/fallbackImage.js';
import { ADMIN_TOKEN } from '../api/client.js';

/**
 * Admin - Panel de administracion con ABM completo del inventario.
 *
 * Incluye: autenticacion por token, dashboard de metricas, tabla de productos
 * con buscador, y el alta/edicion/baja de productos sincronizada con el backend.
 */
export default function Admin() {
  const toast = useToast();
  const {
    products,
    loading,
    syncEnabled,
    error,
    create,
    update,
    remove,
    resync,
  } = useInventory();

  /* --- Estado de la interfaz --- */
  const [token, setToken] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  /* --- Autenticacion simple por token --- */
  const handleLogin = (event) => {
    event.preventDefault();
    if (!token.trim()) {
      toast.error('Ingresa el token de administrador');
      return;
    }
    setAuthenticated(true);
    toast.success('Acceso concedido al panel de administracion');
  };

  /* --- Categorias presentes en el inventario --- */
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      if (!map.has(product.category)) {
        map.set(product.category, {
          id: product.category,
          label: product.categoryLabel || product.category,
          count: 0,
        });
      }
      map.get(product.category).count += 1;
    });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  /* --- Productos filtrados --- */
  const filtered = useMemo(() => {
    const needle = normalize(query);
    return products.filter((product) => {
      if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
      if (!needle) return true;
      return normalize(
        `${product.name} ${product.brand} ${product.sku ?? ''} ${product.description}`,
      ).includes(needle);
    });
  }, [products, query, categoryFilter]);

  /* --- Metricas del dashboard --- */
  const stats = useMemo(() => {
    const total = products.length;
    const stock = products.reduce((acc, product) => acc + (product.stock || 0), 0);
    const value = products.reduce(
      (acc, product) => acc + product.price * (product.stock || 0),
      0,
    );
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { total, stock, value, lowStock, outOfStock };
  }, [products]);

  /* --- Acciones del ABM --- */
  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        const { product, synced } = await update(editing.id, payload);
        toast.success(
          synced
            ? `"${product.name}" actualizado en el servidor`
            : `"${product.name}" actualizado localmente (sin conexion)`,
        );
      } else {
        const { product, synced } = await create(payload);
        toast.success(
          synced
            ? `"${product.name}" creado en el servidor`
            : `"${product.name}" creado localmente (sin conexion)`,
        );
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(err.message || 'No se pudo guardar el producto');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { product, synced } = await remove(confirmDelete.id);
    toast.success(
      synced
        ? `"${product?.name ?? 'Producto'}" eliminado`
        : `"${product?.name ?? 'Producto'}" eliminado localmente`,
    );
    setConfirmDelete(null);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setModalOpen(true);
  };

  /* ============================================================
   * Pantalla de login
   * ============================================================ */
  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin}
          className="w-full rounded-2xl border border-line bg-surface-1 p-8 shadow-panel"
        >
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-ember-400 to-flare-500 text-on-accent shadow-ember">
            <IconLock className="h-6 w-6" />
          </div>
          <p className="eyebrow">Acceso restringido</p>
          <h1 className="mt-2 font-display text-[clamp(1.4rem,3vw,1.8rem)] font-bold tracking-[-0.02em] text-strong">
            Panel de administracion
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Ingresa el token de administrador para gestionar el inventario de Stark
            Technology. En desarrollo el token por defecto es{' '}
            <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-accent">
              {ADMIN_TOKEN}
            </code>
            .
          </p>

          <label className="mt-6 block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Token de administrador
            </span>
            <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface-2 px-4 focus-within:border-accent-strong">
              <IconUser className="h-4 w-4 shrink-0 text-faint" />
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent py-2.5 text-sm text-strong placeholder:text-faint focus:outline-none"
              />
            </div>
          </label>

          <button type="submit" className="btn-ember mt-5 w-full !py-3">
            <IconShield className="h-4 w-4" />
            Acceder al panel
          </button>
        </motion.form>
      </div>
    );
  }

  /* ============================================================
   * Panel principal
   * ============================================================ */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* --- Cabecera --- */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Panel de control</p>
          <h1 className="mt-2 font-display text-[clamp(1.6rem,3.2vw,2.2rem)] font-bold leading-[1.05] tracking-[-0.025em] text-strong">
            Gestion de inventario
          </h1>
          <p className="mt-2 text-sm text-muted">
            ABM completo de productos sincronizado con la API REST.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] ${
              syncEnabled
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-warning/40 bg-warning/10 text-warning'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                syncEnabled ? 'animate-blink bg-success' : 'bg-warning'
              }`}
            />
            {syncEnabled ? 'Sincronizado' : 'Modo local'}
          </span>

          <button
            type="button"
            onClick={resync}
            className="btn-ghost !px-3.5 !py-2"
            aria-label="Resincronizar con el servidor"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <button type="button" onClick={openCreate} className="btn-ember">
            <IconPlus className="h-4 w-4" />
            Nuevo producto
          </button>
        </div>
      </header>

      {/* --- Metricas --- */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Productos',
            value: formatNumber(stats.total),
            Icon: IconBox,
            tone: 'text-accent',
          },
          {
            label: 'Unidades en stock',
            value: formatNumber(stats.stock),
            Icon: IconChart,
            tone: 'text-info',
          },
          {
            label: 'Valor de inventario',
            value: formatPrice(stats.value),
            Icon: IconChart,
            tone: 'text-accent-2',
          },
          {
            label: 'Stock critico / agotado',
            value: `${stats.lowStock} / ${stats.outOfStock}`,
            Icon: IconAlert,
            tone: 'text-warning',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="card-tech flex items-center gap-4 p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-line bg-surface-2">
              <card.Icon className={`h-5 w-5 ${card.tone}`} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                {card.label}
              </p>
              <p className="mt-1 truncate font-display text-lg font-bold tracking-tight text-strong tabular">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- Filtros --- */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[16rem] flex-1 items-center gap-2.5 rounded-full border border-line bg-surface-1 px-4 focus-within:border-accent-strong">
          <IconSearch className="h-4 w-4 shrink-0 text-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, marca o SKU..."
            className="w-full bg-transparent py-2.5 text-sm text-strong placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="field !w-auto !py-2.5"
        >
          <option value="all">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label} ({category.count})
            </option>
          ))}
        </select>
      </div>

      {/* --- Aviso de modo local --- */}
      {!syncEnabled && (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-warning/35 bg-warning/8 px-4 py-3">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-xs leading-relaxed text-warning/85">
            <strong className="font-semibold">Sin conexion con el backend.</strong> Los
            cambios se guardan en el almacenamiento local del navegador.{' '}
            {error ? `(${error})` : ''} Volve a sincronizar cuando la API este
            disponible.
          </p>
        </div>
      )}

      {/* --- Tabla de productos --- */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="border-b border-line bg-surface-2/70">
                {['Producto', 'Categoria', 'Precio', 'Stock', 'Acciones'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-faint"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-faint">
                    Cargando inventario...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <p className="text-sm text-faint">
                      No hay productos que coincidan con el filtro.
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-surface-2/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={safeImage(product.image)}
                          alt=""
                          loading="lazy"
                          className="h-11 w-11 shrink-0 rounded-lg object-cover"
                          onError={(event) => {
                            event.currentTarget.style.visibility = 'hidden';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-strong">
                            {product.name}
                          </p>
                          <p className="font-mono text-[10px] text-faint">
                            {product.sku ?? product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip !text-[10px]">
                        {product.categoryLabel || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.flashSale ? (
                        <div>
                          <p className="font-display text-sm font-bold text-savings-ink tabular">
                            {formatPrice(product.price)}
                          </p>
                          <StruckPrice className="font-mono text-[11px]">
                            {formatPrice(product.compareAtPrice)}
                          </StruckPrice>
                          <span className="mt-1 inline-flex items-center gap-1 rounded border border-flare-500/40 bg-flare-500/10 px-1.5 py-0.5 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-accent-2">
                            🔥 -{product.flashDiscount}% OFF
                          </span>
                        </div>
                      ) : (
                        <p className="font-display text-sm font-semibold text-strong tabular">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs tabular ${
                          product.stock === 0
                            ? 'text-danger'
                            : product.stock <= 10
                              ? 'text-warning'
                              : 'text-body'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          aria-label={`Editar ${product.name}`}
                          className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface-2 text-muted transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          <IconEdit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(product)}
                          aria-label={`Eliminar ${product.name}`}
                          className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface-2 text-muted transition-colors hover:border-danger/50 hover:text-danger"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 font-mono text-[11px] text-faint">
        Mostrando {filtered.length} de {products.length} productos del inventario.
      </p>

      {/* --- Modal de alta / edicion --- */}
      <ProductFormModal
        open={modalOpen}
        product={editing}
        categories={categories}
        onSubmit={handleSubmit}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />

      {/* --- Confirmacion de borrado --- */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-overlay/80 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-danger/40 bg-surface-1 p-6 shadow-panel"
          >
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-danger/40 bg-danger/10">
              <IconAlert className="h-5 w-5 text-danger" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold tracking-tight text-strong">
              Eliminar producto
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Estas seguro de eliminar{' '}
              <span className="font-semibold text-strong">
                {confirmDelete.name}
              </span>{' '}
              del inventario? Esta accion no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="btn-ghost"
              >
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} className="btn-danger">
                <IconTrash className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
