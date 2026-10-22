import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import Home from '../pages/Home.jsx';
import ProductCard from '../components/ProductCard.jsx';
import FlashPrice from '../components/FlashPrice.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import { CartProvider, useCart } from '../context/CartContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import {
  countdownParts,
  flashPricing,
  isFlashProduct,
  nextDeadline,
  originalPriceFrom,
  urgencyMessage,
} from '../utils/flash.js';

/**
 * Tests de la funcionalidad "Ofertas Flash".
 *
 * Cubren la derivacion del precio original (el tachado) y el renderizado
 * del sticker, el precio destacado y el bloque de urgencia en la tarjeta.
 */

/** Producto en oferta flash al 70% (89,90 final -> 299,67 original). */
const FLASH_PRODUCT = {
  id: 'cam-ip-4k-bullet',
  sku: 'STK-CAM-1001',
  name: 'Camara IP 4K Vision Nocturna',
  category: 'camaras-seguridad',
  categoryLabel: 'Camaras de Seguridad IP',
  brand: 'StarkView',
  price: 89.9,
  compareAtPrice: 299.67,
  stock: 64,
  rating: 4.8,
  reviews: 214,
  featured: true,
  flashSale: true,
  flashDiscount: 70,
  description: 'Camara IP 4K con sensor Sony STARVIS y vision nocturna.',
  image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
};

/** Producto normal, sin oferta. */
const NORMAL_PRODUCT = {
  ...FLASH_PRODUCT,
  id: 'router-wifi6e',
  name: 'Router WiFi 6E Tri Band',
  price: 249,
  compareAtPrice: 299,
  flashSale: false,
  flashDiscount: 0,
};

/** Monta un componente con los providers que necesita la tienda. */
const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <ToastProvider>
          <CartProvider>{ui}</CartProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );

/**
 * Verifica el tachado DIAGONAL de un precio original:
 * contenedor relativo + linea roja rotada que lo cruza.
 */
const expectDiagonalStrike = (element) => {
  expect(element).toHaveClass('relative', 'inline-block');
  const line = element.querySelector('[data-testid="strike-line"]');
  expect(line).toBeInTheDocument();
  expect(line).toHaveClass('bg-red-500', 'h-[2px]', 'w-full', 'rotate-[-12deg]');
};

describe('utils/flash - derivacion del precio original', () => {
  it('deriva el precio original a partir del descuento (ej: 100 -> 333,33)', () => {
    expect(originalPriceFrom(100, 70)).toBe(333.33);
  });

  it('deriva el precio original con el descuento por defecto (70%)', () => {
    expect(originalPriceFrom(89.9, 70)).toBe(299.67);
    expect(originalPriceFrom(89.9)).toBe(299.67);
  });

  it('devuelve null cuando el descuento no aplica', () => {
    expect(originalPriceFrom(100, 0)).toBeNull();
    expect(originalPriceFrom(0, 70)).toBeNull();
    expect(originalPriceFrom(100, 100)).toBeNull();
  });

  it('detecta los productos en oferta flash', () => {
    expect(isFlashProduct(FLASH_PRODUCT)).toBe(true);
    expect(isFlashProduct(NORMAL_PRODUCT)).toBe(false);
    expect(isFlashProduct(null)).toBe(false);
  });

  it('resuelve precio final, original, descuento y ahorro', () => {
    const pricing = flashPricing(FLASH_PRODUCT);
    expect(pricing).not.toBeNull();
    expect(pricing.final).toBe(89.9);
    expect(pricing.original).toBe(299.67);
    expect(pricing.discount).toBe(70);
    expect(pricing.savings).toBe(209.77);
  });

  it('devuelve null para productos que no son oferta flash', () => {
    expect(flashPricing(NORMAL_PRODUCT)).toBeNull();
  });

  it('deriva el original si el servidor no lo envio', () => {
    const pricing = flashPricing({ ...FLASH_PRODUCT, compareAtPrice: null });
    expect(pricing.original).toBe(299.67);
  });
});

describe('utils/flash - urgencia y cuenta regresiva', () => {
  it('devuelve un copy de urgencia estable para el mismo producto', () => {
    const first = urgencyMessage(FLASH_PRODUCT.id);
    expect(urgencyMessage(FLASH_PRODUCT.id)).toBe(first);
    expect(first).toMatch(/descuento|24h|unidades|relampago|durar/i);
  });

  it('descompone el tiempo restante en h:m:s', () => {
    expect(countdownParts(0)).toEqual({ hours: '00', minutes: '00', seconds: '00' });
    expect(countdownParts(3661000)).toEqual({
      hours: '01',
      minutes: '01',
      seconds: '01',
    });
    expect(countdownParts(-500)).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
    });
  });

  it('vence a la medianoche del dia siguiente', () => {
    const deadline = nextDeadline(Date.parse('2024-05-10T15:30:00'));
    const date = new Date(deadline);
    expect(date.getHours()).toBe(0);
    expect(date.getDate()).toBe(11);
  });
});

describe('ProductCard - tratamiento de Oferta Flash', () => {
  it('muestra el sticker con el descuento aplicado', () => {
    renderWithProviders(<ProductCard product={FLASH_PRODUCT} />);
    expect(screen.getByText(/70% OFF/)).toBeInTheDocument();
  });

  it('muestra el precio original tachado en diagonal y el final destacado', () => {
    renderWithProviders(<ProductCard product={FLASH_PRODUCT} />);

    const original = screen.getByTestId('flash-original-price');
    expect(original).toHaveTextContent('299,67');
    // Tachado diagonal (no horizontal) sobre un gris suave.
    expect(original).toHaveClass('text-slate-400', 'font-semibold', 'text-sm');
    expect(original).not.toHaveClass('line-through');
    expectDiagonalStrike(original);

    const final = screen.getByTestId('flash-final-price');
    expect(final).toHaveTextContent('89,90');
    expect(final).toHaveClass('text-savings-400');
  });

  it('muestra el ahorro en pesos', () => {
    renderWithProviders(<ProductCard product={FLASH_PRODUCT} />);
    expect(screen.getByTestId('flash-savings')).toHaveTextContent('209,77');
  });

  it('muestra el bloque de urgencia comercial', () => {
    renderWithProviders(<ProductCard product={FLASH_PRODUCT} />);
    expect(screen.getByTestId('flash-urgency')).toBeInTheDocument();
  });

  it('no muestra el sticker ni el tachado en productos normales', () => {
    renderWithProviders(<ProductCard product={NORMAL_PRODUCT} />);
    expect(screen.queryByText(/70% OFF/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('flash-original-price')).not.toBeInTheDocument();
    expect(screen.queryByTestId('flash-urgency')).not.toBeInTheDocument();
  });
});

describe('FlashPrice - variantes de tamaño', () => {
  it('degrada al precio simple cuando el producto no es oferta flash', () => {
    render(<FlashPrice product={NORMAL_PRODUCT} />);
    expect(screen.queryByTestId('flash-final-price')).not.toBeInTheDocument();
    expect(screen.getByText(/249/)).toBeInTheDocument();
  });

  it('muestra el detalle con precio original tachado', () => {
    render(<FlashPrice product={FLASH_PRODUCT} size="detail" />);
    expect(screen.getByTestId('flash-final-price')).toHaveTextContent('89,90');
    expect(screen.getByTestId('flash-original-price')).toHaveTextContent('299,67');
  });
});

describe('CartDrawer - ahorro en el carrito', () => {
  /** Harness que agrega un producto al carrito y abre el drawer. */
  const CartHarness = () => {
    const { addItem, openCart } = useCart();
    useEffect(() => {
      addItem(FLASH_PRODUCT, 1);
      openCart();
    }, []);
    return null;
  };

  it('muestra el precio original tachado y el sticker de descuento', async () => {
    renderWithProviders(
      <>
        <CartHarness />
        <CartDrawer />
      </>,
    );

    await waitFor(() => expect(screen.getByText(/1 item en el carrito/)).toBeInTheDocument());
    // El precio final en esmeralda y el original con tachado diagonal.
    expect(screen.getAllByText(/89,90/).length).toBeGreaterThan(0);
    expectDiagonalStrike(screen.getAllByText(/299,67/)[0]);
    expect(screen.getByText(/70% OFF/)).toBeInTheDocument();
  });
});

describe('Home - seccion Ofertas Flash', () => {
  /** Mock de la API que devuelve el catalogo y las ofertas flash. */
  const mockApi = () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        const href = String(url);
        const json = (payload) =>
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });

        if (href.includes('/api/categories')) {
          return json({ ok: true, categories: [] });
        }
        if (href.includes('/api/products/flash')) {
          return json({ ok: true, total: 1, count: 1, products: [FLASH_PRODUCT] });
        }
        if (href.includes('/api/products')) {
          return json({ ok: true, total: 1, count: 1, products: [FLASH_PRODUCT] });
        }
        return json({ ok: true });
      }),
    );
  };

  it('renderiza el bloque de ofertas con el 70% OFF', async () => {
    mockApi();
    renderWithProviders(<Home />);

    await waitFor(() =>
      expect(screen.getAllByText(/70% OFF/).length).toBeGreaterThan(0),
    );
    expect(screen.getByText(/Oferta Relampago/i)).toBeInTheDocument();
    // El mismo copy puede repetirse en la cinta y en la tarjeta del producto.
    expect(screen.getAllByText(/Solo por hoy - 24h corriendo/i).length).toBeGreaterThan(0);
  });

  it('muestra la cuenta regresiva de la promocion', async () => {
    mockApi();
    renderWithProviders(<Home />);

    await waitFor(() =>
      expect(screen.getAllByTestId('flash-countdown').length).toBeGreaterThan(0),
    );
    expect(screen.getAllByTestId('flash-countdown')[0]).toHaveTextContent(/\d{2}:\d{2}:\d{2}/);
  });

  it('enlaza a la vista de catalogo filtrada por ofertas', async () => {
    mockApi();
    renderWithProviders(<Home />);

    await waitFor(() =>
      expect(screen.getAllByText(/70% OFF/).length).toBeGreaterThan(0),
    );
    const link = screen.getByRole('link', { name: /ver todas las ofertas/i });
    expect(link).toHaveAttribute('href', '/catalogo?flash=true');
  });
});
