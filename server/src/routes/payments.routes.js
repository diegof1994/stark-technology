import crypto from 'node:crypto';
import { Router } from 'express';

import { asyncHandler } from '../middleware/error.js';
import { requireAdmin } from '../middleware/auth.js';
import { getProduct } from '../data/store.js';
import {
  ORDER_STATUSES,
  createOrder,
  getOrder,
  listOrders,
  updateOrder,
} from '../data/orders.js';

/** Reglas de envio (deben coincidir con el carrito del frontend). */
export const FREE_SHIPPING_FROM = 150000;
export const SHIPPING_COST = 9900;

const clean = (value, max = 120) => String(value ?? '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida y normaliza los datos del comprador invitado.
 * Devuelve { buyer, shipping } o { error } con un mensaje para mostrar.
 */
const validateCheckout = (body = {}) => {
  const raw = body.buyer ?? body.payer ?? {};
  const buyer = {
    name: clean(raw.name, 60),
    surname: clean(raw.surname, 60),
    email: clean(raw.email, 120).toLowerCase(),
    phone: clean(raw.phone, 30),
    dni: clean(raw.dni, 12).replace(/\D/g, ''),
  };
  const rawShip = body.shipping ?? {};
  const method = rawShip.method === 'retiro' ? 'retiro' : 'envio';
  const shipping = {
    method,
    street: clean(rawShip.street, 80),
    number: clean(rawShip.number, 10),
    apartment: clean(rawShip.apartment, 20),
    city: clean(rawShip.city, 60),
    province: clean(rawShip.province, 40),
    zip: clean(rawShip.zip, 10),
    notes: clean(rawShip.notes, 200),
  };

  if (!buyer.name || !buyer.surname) return { error: 'Completa tu nombre y apellido.' };
  if (!EMAIL_RE.test(buyer.email)) return { error: 'Ingresa un email valido.' };
  if (buyer.phone.replace(/\D/g, '').length < 8) return { error: 'Ingresa un telefono valido.' };
  if (buyer.dni.length < 7 || buyer.dni.length > 9) return { error: 'Ingresa un DNI valido.' };
  if (method === 'envio') {
    const missing = ['street', 'number', 'city', 'province', 'zip'].filter((key) => !shipping[key]);
    if (missing.length) return { error: 'Completa la direccion de envio.' };
  }
  return { buyer, shipping };
};

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
    id: String(item.id ?? item.sku ?? 'STACK-ITEM').slice(0, 60),
    title: String(item.name ?? 'Producto Stack Technology').slice(0, 120),
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
    const { items = [] } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'El carrito esta vacio. Agrega al menos un producto.',
      });
    }

    const checkout = validateCheckout(req.body);
    if (checkout.error) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR', message: checkout.error });
    }
    const { buyer, shipping } = checkout;

    // Los precios salen siempre del catalogo, nunca del navegador.
    const resolved = [];
    for (const item of items) {
      const product = getProduct(item.id);
      if (!product) {
        return res.status(400).json({
          ok: false,
          error: 'PRODUCT_NOT_FOUND',
          message: 'Uno de los productos ya no esta disponible. Actualiza el carrito.',
        });
      }
      resolved.push({ ...product, quantity: item.quantity ?? item.qty ?? 1 });
    }

    const mpItems = buildItems(resolved);
    const subtotal = mpItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
    const shippingCost =
      shipping.method === 'retiro' || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;
    if (shippingCost > 0) {
      mpItems.push({
        id: 'ENVIO',
        title: 'Envio a domicilio',
        description: 'Costo de envio',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: shippingCost,
      });
    }

    const order = createOrder({
      buyer,
      shipping,
      items: resolved.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: Math.max(1, Math.trunc(Number(p.quantity))),
        image: p.image,
      })),
      subtotal,
      shippingCost,
      total,
    });
    const payer = { ...buyer };

    const publicUrl = (process.env.PUBLIC_URL || process.env.CLIENT_URL || '').replace(
      /\/$/,
      '',
    );

    // URL del propio servidor (para el webhook de notificaciones).
    const apiBase = `${req.protocol}://${req.get('host')}`;

    const backUrls = {
      success: `${publicUrl}/?status=approved&order=${order.code}`,
      pending: `${publicUrl}/?status=pending`,
      failure: `${publicUrl}/?status=rejected`,
    };

    // ---------------------------------------------------------
    // MODO SIMULACION (sin credenciales)
    // ---------------------------------------------------------
    if (isSandbox()) {
      const preferenceId = `SIM-${crypto.randomUUID().slice(0, 20).toUpperCase()}`;
      updateOrder(order.id, { preferenceId });
      console.log(
        `[mercadopago][simulacion] Preferencia ${preferenceId} por ARS ${total.toFixed(2)}`,
      );

      return res.json({
        ok: true,
        sandbox: true,
        preferenceId,
        initPoint: `${publicUrl}/checkout/simulado?preference_id=${preferenceId}&total=${total.toFixed(2)}&order=${order.code}`,
        orderCode: order.code,
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
            name: payer.name || 'Cliente Stack Technology',
            surname: payer.surname || '',
            email: payer.email || 'comprador@starktechnology.com',
            phone: normalizePhone(payer.phone),
            identification: { type: 'DNI', number: payer.dni },
          },
          back_urls: backUrls,
          auto_return: 'approved',
          statement_descriptor: 'STACK TECHNOLOGY',
          external_reference: order.code,
          notification_url: `${apiBase}/api/webhook/mercadopago`,
          metadata: { source: 'stark-technology-web' },
        },
      });

      updateOrder(order.id, { preferenceId: preference.id });
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
        orderCode: order.code,
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

    // Pago real: se consulta el pago en Mercado Pago y se actualiza el pedido.
    try {
      const paymentId = data['data.id'] ?? data.data?.id ?? data.id;
      if (!isSandbox() && (data.type === 'payment' || data.topic === 'payment') && paymentId) {
        const { MercadoPagoConfig, Payment } = await import('mercadopago');
        mpClient ??= new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_SECRET_KEY.trim() });
        const payment = await new Payment(mpClient).get({ id: paymentId });
        const map = { approved: 'pagado', cancelled: 'cancelado', rejected: 'pendiente' };
        if (payment?.external_reference && map[payment.status]) {
          updateOrder(payment.external_reference, { status: map[payment.status], paymentId });
        }
      }
    } catch (error) {
      console.error('[mercadopago][webhook] No se pudo actualizar el pedido:', error?.message);
    }
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

/**
 * POST /api/orders/:code/simulate
 * Solo en modo simulacion: marca el pedido como pagado o rechazado.
 */
router.post(
  '/orders/:code/simulate',
  asyncHandler((req, res) => {
    if (!isSandbox()) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const order = getOrder(req.params.code);
    if (!order) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const approved = req.body?.status === 'approved';
    if (approved) updateOrder(order.id, { status: 'pagado' });
    return res.json({ ok: true, code: order.code, status: approved ? 'pagado' : order.status });
  }),
);

/** GET /api/orders (admin) - Lista de pedidos con los datos del comprador. */
router.get(
  '/orders',
  requireAdmin,
  asyncHandler((req, res) => {
    const orders = listOrders();
    res.json({ ok: true, total: orders.length, orders, statuses: ORDER_STATUSES });
  }),
);

/** PATCH /api/orders/:id (admin) - Cambia el estado del pedido. */
router.patch(
  '/orders/:id',
  requireAdmin,
  asyncHandler((req, res) => {
    const status = req.body?.status;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR', message: 'Estado invalido.' });
    }
    const order = updateOrder(req.params.id, { status });
    if (!order) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true, order });
  }),
);

export default router;
