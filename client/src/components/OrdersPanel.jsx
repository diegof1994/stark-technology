import { useEffect, useState } from 'react';

import { getOrders, updateOrderStatus } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import { IconRefresh } from './Icons.jsx';

const STATUS_STYLES = {
  pendiente: 'bg-warning/10 text-warning',
  pagado: 'bg-success/10 text-success',
  enviado: 'bg-info/10 text-info',
  entregado: 'bg-surface-3 text-body',
  cancelado: 'bg-danger/10 text-danger',
};

const STATUS_LABELS = {
  pendiente: 'Pendiente de pago',
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/** Telefono argentino -> formato internacional para wa.me (549 + area + numero). */
const whatsappNumber = (phone = '') => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('54')) return digits;
  return `549${digits.replace(/^0/, '')}`;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * OrdersPanel - Pedidos recibidos, con los datos del comprador y del envio.
 * Permite cambiar el estado (pagado, enviado, entregado...).
 */
export default function OrdersPanel() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState(Object.keys(STATUS_LABELS));
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = () => {
    setLoading(true);
    getOrders()
      .then((data) => {
        setOrders(data.orders ?? []);
        if (data.statuses?.length) setStatuses(data.statuses);
      })
      .catch(() => toast.error('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (order, status) => {
    try {
      const { order: updated } = await updateOrderStatus(order.id, status);
      setOrders((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(`Pedido ${order.code}: ${STATUS_LABELS[status]}`);
    } catch {
      toast.error('No se pudo actualizar el pedido');
    }
  };

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {loading ? 'Cargando...' : `${orders.length} pedido${orders.length === 1 ? '' : 's'}`}
        </p>
        <button type="button" onClick={load} className="btn-ghost !px-3.5 !py-2">
          <IconRefresh className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>

      {!loading && orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-1 px-6 py-12 text-center">
          <p className="font-medium text-strong">Todavia no hay pedidos</p>
          <p className="mt-1 text-sm text-muted">
            Cuando alguien compre, vas a ver aca sus datos y lo que compro.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {orders.map((order) => {
          const open = openId === order.id;
          const { buyer, shipping } = order;
          return (
            <li key={order.id} className="overflow-hidden rounded-xl border border-line bg-surface-1">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : order.id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-surface-2/60"
              >
                <span className="font-semibold text-strong">{order.code}</span>
                <span className="text-sm text-body">
                  {buyer.name} {buyer.surname}
                </span>
                <span className="text-xs text-muted">{formatDate(order.createdAt)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <span className="ml-auto font-semibold text-strong tabular">{formatPrice(order.total)}</span>
              </button>

              {open && (
                <div className="grid gap-5 border-t border-line px-4 py-4 text-sm md:grid-cols-3">
                  <div>
                    <p className="mb-1.5 font-semibold text-strong">Comprador</p>
                    <p>{buyer.name} {buyer.surname}</p>
                    <p>DNI {buyer.dni}</p>
                    <p>
                      <a className="text-accent hover:underline" href={`mailto:${buyer.email}`}>{buyer.email}</a>
                    </p>
                    <p>
                      <a
                        className="text-accent hover:underline"
                        href={`https://wa.me/${whatsappNumber(buyer.phone)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {buyer.phone} (WhatsApp)
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="mb-1.5 font-semibold text-strong">Entrega</p>
                    {shipping.method === 'retiro' ? (
                      <p>Retiro en persona</p>
                    ) : (
                      <>
                        <p>
                          {shipping.street} {shipping.number}
                          {shipping.apartment ? `, ${shipping.apartment}` : ''}
                        </p>
                        <p>
                          {shipping.city}, {shipping.province} ({shipping.zip})
                        </p>
                        {shipping.notes && <p className="text-muted">{shipping.notes}</p>}
                      </>
                    )}
                  </div>
                  <div>
                    <p className="mb-1.5 font-semibold text-strong">Productos</p>
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3">
                          <span className="min-w-0 truncate">
                            {item.quantity} x {item.name}
                          </span>
                          <span className="shrink-0 tabular">{formatPrice(item.price * item.quantity)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between text-muted">
                        <span>Envio</span>
                        <span>{order.shippingCost ? formatPrice(order.shippingCost) : 'Gratis'}</span>
                      </li>
                    </ul>
                    <label className="mt-4 block">
                      <span className="mb-1 block text-xs text-muted">Estado del pedido</span>
                      <select
                        value={order.status}
                        onChange={(event) => changeStatus(order, event.target.value)}
                        className="field"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status] ?? status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
