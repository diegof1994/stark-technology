import 'dotenv/config';

import { createApp } from './app.js';

/**
 * Punto de entrada del servidor de Stark Technology.
 * Render asigna el puerto dinamicamente via la variable `PORT`.
 */
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('  ███  STARK TECHNOLOGY  ███  //  API REST');
  console.log(`  ➜  Local:    http://localhost:${PORT}/api/health`);
  console.log(`  ➜  Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ➜  CORS:    ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log('');
});

// Apagado ordenado para no cortar peticiones en curso.
const shutdown = (signal) => () => {
  console.log(`\n[server] ${signal} recibido, cerrando servidor...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
