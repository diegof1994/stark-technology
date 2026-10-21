/**
 * Script utilitario: reinicia el catalogo con los datos semilla.
 * Uso: npm run seed --prefix server
 */
import { resetToSeed, getStats } from '../data/store.js';

const products = resetToSeed();
console.log(`[seed] Catalogo reiniciado con ${products.length} productos.`);
console.log('[seed] Estadisticas:', getStats());
