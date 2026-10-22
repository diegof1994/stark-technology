import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { IconAlert, IconClose, IconImage } from './Icons.jsx';
import { FLASH_DISCOUNT_DEFAULT, originalPriceFrom } from '../utils/flash.js';
import { formatPrice } from '../utils/format.js';
import StruckPrice from './StruckPrice.jsx';

/** Plantilla vacia para un producto nuevo. */
export const EMPTY_PRODUCT = {
  name: '',
  category: 'camaras-seguridad',
  brand: 'Stark',
  price: '',
  compareAtPrice: '',
  stock: '',
  image: '',
  description: '',
  featuresText: '',
  featured: false,
  flashSale: false,
  flashDiscount: FLASH_DISCOUNT_DEFAULT,
};

/**
 * ProductFormModal - Formulario de alta / edicion de productos (ABM).
 *
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {object}   props.product  Producto a editar (null = crear uno nuevo).
 * @param {Array}    props.categories
 * @param {Function} props.onSubmit  Recibe el payload normalizado.
 * @param {Function} props.onClose
 */
export default function ProductFormModal({
  open,
  product,
  categories = [],
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* --- Carga los datos del producto en edicion --- */
  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name ?? '',
        category: product.category ?? 'camaras-seguridad',
        brand: product.brand ?? 'Stark',
        price: product.price ?? '',
        compareAtPrice: product.compareAtPrice ?? '',
        stock: product.stock ?? '',
        image: product.image ?? '',
        description: product.description ?? '',
        featuresText: (product.features ?? []).join('\n'),
        featured: Boolean(product.featured),
        flashSale: Boolean(product.flashSale),
        flashDiscount:
          Number(product.flashDiscount) || FLASH_DISCOUNT_DEFAULT,
      });
    } else {
      setForm({ ...EMPTY_PRODUCT });
    }
    setErrors({});
  }, [open, product]);

  const update = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  /** Precio original que se mostrara tachado al activar la oferta flash. */
  const derivedOriginal = form.flashSale
    ? formatPrice(originalPriceFrom(Number(form.price), Number(form.flashDiscount)))
    : null;

  /** Valida los campos obligatorios. */
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'El nombre es obligatorio.';
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = 'Ingresa un precio valido (>= 0).';
    }
    if (form.stock === '' || Number.isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      next.stock = 'Ingresa un stock valido (>= 0).';
    }
    if (form.image && !/^https?:\/\//i.test(form.image.trim())) {
      next.image = 'La URL de la imagen debe empezar con http:// o https://';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim() || 'Stark',
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image.trim(),
        description: form.description.trim(),
        features: form.featuresText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 12),
        featured: form.featured,
        flashSale: form.flashSale,
        flashDiscount: Number(form.flashDiscount) || FLASH_DISCOUNT_DEFAULT,
        // En oferta flash el precio original se deriva del descuento aplicado.
        compareAtPrice: form.flashSale
          ? originalPriceFrom(Number(form.price), Number(form.flashDiscount))
          : form.compareAtPrice === ''
            ? null
            : Number(form.compareAtPrice),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-overlay/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[120] flex max-h-[88vh] w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-line bg-surface-1/95 shadow-panel backdrop-blur-xl"
            role="dialog"
            aria-label={product ? 'Editar producto' : 'Nuevo producto'}
          >
            {/* --- Cabecera --- */}
            <header className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-strong">
                  {product ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                  {product ? `SKU ${product.sku ?? '-'}` : 'Alta de inventario'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface-2 text-muted transition-colors hover:border-danger/50 hover:text-danger"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </header>

            {/* --- Formulario --- */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 space-y-5 overflow-y-auto p-6"
            >
              {/* Nombre */}
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  Nombre del producto *
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Camara IP 4K IP67 Vision Nocturna 80m"
                  className="field"
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </label>

              {/* Categoria + Marca */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                    Categoria
                  </span>
                  <select
                    value={form.category}
                    onChange={update('category')}
                    className="field"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                    Marca
                  </span>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={update('brand')}
                    placeholder="StarkView"
                    className="field"
                  />
                </label>
              </div>

              {/* Precio + Stock */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                    Precio (ARS) *
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={update('price')}
                    placeholder="12990.00"
                    className="field"
                  />
                  {errors.price && <FieldError>{errors.price}</FieldError>}
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                    Precio anterior
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={update('compareAtPrice')}
                    placeholder="15990.00"
                    disabled={form.flashSale}
                    className="field disabled:opacity-50"
                  />
                  {form.flashSale && (
                    <span className="mt-1 block font-mono text-[10px] text-savings-ink">
                      Se calcula solo: {derivedOriginal ?? '-'}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                    Stock *
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={update('stock')}
                    placeholder="25"
                    className="field"
                  />
                  {errors.stock && <FieldError>{errors.stock}</FieldError>}
                </label>
              </div>

              {/* --- Oferta Flash --- */}
              <div
                className={`rounded-lg border p-4 transition-colors ${
                  form.flashSale
                    ? 'border-flare-500/45 bg-flare-500/8'
                    : 'border-line bg-surface-2/40'
                }`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.flashSale}
                    onChange={update('flashSale')}
                    className="mt-0.5 h-4 w-4 accent-flare-400"
                  />
                  <span className="flex-1">
                    <span className="block font-display text-[13px] font-semibold tracking-tight text-strong">
                      🔥 Oferta Flash
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                      Marca el producto como oferta relampago. El precio original se
                      calcula automaticamente a partir del descuento.
                    </span>
                  </span>
                </label>

                {form.flashSale && (
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <label className="block w-32">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        Descuento %
                      </span>
                      <input
                        type="number"
                        min="5"
                        max="95"
                        step="1"
                        value={form.flashDiscount}
                        onChange={update('flashDiscount')}
                        className="field"
                      />
                    </label>

                    <div className="flex-1">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                        Se mostrara
                      </span>
                      <p className="flex flex-wrap items-baseline gap-2">
                        <span className="font-display text-lg font-bold text-savings-ink tabular">
                          {form.price === ''
                            ? '-'
                            : formatPrice(Number(form.price))}
                        </span>
                        <StruckPrice>{derivedOriginal ?? '-'}</StruckPrice>
                        <span className="font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-accent-2">
                          -{form.flashDiscount}% OFF
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Imagen */}
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  URL de la imagen
                </span>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={form.image}
                    onChange={update('image')}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="field flex-1"
                  />
                  <div className="grid h-[42px] w-[42px] shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <IconImage className="h-4 w-4 text-faint" />
                    )}
                  </div>
                </div>
                {errors.image && <FieldError>{errors.image}</FieldError>}
              </label>

              {/* Descripcion */}
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  Descripcion
                </span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={update('description')}
                  placeholder="Describe el producto, sus aplicaciones y diferenciales..."
                  className="field resize-y"
                />
              </label>

              {/* Caracteristicas */}
              <label className="block">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                  Caracteristicas (una por linea)
                </span>
                <textarea
                  rows={4}
                  value={form.featuresText}
                  onChange={update('featuresText')}
                  placeholder={'Resolucion 4K\nIP67\nAlimentacion PoE'}
                  className="field resize-y font-mono text-xs"
                />
              </label>

              {/* Destacado */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={update('featured')}
                  className="h-4 w-4 accent-ember-400"
                />
                <span>
                  <span className="block text-sm text-body">
                    Marcar como destacado
                  </span>
                  <span className="block text-[11px] text-faint">
                    Los productos destacados aparecen en el inicio.
                  </span>
                </span>
              </label>
            </form>

            {/* --- Pie con acciones --- */}
            <footer className="flex items-center justify-end gap-3 border-t border-line/70 bg-surface-2/60 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-ember"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-accent/30 border-t-on-accent" />
                    Guardando...
                  </>
                ) : product ? (
                  'Guardar cambios'
                ) : (
                  'Crear producto'
                )}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Mensaje de error de campo. */
function FieldError({ children }) {
  return (
    <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-danger">
      <IconAlert className="h-3 w-3 shrink-0" />
      {children}
    </span>
  );
}
