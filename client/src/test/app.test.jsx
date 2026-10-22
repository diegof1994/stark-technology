import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';
import { CartProvider } from '../context/CartContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';

/**
 * Suite de smoke tests del frontend.
 * Mockea la API para validar el renderizado y los flujos principales.
 */

const PRODUCTS = [
  {
    id: 'cam-ip-4k-bullet',
    sku: 'STK-CAM-1001',
    name: 'Camara IP 4K IP67 Vision Nocturna 80m',
    category: 'camaras-seguridad',
    categoryLabel: 'Camaras de Seguridad IP / CCTV',
    brand: 'StarkView',
    price: 89990,
    compareAtPrice: 129900,
    stock: 64,
    rating: 4.8,
    reviews: 214,
    featured: true,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
    description: 'Camara IP 4K con sensor Sony STARVIS e iluminacion infrarroja de 80 metros.',
    features: ['Resolucion 4K', 'IP67', 'PoE'],
    gallery: [],
  },
  {
    id: 'nas-4-bahias',
    sku: 'STK-STO-5001',
    name: 'Servidor NAS 4 Bahias Intel Celeron J4125',
    category: 'almacenamiento-nas',
    categoryLabel: 'Almacenamiento y NAS',
    brand: 'StarkStore',
    price: 549000,
    compareAtPrice: null,
    stock: 14,
    rating: 4.8,
    reviews: 132,
    featured: true,
    image: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400',
    description: 'NAS de 4 bahias con CPU Intel Celeron J4125 y RAID 0/1/5/6/10.',
    features: ['4 bahias SATA 3', 'ZFS'],
    gallery: [],
  },
];

const CATEGORIES = [
  { id: 'camaras-seguridad', label: 'Camaras de Seguridad IP / CCTV', shortLabel: 'Camaras IP / CCTV', count: 6, cover: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400' },
  { id: 'almacenamiento-nas', label: 'Almacenamiento y NAS', shortLabel: 'NAS y Storage', count: 6, cover: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400' },
];

/** Mock global de fetch para simular la API REST. */
const mockFetch = () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options = {}) => {
      const href = String(url);
      const method = (options.method ?? 'GET').toUpperCase();

      // --- Mutaciones del ABM ---
      if (href.includes('/api/products') && method === 'POST') {
        const body = JSON.parse(options.body || '{}');
        return jsonResponse({
          ok: true,
          message: 'Producto creado.',
          product: {
            ...body,
            id: 'nuevo-producto-qa',
            sku: 'STK-QA-0001',
            categoryLabel: CATEGORIES[0].label,
            createdAt: new Date().toISOString(),
          },
        });
      }
      if (href.includes('/api/products/') && method === 'PUT') {
        const body = JSON.parse(options.body || '{}');
        return jsonResponse({ ok: true, product: { ...PRODUCTS[0], ...body } });
      }
      if (href.includes('/api/products/') && method === 'DELETE') {
        return jsonResponse({ ok: true, product: PRODUCTS[0] });
      }

      // --- Lecturas ---
      if (href.includes('/api/categories')) {
        return jsonResponse({ ok: true, categories: CATEGORIES });
      }
      if (href.includes('/api/products/stats')) {
        return jsonResponse({ ok: true, stats: { total: 60 } });
      }
      if (href.includes('/api/products/')) {
        const id = href.split('/api/products/')[1].split('?')[0];
        const product = PRODUCTS.find((p) => p.id === id);
        return product
          ? jsonResponse({ ok: true, product })
          : jsonResponse({ ok: false, message: 'No encontrado' }, 404);
      }
      if (href.includes('/api/products')) {
        return jsonResponse({
          ok: true,
          total: PRODUCTS.length,
          count: PRODUCTS.length,
          products: PRODUCTS,
        });
      }
      if (href.includes('/api/payments/config')) {
        return jsonResponse({ ok: true, sandbox: true, publicKey: null });
      }
      if (href.includes('/api/create-preference')) {
        return jsonResponse({
          ok: true,
          sandbox: true,
          preferenceId: 'SIM-TEST',
          initPoint:
            'http://localhost:5173/checkout/simulado?preference_id=SIM-TEST&total=89990',
          total: 89990,
        });
      }
      return jsonResponse({ ok: true }, 200);
    }),
  );
};

/** Construye una Response JSON simulada. */
const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
  json: async () => body,
});

/** Monta la aplicacion completa con sus providers. */
const renderApp = (route = '/') => {
  window.history.pushState({}, '', route);
  return render(
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>,
  );
};

describe('Stark Technology - Frontend', () => {
  beforeEach(() => {
    mockFetch();
    window.history.pushState({}, '', '/');
  });

  it('renderiza la landing con el hero y el navbar', async () => {
    renderApp('/');

    expect(
      await screen.findByText(/Tecnologia que/i, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/STARK/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /abrir carrito/i })).toBeInTheDocument();
  });

  it('muestra los rubros del catalogo en la home', async () => {
    renderApp('/');

    await waitFor(
      () => {
        expect(
          screen.getAllByText(/Camaras de Seguridad IP \/ CCTV/i).length,
        ).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });

  it('navega al catalogo y lista los productos', async () => {
    const user = userEvent.setup();
    renderApp('/catalogo');

    expect(
      await screen.findByText('Camara IP 4K IP67 Vision Nocturna 80m', {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Servidor NAS 4 Bahias Intel Celeron J4125')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /todos los productos/i }),
    ).toBeInTheDocument();

    // El buscador esta presente.
    expect(screen.getByRole('searchbox', { name: /buscar productos/i })).toBeInTheDocument();
  });

  it('filtra por categoria usando los chips de rubros', async () => {
    const user = userEvent.setup();
    renderApp('/catalogo');

    await screen.findByText('Camara IP 4K IP67 Vision Nocturna 80m', {}, { timeout: 5000 });

    const chip = screen.getByRole('button', { name: /Almacenamiento y NAS/i });
    await user.click(chip);

    await waitFor(() => {
      expect(window.location.search).toContain('category=almacenamiento-nas');
    });
  });

  it('agrega un producto al carrito y persiste en localStorage', async () => {
    const user = userEvent.setup();
    renderApp('/catalogo');

    await screen.findByText('Camara IP 4K IP67 Vision Nocturna 80m', {}, { timeout: 5000 });

    const addButtons = screen.getAllByRole('button', { name: /^agregar .* al carrito$/i });
    await user.click(addButtons[0]);

    // El badge del carrito muestra la cantidad.
    await waitFor(() => {
      const badge = screen.getByRole('button', { name: /abrir carrito \(1 productos\)/i });
      expect(badge).toBeInTheDocument();
    });

    // El item se persiste en localStorage.
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('stark_cart_v1') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('cam-ip-4k-bullet');
    });
  });

  it('abre el drawer del carrito y muestra el total', async () => {
    const user = userEvent.setup();
    renderApp('/catalogo');

    await screen.findByText('Camara IP 4K IP67 Vision Nocturna 80m', {}, { timeout: 5000 });
    await user.click(screen.getAllByRole('button', { name: /^agregar .* al carrito$/i })[0]);

    const drawer = await screen.findByRole('dialog', { name: /carrito de compras/i });
    expect(within(drawer).getByText(/1 item en el carrito/i)).toBeInTheDocument();
    expect(within(drawer).getByText(/finalizar compra/i)).toBeInTheDocument();
  });

  it('abre la ficha de producto con precio y stock', async () => {
    renderApp('/producto/cam-ip-4k-bullet');

    expect(
      await screen.findByRole('heading', { name: /Camara IP 4K IP67 Vision Nocturna 80m/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/89\.990/)).toBeInTheDocument();
    expect(screen.getByText(/64 unidades disponibles/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument();
  });

  it('muestra el panel de administracion protegido por token', async () => {
    renderApp('/admin');

    expect(
      await screen.findByRole('heading', { name: /panel de administracion/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/token de administrador/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder al panel/i })).toBeInTheDocument();
  });

  it('permite crear un producto desde el panel admin (ABM)', async () => {
    const user = userEvent.setup();
    renderApp('/admin');

    const tokenInput = await screen.findByLabelText(/token de administrador/i, {}, { timeout: 5000 });
    await user.type(tokenInput, 'stark-dev-admin');
    await user.click(screen.getByRole('button', { name: /acceder al panel/i }));

    // Tabla del inventario.
    expect(await screen.findByText(/Gestion de inventario/i)).toBeInTheDocument();

    // Abrir el modal de alta.
    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));
    const dialog = await screen.findByRole('dialog', { name: /nuevo producto/i });

    await user.type(within(dialog).getByLabelText(/nombre del producto/i), 'Camara QA');
    await user.type(within(dialog).getByLabelText(/precio \(ARS\)/i), '1234');
    await user.type(within(dialog).getByLabelText(/stock/i), '7');

    await user.click(within(dialog).getByRole('button', { name: /crear producto/i }));

    // El POST se realizo contra la API.
    await waitFor(() => {
      const calls = globalThis.fetch.mock.calls.filter(([url]) =>
        String(url).includes('/api/products'),
      );
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  it('muestra el checkout simulado de Mercado Pago', async () => {
    renderApp('/checkout/simulado?preference_id=SIM-TEST&total=89990');

    expect(
      await screen.findByRole('heading', { name: /Mercado Pago/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Modo sandbox/i)).toBeInTheDocument();
    // El total aparece en el resumen y en el boton de pago.
    expect(screen.getAllByText(/89\.990/).length).toBeGreaterThan(0);
  });
});
