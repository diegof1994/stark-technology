import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import paymentsRoutes from './routes/payments.routes.js';
import productsRoutes from './routes/products.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { warnAboutAdminToken } from './middleware/auth.js';

/**
 * Construye la aplicacion Express de Stark Technology.
 * Se exporta como factory para poder testearla sin levantar el puerto.
 */
export const createApp = () => {
  const app = express();

  // -------------------------------------------------------------
  // Middlewares base
  // -------------------------------------------------------------
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS: se permiten los origenes definidos en CLIENT_URL (lista separada por coma).
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Peticiones sin Origin (curl, health checks de Render) se permiten.
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // En desarrollo se permite cualquier origen para agilizar.
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        return callback(new Error('Origen no permitido por CORS: ' + origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-admin-token', 'Authorization'],
    }),
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // -------------------------------------------------------------
  // Rutas
  // -------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      status: 'online',
      service: 'stark-technology-api',
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/', (req, res) => {
    res.json({
      ok: true,
      name: 'Stark Technology API',
      version: '1.0.0',
      docs: '/api/products',
    });
  });

  app.use('/api/products', productsRoutes);
  app.use('/api/categories', categoriesRoutes);
  // El router de pagos se monta en /api (para /api/create-preference, requerido
  // por la especificacion) y en /api/payments (para /api/payments/config).
  app.use('/api', paymentsRoutes);
  app.use('/api/payments', paymentsRoutes);

  // 404 y manejador de errores.
  app.use(notFound);
  app.use(errorHandler);

  warnAboutAdminToken();

  return app;
};

export default createApp;
