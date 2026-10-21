import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

import ProductFormModal from '../components/ProductFormModal.jsx';
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
          className="w-full rounded-2xl border border-ink-600/70 bg-ink-850/70 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-ember-400 to-flare-500 text-ink-950">
            <IconLock className="h-6 w-6" />
          </div>
          <h1 className="font-display text-lg font-bold uppercase tracking-[0.14em] text-white">
            Panel de administracion
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Ingresa el token de administrador para gestionar el inventario de Stark
            Technology. En desarrollo el token por defecto es{' '}
            <code className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-ember-300">
              {ADMIN_TOKEN}
            </code>
            .
          </p>

          <label className="mt-6 block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Token de administrador
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-ink-600 bg-ink-900/80 px-3 focus-within:border-ember-500/70">
              <IconUser className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
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
          <h1 className="mt-1.5 font-display text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
            Gestion de inventario
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            ABM completo de productos sincronizado con la API REST.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px] uppercase tracking-wider ${
              syncEnabled
                ? 'border-lime-400/40 bg-lime-400/10 text-lime-400'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                syncEnabled ? 'animate-pulse bg-lime-400' : 'bg-amber-400'
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
            tone: 'text-ember-300',
          },
          {
            label: 'Unidades en stock',
            value: formatNumber(stats.stock),
            Icon: IconChart,
            tone: 'text-sky-300',
          },
          {
            label: 'Valor de inventario',
            value: formatPrice(stats.value),
            Icon: IconChart,
            tone: 'text-flare-300',
          },
          {
            label: 'Stock critico / agotado',
            value: `${stats.lowStock} / ${stats.outOfStock}`,
            Icon: IconAlert,
            tone: 'text-amber-300',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="card-tech flex items-center gap-4 p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ink-600 bg-ink-800/70">
              <card.Icon className={`h-5 w-5 ${card.tone}`} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className="mt-0.5 truncate font-display text-lg font-bold text-white">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- Filtros --- */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[16rem] flex-1 items-center gap-2.5 rounded-xl border border-ink-600 bg-ink-850/70 px-3.5 focus-within:border-ember-500/70">
          <IconSearch className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, marca o SKU..."
            className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
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
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/35 bg-amber-500/8 px-4 py-3">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed text-amber-200/85">
            <strong className="font-semibold">Sin conexion con el backend.</strong> Los
            cambios se guardan en el almacenamiento local del navegador.{' '}
            {error ? `(${error})` : ''} Volve a sincronizar cuando la API este
            disponible.
          </p>
        </div>
      )}

      {/* --- Tabla de productos --- */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-850/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="border-b border-ink-700/70 bg-ink-800/50">
                {['Producto', 'Categoria', 'Precio', 'Stock', 'Acciones'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/50">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    Cargando inventario...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <p className="text-sm text-slate-500">
                      No hay productos que coincidan con el filtro.
                    </p>
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-ink-800/40"
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
                          <p className="truncate text-sm font-medium text-slate-100">
                            {product.name}
                          </p>
                          <p className="font-mono text-[10px] text-slate-500">
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
                      <p className="font-mono text-sm text-ember-300">
                        {formatPrice(product.price)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs ${
                          product.stock === 0
                            ? 'text-red-400'
                            : product.stock <= 10
                              ? 'text-amber-400'
                              : 'text-slate-300'
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
                          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-600 bg-ink-800/60 text-slate-400 transition-colors hover:border-ember-500/60 hover:text-ember-300"
                        >
                          <IconEdit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(product)}
                          aria-label={`Eliminar ${product.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-ink-600 bg-ink-800/60 text-slate-400 transition-colors hover:border-red-500/60 hover:text-red-400"
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

      <p className="mt-4 font-mono text-[11px] text-slate-600">
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
        <div className="fixed inset-0 z-[130] grid place-items-center bg-ink-950/80 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-red-500/40 bg-ink-900/95 p-6 shadow-2xl"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-red-500/40 bg-red-500/10">
              <IconAlert className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-[0.14em] text-white">
              Eliminar producto
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Estas seguro de eliminar{' '}
              <span className="font-semibold text-slate-100">
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
              <button type="button" onClick={handleDelete} className="btn-ember !from-red-500 !to-red-600 !text-white">
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
