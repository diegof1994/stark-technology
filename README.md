# ⚡ STARK TECHNOLOGY

> **Tienda online de informática y seguridad electrónica**
> Monorepo Full-Stack: React + Vite + Tailwind (frontend) · Node.js + Express (backend)

![Stack](https://img.shields.io/badge/React_19-Vite_7-2ce5ff?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Tailwind_CSS_4-2ce5ff?style=flat-square&logo=tailwindcss)
![Stack](https://img.shields.io/badge/Express_4-00c8f0?style=flat-square&logo=express)
![Stack](https://img.shields.io/badge/Mercado_Pago-00c8f0?style=flat-square&logo=mercadopago)

---

## 📑 Tabla de contenidos

1. [Descripción](#-descripción)
2. [Stack tecnológico](#-stack-tecnológico)
3. [Estructura del monorepo](#-estructura-del-monorepo)
4. [Puesta en marcha](#-puesta-en-marcha)
5. [Endpoints de la API](#-endpoints-de-la-api)
6. [Pasarela de pagos](#-pasarela-de-pagos)
7. [Panel de administración (ABM)](#-panel-de-administración-abm)
8. [Despliegue en Render](#-despliegue-en-render)
9. [Variables de entorno](#-variables-de-entorno)
10. [Pruebas](#-pruebas)

---

## 📘 Descripción

**Stark Technology** es el MVP de un e-commerce especializado en dos verticales:

- **Informática**: componentes de PC high-end, periféricos gaming, almacenamiento NAS y redes.
- **Seguridad electrónica**: cámaras IP/CCTV, control de acceso biométrico, energía y respaldo UPS, drones de monitoreo y monitores industriales.

El catálogo cubre **10 rubros especializados con 60 productos**, cada uno con imagen real, precio, stock, rating y descripción técnica.

### Funcionalidades principales

| Módulo | Descripción |
|---|---|
| 🛒 **Catálogo** | 60 productos en 10 rubros, con grilla responsive y filtros combinables |
| 🔍 **Buscador predictivo** | Sugerencias en tiempo real (productos + categorías), navegable con teclado (`↑` `↓` `Enter`, atajo `/`) |
| 🎛️ **Filtros** | Por rubro, rango de precio, solo destacados y 5 criterios de ordenamiento. Todo se refleja en la URL |
| 🛍️ **Carrito (Context API)** | Drawer deslizante, control de cantidades, subtotal/envío/total y persistencia en `localStorage` |
| 💳 **Pago con Mercado Pago** | SDK real de Mercado Pago (sandbox o producción) con **fallback automático a modo simulación** |
| 🔐 **Panel Admin (ABM)** | CRUD completo de inventario sincronizado con el backend, con fallback local si la API cae |
| 🌗 **Dark mode tecnológico** | Estética cyberpunk: acentos neón, cuadrícula HUD, tipografía display y animaciones |

---

## 🛠 Stack tecnológico

### Frontend (`/client`)

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2 | UI con Context API + `useReducer` |
| Vite | 7.3 | Bundler y dev server con proxy a la API |
| Tailwind CSS | 4.3 | Design system con `@theme`, dark mode y animaciones |
| React Router | 7.9 | Enrutado SPA (`/`, `/catalogo`, `/producto/:id`, `/admin`) |
| Motion | 12.43 | Transiciones y animaciones de entrada |

### Backend (`/server`)

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime (ESM) |
| Express | 4.21 | API REST con CORS y middlewares |
| Mercado Pago SDK | 3.6 | Generación de preferencias de pago |
| dotenv | 17.2 | Variables de entorno |
| morgan | 1.10 | Logging de requests |

---

## 📂 Estructura del monorepo

```
stark-technology/
├── client/                        # ── FRONTEND (React + Vite)
│   ├── index.html
│   ├── vite.config.js             # Plugin de Tailwind + proxy /api
│   ├── public/favicon.svg
│   ├── .env.example
│   └── src/
│       ├── main.jsx               # Bootstrap de la app + providers
│       ├── App.jsx                # Layout, rutas y overlays globales
│       ├── index.css              # Design system Tailwind v4 (tema neón)
│       ├── api/
│       │   └── client.js          # Cliente HTTP + endpoints + manejo de errores
│       ├── context/
│       │   ├── CartContext.jsx    # Carrito global (Context API + localStorage)
│       │   ├── ThemeContext.jsx   # Modo oscuro / claro
│       │   └── ToastContext.jsx   # Notificaciones flotantes
│       ├── hooks/
│       │   ├── useProducts.js     # Carga del catálogo + cache offline
│       │   └── useInventory.js    # ABM con sincronización y fallback local
│       ├── components/
│       │   ├── Navbar.jsx         # Cabecera, navegación y carrito
│       │   ├── Footer.jsx
│       │   ├── SearchBar.jsx      # Buscador con sugerencias predictivas
│       │   ├── CategoryFilter.jsx # Selector de rubros
│       │   ├── ProductCard.jsx    # Tarjeta de producto
│       │   ├── CartDrawer.jsx     # Drawer lateral del carrito
│       │   ├── CheckoutModal.jsx  # Checkout + Mercado Pago
│       │   ├── ProductFormModal.jsx # Formulario de alta/edición (ABM)
│       │   └── Icons.jsx          # Set de iconos SVG propio
│       ├── pages/
│       │   ├── Home.jsx           # Landing
│       │   ├── Catalog.jsx        # Catálogo con filtros
│       │   ├── ProductDetail.jsx  # Ficha de producto
│       │   ├── Admin.jsx          # Panel de administración
│       │   └── SimulatedCheckout.jsx # Checkout sandbox local
│       └── utils/format.js        # Formato de moneda, fechas y helpers
│
├── server/                        # ── BACKEND (Node + Express)
│   ├── .env.example
│   ├── data/products.json         # Persistencia del inventario (generado)
│   ├── src/
│   │   ├── server.js              # Punto de entrada y apagado ordenado
│   │   ├── app.js                 # Factory de la app Express (CORS, rutas)
│   │   ├── data/
│   │   │   ├── categories.js      # Los 10 rubros del catálogo
│   │   │   ├── seed.js            # 60 productos semilla
│   │   │   └── store.js           # Store con persistencia en disco
│   │   ├── middleware/
│   │   │   ├── auth.js            # Auth por token del panel admin
│   │   │   └── error.js           # Manejador de errores y 404
│   │   ├── routes/
│   │   │   ├── products.routes.js # CRUD de productos
│   │   │   ├── categories.routes.js
│   │   │   └── payments.routes.js # Mercado Pago + webhook
│   │   └── scripts/reseed.js      # Reinicia el catálogo con el seed
│   └── tests/
│       ├── api.test.js            # 49 pruebas end-to-end de la API
│       └── images.test.js         # Verifica las 63 URLs de imágenes
│
├── scripts/dev.js                 # Levanta API + frontend juntos
├── render.yaml                    # Blueprint de despliegue en Render
└── package.json                   # Scripts de la raíz
```

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js **18 o superior**
- npm **9 o superior**

### Instalación

```bash
# Instalar dependencias de cliente y servidor
npm run install:all

# O manualmente:
npm install --prefix client
npm install --prefix server
```

### Configuración

```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

### Ejecución

```bash
# Terminal 1 - API (http://localhost:4000)
npm run dev:server

# Terminal 2 - Frontend (http://localhost:5173)
npm run dev:client

# O ambos a la vez con un solo comando:
npm run dev
```

> El dev server de Vite proxya `/api` hacia `http://localhost:4000`, por lo que no hay problemas de CORS en desarrollo.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta API + frontend en paralelo |
| `npm run dev:server` | Solo API con auto-recarga (`node --watch`) |
| `npm run dev:client` | Solo frontend con HMR |
| `npm run build` | Compila el frontend a `client/dist` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm start` | Inicia la API en modo producción |
| `npm run install:all` | Instala dependencias de ambos paquetes |

---

## 🔌 Endpoints de la API

Base URL: `http://localhost:4000/api`

### Productos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/products` | — | Listado completo con filtros y búsqueda |
| `GET` | `/api/products/:id` | — | Detalle de un producto (por id o slug) |
| `GET` | `/api/products/stats` | — | Métricas del inventario |
| `POST` | `/api/products` | ✅ Admin | Crea un producto |
| `PUT` | `/api/products/:id` | ✅ Admin | Actualiza un producto |
| `DELETE` | `/api/products/:id` | ✅ Admin | Elimina un producto |

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/categories` | Los 10 rubros con su conteo de productos |

### Pagos

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/create-preference` | Genera la preferencia de pago de Mercado Pago |
| `GET` | `/api/payments/config` | Keys públicas y modo de operación |
| `POST` | `/api/webhook/mercadopago` | Notificación asíncrona de Mercado Pago |

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check (usado por Render) |

### Parámetros de `GET /api/products`

| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `q` | `string` | `?q=camara termica` | Búsqueda de texto (insensible a acentos) |
| `category` | `string` | `?category=smart-home` | Filtra por rubro |
| `minPrice` | `number` | `?minPrice=1000` | Precio mínimo |
| `maxPrice` | `number` | `?maxPrice=50000` | Precio máximo |
| `minStock` | `number` | `?minStock=1` | Excluye productos agotados |
| `featured` | `boolean` | `?featured=true` | Solo productos destacados |
| `sort` | `string` | `?sort=price-asc` | `featured` · `price-asc` · `price-desc` · `rating` · `newest` · `name` |
| `page` | `number` | `?page=2` | Paginación |
| `limit` | `number` | `?limit=12` | Productos por página (0 = todos) |

### Ejemplos

```bash
# Listar todo
curl http://localhost:4000/api/products

# Buscar drones
curl "http://localhost:4000/api/products?q=dron"

# Filtrar por rubro y ordenar por precio
curl "http://localhost:4000/api/products?category=perifericos-gaming&sort=price-asc"

# Crear producto (requiere token)
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "x-admin-token: stark-dev-admin" \
  -d '{"name":"Camara Test","category":"camaras-seguridad","price":9999,"stock":10}'

# Actualizar producto
curl -X PUT http://localhost:4000/api/products/cam-ip-4k-bullet \
  -H "Content-Type: application/json" \
  -H "x-admin-token: stark-dev-admin" \
  -d '{"price":7999,"stock":40}'

# Eliminar producto
curl -X DELETE http://localhost:4000/api/products/cam-ip-4k-bullet \
  -H "x-admin-token: stark-dev-admin"
```

### Formato de respuesta

```jsonc
// Éxito
{
  "ok": true,
  "total": 60,
  "count": 60,
  "page": 1,
  "products": [ /* ... */ ]
}

// Error
{
  "ok": false,
  "error": "VALIDATION_ERROR",
  "message": "El campo \"price\" debe ser un numero mayor o igual a 0."
}
```

---

## 💳 Pasarela de pagos

El backend funciona en **dos modos**, detectados automáticamente:

### Modo simulación (por defecto)

Si `MERCADO_PAGO_SECRET_KEY` está vacío, el endpoint genera una preferencia falsa
y devuelve una URL local (`/checkout/simulado`) que **replica fielmente el flujo de
Mercado Pago** (selección de medio de pago → procesando → aprobado / rechazado).
Perfecto para demo y para desarrollo sin credenciales.

### Modo real (Mercado Pago SDK)

Al definir `MERCADO_PAGO_SECRET_KEY` se usa el SDK oficial:

```js
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mpClient = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_SECRET_KEY });
const preferenceClient = new Preference(mpClient);

const preference = await preferenceClient.create({
  body: {
    items: [{ id, title, quantity, currency_id: 'ARS', unit_price }],
    payer: { name, surname, email, phone },
    back_urls: { success, pending, failure },
    auto_return: 'approved',
    notification_url: 'https://tu-api.onrender.com/api/webhook/mercadopago',
  },
});
```

El usuario es redirigido al checkout alojado por Mercado Pago (`init_point`) y la
tienda recibe la confirmación en el webhook `/api/webhook/mercadopago`.

> Para probar con credenciales reales de prueba, usá una clave `TEST-...` de tu
> cuenta de Mercado Pago Developers.

---

## 🔐 Panel de administración (ABM)

Disponible en **`/admin`** (también desde el navbar).

### Acceso

Pantalla de login simple por token. El token se envía en la cabecera `x-admin-token`.

- **Desarrollo**: `stark-dev-admin` (por defecto)
- **Producción**: definido en la variable `ADMIN_TOKEN` (en Render se genera automáticamente)

### Funcionalidades

- 📊 **Dashboard**: total de productos, unidades en stock, valor del inventario y alertas de stock crítico/agotado.
- 🔎 **Buscador y filtro por rubro** sobre el inventario.
- ➕ **Crear** producto con validación de campos (nombre, precio, stock e imagen).
- ✏️ **Actualizar** producto con edición parcial (los campos no enviados se conservan).
- 🗑️ **Eliminar** producto con modal de confirmación.
- 🔄 **Sincronización**: cada operación va a la API REST. Si el backend no responde, el panel **cae automáticamente a modo local** (`localStorage`) y lo indica visualmente, sin perder los cambios.

---

## 🚀 Despliegue en Render

El archivo `render.yaml` define un **Blueprint** con dos servicios:

| Servicio | Tipo | Comando de build | Puerto / Ruta |
|---|---|---|---|
| `stark-technology-api` | `web` (Node) | `cd server && npm install --omit=dev` | `PORT=10000` · health check `/api/health` |
| `stark-technology-web` | `static` (Vite) | `cd client && npm install && npm run build` | `./client/dist` con rewrite SPA |

### Pasos

1. Subí el código a GitHub (el repositorio ya incluye `render.yaml`).
2. En Render: **New → Blueprint** → seleccioná el repositorio.
3. Render detecta `render.yaml` y crea ambos servicios.
4. Configurá las variables de entorno opcionales:

   | Servicio | Variable | Valor |
   |---|---|---|
   | API | `MERCADO_PAGO_SECRET_KEY` | `TEST-...` (opcional) |
   | API | `MERCADO_PAGO_PUBLIC_KEY` | `TEST-...` (opcional) |
   | API | `ADMIN_TOKEN` | se genera automáticamente |
   | API | `CLIENT_URL` | URL del frontend (para CORS) |
   | Web | `VITE_API_URL` | URL de la API |
   | Web | `VITE_ADMIN_TOKEN` | el mismo token que en la API |

> **Nota sobre CORS**: si Render asigna un sufijo distinto al nombre del servicio
> (por ejemplo `stark-technology-web-abc123`), actualizá `CLIENT_URL` en el
> servicio de la API para que apunte a la URL real del frontend.

> **Nota sobre persistencia**: el plan free de Render usa un disco efímero, por lo
> que los cambios del ABM se reinician al redesplegar. Para persistencia real
> conectá una base de datos o montá un disco persistente.

---

## 🔐 Variables de entorno

### `server/.env`

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_TOKEN=stark-dev-admin
MERCADO_PAGO_SECRET_KEY=
MERCADO_PAGO_PUBLIC_KEY=
PUBLIC_URL=http://localhost:5173
```

### `client/.env`

```env
VITE_API_URL=http://localhost:4000
VITE_ADMIN_TOKEN=stark-dev-admin
VITE_MERCADO_PAGO_PUBLIC_KEY=
```

> ⚠️ **Nunca subas tu archivo `.env`** — está en `.gitignore`. Solo los `.env.example` se versionan.

---

## 🧪 Pruebas

```bash
# Suite completa de la API (49 aserciones)
cd server
node tests/api.test.js

# Verificación de las 63 URLs de imágenes
node tests/images.test.js

# Reiniciar el catálogo con los datos semilla
npm run seed
```

**Cobertura de `api.test.js`:**

- Health check y payload
- Listado completo (60 productos con imagen, precio, stock y descripción)
- 10 categorías con conteo e imagen de portada
- Filtros por categoría, texto (con y sin acentos), rango de precio y ordenamiento
- Detalle de producto + 404 para IDs inexistentes
- **ABM**: create (201, validaciones, 401 sin token, 403 con token inválido), update (parcial, preserva campos, 404), delete (200 + 404)
- Persistencia en disco y cálculo de métricas
- Preferencias de pago (validación de carrito vacío, cálculo de total, modo sandbox)
- Manejo de rutas inexistentes

---

## 📄 Licencia

MIT © **Stark Technology**

---

<p align="center">
  <sub>Hecho con ⚡ por el equipo de <strong>Stark Technology</strong></sub>
</p>
