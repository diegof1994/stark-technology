/**
 * Prueba end-to-end de la API de Stark Technology.
 * Ejecutar con el servidor levantado en el puerto definido en BASE_URL.
 */
const BASE = process.env.BASE_URL || 'http://localhost:4111';
const TOKEN = process.env.ADMIN_TOKEN || 'stark-dev-admin';

let pass = 0;
let fail = 0;

const check = (label, condition, extra = '') => {
  if (condition) {
    pass += 1;
    console.log(`  OK   ${label}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${label} ${extra}`);
  }
};

const call = async (path, options = {}) => {
  const response = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { 'x-admin-token': options.token } : {}),
    },
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : {} };
};

console.log(`\n=== Stark Technology API - pruebas en ${BASE} ===\n`);

/* --- Health --- */
console.log('[health]');
const health = await call('/health');
check('GET /api/health responde 200', health.status === 200, health.status);
check('payload de health es correcto', health.body.ok === true);

/* --- Listado --- */
console.log('\n[listado]');
const all = await call('/products');
check('GET /api/products devuelve 200', all.status === 200);
check('el catalogo tiene 60 productos', all.body.total === 60, all.body.total);
check('cada producto trae imagen real', all.body.products.every((p) => p.image?.startsWith('http')));
check('cada producto trae precio y stock', all.body.products.every((p) => typeof p.price === 'number' && typeof p.stock === 'number'));
check('cada producto trae descripcion', all.body.products.every((p) => p.description?.length > 20));

/* --- Categorias --- */
console.log('\n[categorias]');
const cats = await call('/categories');
check('GET /api/categories devuelve 200', cats.status === 200);
check('hay 10 rubros', cats.body.categories?.length === 10, cats.body.categories?.length);
check('cada rubro tiene conteo de productos', cats.body.categories?.every((c) => c.count > 0));
check('cada rubro tiene imagen de portada', cats.body.categories?.every((c) => c.cover?.startsWith('http')));

/* --- Filtros --- */
console.log('\n[filtros]');
const byCategory = await call('/products?category=drones-monitoreo');
check('filtro por categoria funciona', byCategory.body.products?.every((p) => p.category === 'drones-monitoreo'));
check('el filtro devuelve productos', byCategory.body.total > 0, byCategory.body.total);

const bySearch = await call('/products?q=camara');
check('busqueda por texto encuentra resultados', bySearch.body.total > 0, bySearch.body.total);
check('la busqueda es insensible a acentos', bySearch.body.total > 0);

const bySearchNoAccent = await call('/products?q=camara%20termica');
check('busqueda sin acentos encuentra productos', bySearchNoAccent.body.total > 0, bySearchNoAccent.body.total);

const byPrice = await call('/products?minPrice=1000&maxPrice=2000');
check('filtro por rango de precio funciona', byPrice.body.products?.every((p) => p.price >= 1000 && p.price <= 2000));

const bySort = await call('/products?sort=price-asc');
const prices = byPrice.body.products ?? [];
const sorted = (bySort.body.products ?? []).every((p, i, arr) => i === 0 || arr[i - 1].price <= p.price);
check('ordenamiento por precio ascendente funciona', sorted);

/* --- Ofertas Flash --- */
console.log('\n[ofertas flash]');
const flash = await call('/products/flash');
check('GET /api/products/flash devuelve 200', flash.status === 200, flash.status);
check('hay productos en oferta flash', flash.body.total > 0, flash.body.total);
check(
  'el endpoint devuelve solo productos en oferta',
  flash.body.products?.every((p) => p.flashSale === true),
);
check(
  'el descuento por defecto es del 70%',
  flash.body.products?.every((p) => p.flashDiscount === 70),
);
check(
  'el precio original se deriva del precio final (precio / 0,3)',
  flash.body.products?.every(
    (p) => Math.abs(p.compareAtPrice - Math.round((p.price / 0.3) * 100) / 100) < 0.02,
  ),
);
check(
  'el precio original es mayor que el precio final',
  flash.body.products?.every((p) => p.compareAtPrice > p.price),
);

const flashFilter = await call('/products?flash=true');
check('el filtro ?flash=true funciona', flashFilter.body.total === flash.body.total, flashFilter.body.total);
check(
  'el filtro ?flash=true excluye los productos normales',
  flashFilter.body.products?.every((p) => p.flashSale === true),
);

const noFlashFilter = await call('/products?flash=false');
check('el filtro ?flash=false excluye las ofertas', noFlashFilter.body.products?.every((p) => !p.flashSale));

/* --- Detalle --- */
console.log('\n[detalle]');
const first = all.body.products[0];
const detail = await call(`/products/${first.id}`);
check('GET /api/products/:id devuelve 200', detail.status === 200);
check('el detalle coincide con el listado', detail.body.product?.id === first.id);
const missing = await call('/products/does-not-exist-xyz');
check('producto inexistente devuelve 404', missing.status === 404, missing.status);

/* --- ABM: Create --- */
console.log('\n[ABM - create]');
const noAuth = await call('/products', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test', price: 100 }),
});
check('POST sin token devuelve 401', noAuth.status === 401, noAuth.status);

const badAuth = await call('/products', {
  method: 'POST',
  token: 'token-invalido',
  body: JSON.stringify({ name: 'Test', price: 100 }),
});
check('POST con token invalido devuelve 403', badAuth.status === 403, badAuth.status);

const invalid = await call('/products', {
  method: 'POST',
  token: TOKEN,
  body: JSON.stringify({ price: 100 }),
});
check('POST sin nombre devuelve 400', invalid.status === 400, invalid.status);

const created = await call('/products', {
  method: 'POST',
  token: TOKEN,
  body: JSON.stringify({
    name: 'Camara de Prueba Automatica',
    category: 'camaras-seguridad',
    brand: 'TestBrand',
    price: 1499.5,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80',
    description: 'Producto creado por la suite de pruebas automatizadas del MVP.',
    features: ['Prueba A', 'Prueba B'],
    featured: true,
  }),
});
check('POST crea el producto (201)', created.status === 201, created.status);
check('el producto creado trae id y sku', Boolean(created.body.product?.id && created.body.product?.sku));
const newId = created.body.product?.id;

const afterCreate = await call('/products');
check('el total sube a 61 tras el alta', afterCreate.body.total === 61, afterCreate.body.total);

/* --- ABM: Update --- */
console.log('\n[ABM - update]');
const updated = await call(`/products/${newId}`, {
  method: 'PUT',
  token: TOKEN,
  body: JSON.stringify({ price: 1999.99, stock: 3, name: 'Camara de Prueba EDITADA' }),
});
check('PUT actualiza el producto (200)', updated.status === 200, updated.status);
check('el precio quedo actualizado', updated.body.product?.price === 1999.99, updated.body.product?.price);
check('el stock quedo actualizado', updated.body.product?.stock === 3);
check('el nombre quedo actualizado', updated.body.product?.name === 'Camara de Prueba EDITADA');
check('los campos no enviados se conservan', updated.body.product?.brand === 'TestBrand');

const updateMissing = await call('/products/no-existe-abc', {
  method: 'PUT',
  token: TOKEN,
  body: JSON.stringify({ price: 1 }),
});
check('PUT sobre id inexistente devuelve 404', updateMissing.status === 404, updateMissing.status);

/* --- ABM: Delete --- */
console.log('\n[ABM - delete]');
const deleted = await call(`/products/${newId}`, {
  method: 'DELETE',
  token: TOKEN,
});
check('DELETE elimina el producto (200)', deleted.status === 200, deleted.status);
const afterDelete = await call('/products');
check('el total vuelve a 60 tras la baja', afterDelete.body.total === 60, afterDelete.body.total);

const deleteAgain = await call(`/products/${newId}`, {
  method: 'DELETE',
  token: TOKEN,
});
check('DELETE sobre id inexistente devuelve 404', deleteAgain.status === 404, deleteAgain.status);

/* --- ABM de Ofertas Flash --- */
console.log('\n[ABM - ofertas flash]');
const flashCreated = await call('/products', {
  method: 'POST',
  token: TOKEN,
  body: JSON.stringify({
    name: 'Producto Flash de Prueba',
    category: 'camaras-seguridad',
    brand: 'TestBrand',
    price: 100,
    stock: 5,
    flashSale: true,
    flashDiscount: 70,
    description: 'Producto en oferta flash creado por la suite de pruebas automatizadas.',
  }),
});
check('POST crea el producto en oferta flash (201)', flashCreated.status === 201, flashCreated.status);
check(
  'el precio original se deriva automaticamente (100 -> 333,33)',
  flashCreated.body.product?.compareAtPrice === 333.33,
  flashCreated.body.product?.compareAtPrice,
);
check(
  'el descuento queda guardado',
  flashCreated.body.product?.flashDiscount === 70,
);
const flashId = flashCreated.body.product?.id;

const flashUpdated = await call(`/products/${flashId}`, {
  method: 'PUT',
  token: TOKEN,
  body: JSON.stringify({ price: 300 }),
});
check(
  'al cambiar el precio se recalcula el precio original (300 -> 1000)',
  flashUpdated.body.product?.compareAtPrice === 1000,
  flashUpdated.body.product?.compareAtPrice,
);

await call(`/products/${flashId}`, { method: 'DELETE', token: TOKEN });
const afterFlashDelete = await call('/products');
check('el total vuelve a 60 tras borrar el producto flash', afterFlashDelete.body.total === 60, afterFlashDelete.body.total);

/* --- Persistencia en disco --- */
console.log('\n[persistencia]');
const stats = await call('/products/stats');
check('GET /api/products/stats responde 200', stats.status === 200);
check('las estadisticas reportan 60 productos', stats.body.stats?.total === 60, stats.body.stats?.total);
check('las estadisticas calculan el valor de inventario', stats.body.stats?.inventoryValue > 0);

/* --- Pagos --- */
console.log('\n[pagos]');
const emptyCart = await call('/create-preference', {
  method: 'POST',
  body: JSON.stringify({ items: [] }),
});
check('carrito vacio devuelve 400', emptyCart.status === 400, emptyCart.status);

const pref = await call('/create-preference', {
  method: 'POST',
  body: JSON.stringify({
    items: [
      { id: 'cam-ip-4k-bullet', name: 'Camara IP 4K', price: 89990, quantity: 2, image: 'https://example.com/a.jpg' },
      { id: 'kit-nvr-8camaras', name: 'Kit DVR', price: 249000, quantity: 1 },
    ],
    payer: { name: 'Juan', surname: 'Perez', email: 'juan@test.com', phone: '11 1234 5678' },
  }),
});
check('POST /api/create-preference devuelve 200', pref.status === 200, pref.status);
check('devuelve un preferenceId', Boolean(pref.body.preferenceId));
check('devuelve una initPoint', Boolean(pref.body.initPoint));
check('calcula el total correctamente', pref.body.total === 89990 * 2 + 249000, pref.body.total);
check('reporta el modo sandbox', pref.body.sandbox === true);
check('incluye los items normalizados', pref.body.items?.length === 2);

const config = await call('/payments/config');
check('GET /api/payments/config responde 200', config.status === 200);
check('indica el modo sandbox', config.body.sandbox === true);

/* --- 404 --- */
console.log('\n[routing]');
const notFound = await call('/ruta/inexistente');
check('ruta desconocida devuelve 404', notFound.status === 404, notFound.status);

/* --- Resumen --- */
console.log(`\n=== Resultado: ${pass} OK / ${fail} FALLA ===\n`);
process.exit(fail > 0 ? 1 : 0);
