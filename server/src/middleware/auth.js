/**
 * Middleware de autenticacion para las rutas administrativas (ABM).
 *
 * El cliente envia el token en la cabecera `x-admin-token`.
 * Si la variable de entorno ADMIN_TOKEN no esta definida, se usa un token
 * de desarrollo por defecto y se avisa por consola.
 */
const DEV_ADMIN_TOKEN = 'stark-dev-admin';

export const ADMIN_HEADER = 'x-admin-token';

export const getAdminToken = () =>
  process.env.ADMIN_TOKEN?.trim() || DEV_ADMIN_TOKEN;

export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Verifica el token de administrador.
 * Responde 401 con un mensaje claro cuando el token falta o es incorrecto.
 */
export function requireAdmin(req, res, next) {
  const expected = getAdminToken();
  const provided = (req.headers[ADMIN_HEADER] || req.body?.adminToken || '').trim();

  if (!provided) {
    return res.status(401).json({
      ok: false,
      error: 'UNAUTHORIZED',
      message:
        'Falta el token de administrador. Envia la cabecera "x-admin-token".',
    });
  }

  if (provided !== expected) {
    return res.status(403).json({
      ok: false,
      error: 'FORBIDDEN',
      message: 'El token de administrador no es valido.',
    });
  }

  return next();
}

/** Aviso de arranque sobre la configuracion del token. */
export const warnAboutAdminToken = () => {
  if (!process.env.ADMIN_TOKEN?.trim()) {
    console.warn(
      `[auth] ADMIN_TOKEN no definido. Usando token de desarrollo: "${DEV_ADMIN_TOKEN}"`,
    );
  }
};
