import { Router } from 'express';

import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getStats,
  listProducts,
  updateProduct,
} from '../data/store.js';

const router = Router();

/**
 * GET /api/products
 * Soporta filtros por categoria, busqueda de texto, precio, stock y ordenamiento.
 * Query: ?q=&category=&minPrice=&maxPrice=&minStock=&featured=&sort=&page=&limit=
 */
router.get(
  '/',
  asyncHandler((req, res) => {
    const { q, category, minPrice, maxPrice, minStock, featured, sort, page, limit } =
      req.query;

    const { items, total } = listProducts({
      q,
      category,
      minPrice: minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined,
      minStock: minStock !== undefined && minStock !== '' ? Number(minStock) : undefined,
      featured: featured === 'true' ? true : undefined,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 0,
    });

    res.json({
      ok: true,
      total,
      count: items.length,
      page: Number(page) || 1,
      products: items,
    });
  }),
);

/** GET /api/products/stats -> metricas de inventario para el panel admin. */
router.get(
  '/stats',
  asyncHandler((req, res) => {
    res.json({ ok: true, stats: getStats() });
  }),
);

/**
 * GET /api/products/:id
 * Devuelve el detalle de un producto por id o slug.
 */
router.get(
  '/:id',
  asyncHandler((req, res) => {
    const product = getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({
        ok: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `No existe un producto con id "${req.params.id}".`,
      });
    }
    return res.json({ ok: true, product });
  }),
);

/**
 * POST /api/products  (Admin)
 * Crea un producto nuevo en el inventario.
 */
router.post(
  '/',
  requireAdmin,
  asyncHandler((req, res) => {
    const { name, price } = req.body ?? {};

    if (!name?.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'El campo "name" es obligatorio.',
      });
    }
    if (price === undefined || Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'El campo "price" debe ser un numero mayor o igual a 0.',
      });
    }

    const product = createProduct(req.body);
    return res.status(201).json({ ok: true, message: 'Producto creado.', product });
  }),
);

/**
 * PUT /api/products/:id  (Admin)
 * Actualiza (total o parcialmente) un producto existente.
 */
router.put(
  '/:id',
  requireAdmin,
  asyncHandler((req, res) => {
    const product = updateProduct(req.params.id, req.body ?? {});
    if (!product) {
      return res.status(404).json({
        ok: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `No existe un producto con id "${req.params.id}".`,
      });
    }
    return res.json({ ok: true, message: 'Producto actualizado.', product });
  }),
);

/**
 * DELETE /api/products/:id  (Admin)
 * Elimina un producto del inventario.
 */
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler((req, res) => {
    const removed = deleteProduct(req.params.id);
    if (!removed) {
      return res.status(404).json({
        ok: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `No existe un producto con id "${req.params.id}".`,
      });
    }
    return res.json({
      ok: true,
      message: `Producto "${removed.name}" eliminado.`,
      product: removed,
    });
  }),
);

export default router;
