import { Router } from 'express';

import { asyncHandler } from '../middleware/error.js';
import { listCategories } from '../data/store.js';

const router = Router();

/**
 * GET /api/categories
 * Devuelve los 10 rubros del catalogo con el conteo de productos de cada uno.
 */
router.get(
  '/',
  asyncHandler((req, res) => {
    const categories = listCategories();
    res.json({ ok: true, total: categories.length, categories });
  }),
);

export default router;
