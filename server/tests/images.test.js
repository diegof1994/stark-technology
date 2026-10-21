/**
 * Verifica que todas las URLs de imagen del catalogo respondan 200.
 * Usa concurrencia limitada y reintentos para evitar rate limits de Unsplash.
 */
import { SEED_PRODUCTS } from '../src/data/seed.js';
import { CATEGORIES } from '../src/data/categories.js';

const CONCURRENCY = 4;
const RETRIES = 3;

const urls = [
  ...new Set([
    ...SEED_PRODUCTS.map((p) => p.image),
    ...SEED_PRODUCTS.flatMap((p) => p.gallery ?? []),
    ...CATEGORIES.map((c) => c.cover),
  ]),
].filter(Boolean);

console.log(`Verificando ${urls.length} URLs de imagenes...\n`);

const checkUrl = async (url) => {
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StarkTech-Checker' },
      });
      clearTimeout(timer);
      if (response.ok) return { url, ok: true };
      if (response.status === 404) return { url, ok: false, status: 404 };
      // Otro status: reintentamos.
    } catch {
      // Error de red: reintentamos con backoff.
    }
    await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
  }
  return { url, ok: false, status: 'network-error' };
};

let ok = 0;
const failures = [];

const queue = [...urls];
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const url = queue.shift();
    const result = await checkUrl(url);
    if (result.ok) {
      ok += 1;
    } else {
      failures.push(`${result.status} ${url}`);
    }
  }
});
await Promise.all(workers);

console.log(`OK: ${ok} / ${urls.length}`);
if (failures.length) {
  console.log(`\nFALLIDAS (${failures.length}):`);
  failures.forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('\nTodas las imagenes responden correctamente.');
