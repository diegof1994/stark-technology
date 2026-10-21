import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './index.css';

/**
 * Punto de entrada de la aplicacion Stark Technology.
 * Monta los providers en el orden correcto:
 * Toast -> Tema -> Carrito -> Router -> App
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
