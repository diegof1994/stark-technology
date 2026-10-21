import crypto from 'node:crypto';
import { Router } from 'express';

import { asyncHandler } from '../middleware/error.js';

const router = Router();

/**
 * Integracion con Mercado Pago.
 *
 * - Si existe MERCADO_PAGO_SECRET_KEY se usa el SDK real (modo sandbox con
 *   llaves `TEST-...` o produccion con llaves `APP_USR-...`).
 * - Si no existe, la API entra en MODO SIMULACION: genera una preferencia
 *   falsa y devuelve una URL local para que el checkout se pueda completar
 *   sin credenciales (ideal para desarrollo y para la demo del MVP).
 */

/** Cliente de Mercado Pago (se inicializa de forma perezosa). */
let mpClient = null;

/** Indica si estamos working sin credenciales (modo simulacion). */
export const isSandbox = () => !process.env.MERCADO_PAGO_SECRET_KEY?.trim();

/** Construye los items de la preferencia a partir del carrito del frontend. */
const buildItems = (items = []) =>
  items.map((item) => ({
    id: String(item.id ?? item.sku ?? 'STARK-ITEM').slice(0, 60),
    title: String(item.name ?? 'Producto Stark Technology').slice(0, 120),
    description: String(item.description ?? item.category ?? '').slice(0, 250),
    quantity: Math.max(1, Math.trunc(Number(item.quantity ?? item.qty ?? 1))),
    currency_id: 'ARS',
    unit_price: Math.max(0, Number(item.price ?? 0)),
    picture_url: item.image || undefined,
  }));

/** Normaliza el telefono al formato que espera Mercado Pago. */
const normalizePhone = (phone) => {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return undefined;
  return { area_code: digits.slice(0, 2) || '11', number: digits.slice(2) || digits };
};

/**
 * POST /api/create-preference
 * Body: { items: [{ id, name, price, quantity, image }], payer?: { name, surname, email, phone } }
 * Respuesta: { ok, preferenceId, initPoint, sandbox, total, items }
 */
router.post(
  '/create-preference',
  asyncHandler(async (req, res) => {
    const { items = [], payer = {} } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'El carrito esta vacio. Agrega al menos un producto.',
      });
    }

    const mpItems = buildItems(items);
    const total = mpItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0,
    );

    const publicUrl = (process.env.PUBLIC_URL || process.env.CLIENT_URL || '').replace(
      /\/$/,
      '',
    );

    // URL del propio servidor (para el webhook de notificaciones).
    const apiBase = `${req.protocol}://${req.get('host')}`;

    const backUrls = {
      success: `${publicUrl}/?status=approved&order=${crypto.randomUUID()}`,
      pending: `${publicUrl}/?status=pending`,
      failure: `${publicUrl}/?status=rejected`,
    };

    // ---------------------------------------------------------
    // MODO SIMULACION (sin credenciales)
    // ---------------------------------------------------------
    if (isSandbox()) {
      const preferenceId = `SIM-${crypto.randomUUID().slice(0, 20).toUpperCase()}`;
      console.log(
        `[mercadopago][simulacion] Preferencia ${preferenceId} por ARS ${total.toFixed(2)}`,
      );

      return res.json({
        ok: true,
        sandbox: true,
        preferenceId,
        initPoint: `${publicUrl}/checkout/simulado?preference_id=${preferenceId}&total=${total.toFixed(2)}`,
        total: Number(total.toFixed(2)),
        items: mpItems,
        backUrls,
        message:
          'Preferencia de pago simulada (sandbox local). Configura MERCADO_PAGO_SECRET_KEY para usar la pasarela real.',
      });
    }

    // ---------------------------------------------------------
    // MODO REAL (SDK de Mercado Pago)
    // ---------------------------------------------------------
    try {
      const { MercadoPagoConfig, Preference } = await import('mercadopago');

      if (!mpClient) {
        mpClient = new MercadoPagoConfig({
          accessToken: process.env.MERCADO_PAGO_SECRET_KEY.trim(),
        });
        console.log('[mercadopago] Cliente inicializado con credenciales reales.');
      }

      const preferenceClient = new Preference(mpClient);

      const preference = await preferenceClient.create({
        body: {
          items: mpItems,
          payer: {
            name: payer.name || 'Cliente Stark Technology',
            surname: payer.surname || '',
            email: payer.email || 'comprador@starktechnology.com',
            phone: normalizePhone(payer.phone),
          },
          back_urls: backUrls,
          auto_return: 'approved',
          statement_descriptor: 'STARK TECHNOLOGY',
          external_reference: `STARK-${Date.now()}`,
          notification_url: `${apiBase}/api/webhook/mercadopago`,
          metadata: { source: 'stark-technology-web' },
        },
      });

      const initPoint =
        preference.init_point || preference.sandbox_init_point || preference.initPoint;

      console.log(
        `[mercadopago] Preferencia ${preference.id} creada por ARS ${total.toFixed(2)}`,
      );

      return res.json({
        ok: true,
        sandbox: String(preference.id).startsWith('TEST-'),
        preferenceId: preference.id,
        initPoint,
        total: Number(total.toFixed(2)),
        items: mpItems,
        backUrls,
      });
    } catch (error) {
      console.error('[mercadopago] Error creando la preferencia:', error?.message);
      return res.status(502).json({
        ok: false,
        error: 'PAYMENT_PROVIDER_ERROR',
        message:
          'No se pudo crear la preferencia de pago en Mercado Pago. Verifica tus credenciales.',
        detail:
          process.env.NODE_ENV === 'development' ? error?.message : undefined,
      });
    }
  }),
);

/**
 * POST /api/webhook/mercadopago
 * Notificacion asincrona de Mercado Pago (aprobado / rechazado / devuelto).
 */
router.post(
  '/webhook/mercadopago',
  asyncHandler(async (req, res) => {
    const { query, body } = req;
    const data = { ...query, ...body };
    const status = data.status ?? data.action;
    const externalRef = data.external_reference;

    console.log(`[mercadopago][webhook] status=${status} ref=${externalRef}`);

    // Punto de extension: marcar el pedido como pagado en la base de datos.
    return res.json({
      ok: true,
      received: true,
      status,
      external_reference: externalRef,
    });
  }),
);

/**
 * GET /api/payments/config
 * Expone al frontend las llaves publicas y el modo de operacion.
 */
router.get(
  '/config',
  asyncHandler((req, res) => {
    const sandbox = isSandbox();
    res.json({
      ok: true,
      sandbox,
      publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY?.trim() || null,
      currency: 'ARS',
      message: sandbox
        ? 'Modo simulacion: no se realizaran cargos reales.'
        : 'Pasarela real de Mercado Pago activa.',
    });
  }),
);

export default router;
