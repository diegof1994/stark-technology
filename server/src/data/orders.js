import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Pedidos de la tienda (compras como invitado).
 *
 * Se guardan en `server/data/orders.json`. En hostings con disco efimero
 * (plan free de Render) el archivo se pierde al reiniciar: para produccion
 * conviene pasar esto a una base de datos (ej. Supabase/Postgres).
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

export const ORDER_STATUSES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

let orders = [];
try {
  orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!Array.isArray(orders)) orders = [];
} catch {
  orders = [];
}

const persist = () => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(orders, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_FILE);
  } catch (error) {
    console.warn('[orders] No se pudo guardar en disco:', error.message);
  }
};

/** Numero de pedido corto y legible: ST-000123. */
const nextNumber = () => {
  const last = orders.reduce((max, order) => Math.max(max, order.number ?? 0), 0);
  return last + 1;
};

export const createOrder = ({ buyer, shipping, items, subtotal, shippingCost, total }) => {
  const number = nextNumber();
  const order = {
    id: crypto.randomUUID(),
    number,
    code: `ST-${String(number).padStart(6, '0')}`,
    createdAt: new Date().toISOString(),
    status: 'pendiente',
    buyer,
    shipping,
    items,
    subtotal,
    shippingCost,
    total,
    preferenceId: null,
  };
  orders.unshift(order);
  persist();
  return order;
};

export const updateOrder = (id, changes) => {
  const order = orders.find((item) => item.id === id || item.code === id);
  if (!order) return null;
  Object.assign(order, changes, { updatedAt: new Date().toISOString() });
  persist();
  return order;
};

export const getOrder = (id) => orders.find((item) => item.id === id || item.code === id) ?? null;

export const listOrders = () => orders;
