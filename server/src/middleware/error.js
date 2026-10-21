/**
 * Middleware centralizado de manejo de errores.
 * Devuelve siempre JSON con la misma forma para que el frontend sea simple.
 */

/** 404 para rutas no registradas. */
export function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: 'NOT_FOUND',
    message: `La ruta ${req.method} ${req.originalUrl} no existe.`,
  });
}

/**
 * Envoltorio para capturar errores de handlers async (Express 4 no lo hace solo).
 * @param {Function} fn
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Reporta el error y responde con un 500 generico. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  console.error('[error]', error);

  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: error.code || 'INTERNAL_ERROR',
    message:
      status === 500 && process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor.'
        : error.message || 'Error interno del servidor.',
  });
}
