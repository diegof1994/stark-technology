import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';

import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ProductDetail from './pages/ProductDetail.jsx';

// Paginas que el cliente casi no visita: se cargan solo cuando se abren.
const Admin = lazy(() => import('./pages/Admin.jsx'));
const SimulatedCheckout = lazy(() => import('./pages/SimulatedCheckout.jsx'));

/**
 * App - Shell principal de Stark Technology.
 * Layout con navbar, contenido con transiciones de ruta, drawer del carrito
 * y modal de checkout.
 */
export default function App() {
  const location = useLocation();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // El checkout simulado se muestra a pantalla completa (sin layout).
  const isStandalone = location.pathname.startsWith('/checkout/simulado');

  // Cada vez que se cambia de pagina, se arranca desde arriba.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, location.search]);

  if (isStandalone) {
    return (
      <Suspense fallback={null}>
        <Routes>
          <Route path="/checkout/simulado" element={<SimulatedCheckout />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />

      {/* --- Contenido principal --- */}
      <main className="relative z-10 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <Suspense fallback={<div className="min-h-[60vh]" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* --- Drawer del carrito --- */}
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />

      {/* --- Modal de checkout --- */}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
