import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

/**
 * CartContext - Estado global del carrito de compras.
 *
 * - Context API + useReducer para transiciones puras.
 * - Persistencia en localStorage bajo la clave `stark_cart`.
 * - Sincronizacion entre pestanas mediante el evento `storage`.
 */

const CartContext = createContext(null);

const STORAGE_KEY = 'stark_cart_v1';

/** Estado inicial: recupera el carrito guardado en localStorage. */
const loadInitialState = () => {
  const empty = { items: [], isOpen: false };
  if (typeof window === 'undefined') return empty;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return empty;
    return {
      items: parsed
        .filter((item) => item && item.id)
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          image: item.image ?? '',
          category: item.category ?? '',
          categoryLabel: item.categoryLabel ?? '',
          quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
          stock: Number(item.stock) || 0,
          // Datos de oferta flash (para mostrar el ahorro en el carrito).
          compareAtPrice:
            item.compareAtPrice === null || item.compareAtPrice === undefined
              ? null
              : Number(item.compareAtPrice) || null,
          flashSale: Boolean(item.flashSale),
          flashDiscount: Number(item.flashDiscount) || 0,
        })),
      isOpen: false,
    };
  } catch {
    return empty;
  }
};

/** Reducer con todas las acciones del carrito. */
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, quantity = 1 } = action;
      const existing = state.items.find((item) => item.id === product.id);
      const maxStock = Number(product.stock) || 0;

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + quantity,
                    maxStock || 99,
                    99,
                  ),
                }
              : item,
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image ?? '',
            category: product.category ?? '',
            categoryLabel: product.categoryLabel ?? '',
            quantity: Math.max(1, Math.min(quantity, maxStock || 99, 99)),
            stock: maxStock,
            // Datos de oferta flash (para mostrar el ahorro en el carrito).
            compareAtPrice:
              product.compareAtPrice === null || product.compareAtPrice === undefined
                ? null
                : Number(product.compareAtPrice) || null,
            flashSale: Boolean(product.flashSale),
            flashDiscount: Number(product.flashDiscount) || 0,
          },
        ],
      };
    }

    case 'REMOVE':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };

    case 'SET_QUANTITY': {
      const quantity = Math.max(
        1,
        Math.min(action.quantity, action.stock || 99, 99),
      );
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity } : item,
        ),
      };
    }

    case 'INCREMENT':
      return cartReducer(state, {
        type: 'SET_QUANTITY',
        id: action.id,
        quantity: action.item.quantity + 1,
        stock: action.item.stock,
      });

    case 'DECREMENT':
      return cartReducer(state, {
        type: 'SET_QUANTITY',
        id: action.id,
        quantity: action.item.quantity - 1,
        stock: action.item.stock,
      });

    case 'CLEAR':
      return { ...state, items: [] };

    /** Sincroniza los items desde otra pestana del navegador. */
    case 'SYNC':
      return { ...state, items: action.items ?? [] };

    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN':
      return { ...state, isOpen: true };

    case 'CLOSE':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  // Persiste los items (no el estado del drawer) en localStorage.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* almacenamiento no disponible (modo privado) */
    }
  }, [state.items]);

  // Sincroniza entre pestanas abiertas.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        dispatch({ type: 'SYNC', items: loadInitialState().items });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => {
    const items = state.items;
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 0 && subtotal < 50000 ? 7500 : 0;
    const total = subtotal + shipping;

    return {
      items,
      count,
      subtotal,
      shipping,
      total,
      isOpen: state.isOpen,
      addItem: (product, quantity = 1) => dispatch({ type: 'ADD', product, quantity }),
      removeItem: (id) => dispatch({ type: 'REMOVE', id }),
      setQuantity: (id, quantity, stock) =>
        dispatch({ type: 'SET_QUANTITY', id, quantity, stock }),
      increment: (item) => dispatch({ type: 'INCREMENT', id: item.id, item }),
      decrement: (item) => dispatch({ type: 'DECREMENT', id: item.id, item }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      openCart: () => dispatch({ type: 'OPEN' }),
      closeCart: () => dispatch({ type: 'CLOSE' }),
      toggleCart: () => dispatch({ type: 'TOGGLE' }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook de acceso al contexto del carrito. */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return context;
}

export default CartContext;
