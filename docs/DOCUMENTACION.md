# Documentación del Proyecto — Stark Technology

> Documento de alcance, objetivos y requerimientos del e-commerce de informática
> y seguridad electrónica **Stark Technology** (monorepo Full-Stack).

---

## Ficha del documento

| Campo | Valor |
|---|---|
| Proyecto | Stark Technology — E-commerce de informática y seguridad electrónica |
| Tipo de documento | Especificación de alcance y requerimientos |
| Versión | 1.0 |
| Fecha | Octubre 2026 |
| Repositorio | `https://github.com/diegof1994/stark-technology` |
| Alcance del sistema | Aplicación web SPA + API REST |
| Estado | MVP funcional, desplegable |

### Convenciones

- **RF** = Requerimiento funcional · **RNF** = Requerimiento no funcional · **RN** = Regla de negocio · **OE** = Objetivo específico.
- **Prioridad** (MoSCoW): `M` = Must have, `S` = Should have, `C` = Could have, `W` = Won't have (en esta versión).
- Los criterios de aceptación son **verificables**: cada uno se comprueba contra un test automatizado, una medición en el DOM o una respuesta de la API.

---

## 1. Introducción

### 1.1 Propósito

Definir de forma explícita **qué hace y qué no hace** el sistema, **para qué se construyó**
y **qué condiciones debe cumplir** para considerarse terminado. El documento sirve como
contrato entre el equipo de desarrollo, el cliente y quien evalúe el producto.

### 1.2 Contexto

Stark Technology comercializa dos verticales de producto:

1. **Informática**: componentes de PC de alta gama, periféricos gaming, almacenamiento NAS y redes.
2. **Seguridad electrónica**: cámaras IP/CCTV, control de acceso biométrico, energía y respaldo UPS, drones de monitoreo y monitores industriales.

El catálogo cubre **10 rubros con 60 productos**. El sistema es un **MVP de comercio
electrónico**: permite descubrir, comparar y comprar productos, y administrar el
inventario desde un panel propio.

### 1.3 Situación que resuelve

| Problema | Respuesta del sistema |
|---|---|
| Catálogo disperso en planillas y catálogos PDF | Catálogo web filtrable con búsqueda tolerante a acentos |
| Sin visibilidad de stock ni precios actualizados | API única que alimenta web y panel de administración |
| Ofertas promocionales inconsistentes (precio tachado que no cierra) | Precio original **derivado** del descuento, siempre coherente |
| Proceso de compra manual por mensajería | Carrito persistente + checkout con Mercado Pago |
| Sin control del inventario | ABM completo con autenticación por token |

---

## 2. Alcance

### 2.1 Alcance del producto

El sistema es una **aplicación web de una sola página (SPA)** con **API REST** propia.
Se compone de cinco superficies:

| Superficie | Ruta | Descripción |
|---|---|---|
| Landing | `/` | Presentación de marca, ofertas flash, rubros, destacados y beneficios |
| Catálogo | `/catalogo` | Exploración con filtros, ordenamiento y búsqueda |
| Ficha de producto | `/producto/:id` | Detalle, galería, características y compra |
| Panel de administración | `/admin` | ABM de inventario protegido por token |
| Checkout simulado | `/checkout/simulado` | Pasarela de prueba sin cargos reales |

Además, dos **overlays globales** disponibles desde cualquier ruta: el **drawer del carrito**
y el **modal de checkout**.

### 2.2 Alcance incluido por módulo

| # | Módulo | Incluido | Madurez |
|---|---|---|---|
| 1 | Catálogo y exploración | 60 productos, 10 rubros, grilla responsive | Completo |
| 2 | Búsqueda predictiva | Sugerencias producto + categoría, teclado | Completo |
| 3 | Filtros y ordenamiento | Rubro, precio máximo, destacados, flash, 5 criterios de orden | Completo |
| 4 | Ficha de producto | Galería, precio, stock, características, relacionados | Completo |
| 5 | Carrito | Context API, persistencia, sincronización entre pestañas | Completo |
| 6 | Checkout y pagos | Mercado Pago real + modo simulación con fallback automático | Completo (sandbox) |
| 7 | Ofertas Flash | 70% de descuento, precio original derivado, tachado diagonal, countdown | Completo |
| 8 | Panel de administración | Login por token, métricas, ABM, filtros | Completo |
| 9 | Tema claro / oscuro | Tokens semánticos, persistencia, anti-flash | Completo |
| 10 | Design system | Tokens, tipografías autoalojadas, 19 clases de componente + 4 utilidades | Completo |
| 11 | Resiliencia | Caché offline del catálogo, fallback local del ABM | Completo |
| 12 | Verificación | 31 tests de cliente + 63 aserciones de API | Completo |

### 2.3 Alcance excluido

Queda **explícitamente fuera** de esta versión:

| # | Excluido | Motivo |
|---|---|---|
| E1 | Registro, login y cuentas de cliente final | El MVP no requiere identidad de comprador |
| E2 | Base de datos relacional (PostgreSQL/MySQL) | Persistencia en archivo JSON para el MVP |
| E3 | Órdenes y estados de pedido persistidos | El webhook es un punto de extensión documentado |
| E4 | Emails transaccionales reales | El newsletter solo valida y notifica en pantalla |
| E5 | Panel de administración multiusuario con roles | Un único token administrador |
| E6 | Procesamiento real de pagos con tarjeta propia | Delegado a Mercado Pago |
| E7 | Gestión de envíos y tracking | Solo se calcula costo de envío |
| E8 | Facturación electrónica / integración fiscal | Fuera del alcance del MVP |
| E9 | Aplicación móvil nativa | La web es responsive |
| E10 | Búsqueda con motor externo (Elasticsearch) | Filtrado en memoria del catálogo |
| E11 | Multi-idioma y multi-moneda | Solo español (es-AR) y ARS |
| E12 | Analítica de producto y A/B testing | No instrumentado |

### 2.4 Límites del sistema

```
┌──────────────────────────────────────────────────────────────┐
│                     NAVEGADOR (SPA React)                    │
│  Landing · Catálogo · Ficha · Admin · Checkout simulado      │
│  Carrito (Context + localStorage) · Tema (localStorage)      │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP/JSON (fetch, 15 s timeout)
┌───────────────────────────▼──────────────────────────────────┐
│                    API REST (Express)                        │
│  /api/products · /api/categories · /api/create-preference    │
│  Auth admin por cabecera x-admin-token                       │
└───────┬───────────────────────────────────┬──────────────────┘
        │                                   │
┌───────▼──────────────┐        ┌───────────▼──────────────────┐
│ products.json        │        │ Mercado Pago SDK             │
│ (escritura atómica)  │        │ real o modo simulación       │
└──────────────────────┘        └──────────────────────────────┘
```

**Fronteras:** el sistema no posee base de datos externa, ni servicio de correo, ni
almacenamiento de objetos. Las imágenes de producto son **URLs externas**
(Unsplash) y el pago es delegado a un tercero.

### 2.5 Supuestos

| # | Supuesto |
|---|---|
| S1 | El catálogo inicial (60 productos) es representativo del inventario real |
| S2 | El volumen de productos no supera unos pocos miles → el filtrado en memoria es suficiente |
| S3 | El administrador es un usuario técnico y opera desde un entorno controlado |
| S4 | El despliegue se realiza en un hosting con Node.js (Render) |
| S5 | El disco puede ser efímero: la app debe seguir funcionando en memoria |
| S6 | El pago real se activa cargando credenciales de Mercado Pago |

### 2.6 Restricciones

| # | Restricción |
|---|---|
| R1 | Node.js ≥ 18 (ESM) |
| R2 | El frontend debe poder construirse con `vite build` como sitio estático |
| R3 | El token de administración viaja en cabecera, nunca en la URL |
| R4 | Las fuentes deben autoalojarse (sin dependencia de CDN) |
| R5 | Formato de moneda `es-AR` con `Intl.NumberFormat` |
| R6 | El cuerpo JSON de las peticiones se limita a 2 MB |

---

## 3. Objetivos

### 3.1 Objetivo general

> **OG-01.** Construir un e-commerce web funcional y desplegable que permita descubrir,
> comparar y comprar productos de informática y seguridad electrónica, con un catálogo
> administrable en línea, una experiencia de compra completa y una identidad visual
> propia y consistente en tema claro y oscuro.

### 3.2 Objetivos específicos

| ID | Objetivo específico | Verificación |
|---|---|---|
| **OE-01** | Publicar el catálogo completo (10 rubros / 60 productos) accesible desde la web | `GET /api/products` devuelve 60; la grilla renderiza 60 tarjetas |
| **OE-02** | Permitir encontrar un producto en menos de 3 interacciones | Búsqueda predictiva + rail de rubros + filtros en URL |
| **OE-03** | Completar el flujo de compra de punta a punta sin fricción | Carrito → checkout → preferencia de pago → pantalla de resultado |
| **OE-04** | Garantizar coherencia aritmética de las Ofertas Flash | Precio original derivado del descuento; test `originalPriceFrom(89.9, 70) === 299.67` |
| **OE-05** | Administrar el inventario sin tocar la base de datos | ABM con creación, edición y baja verificada por API y UI |
| **OE-06** | Operar sin credenciales de pago (demo) y con ellas (producción) | Modo simulación por defecto; `GET /api/payments/config` reporta el modo |
| **OE-07** | Ofrecer un modo claro y oscuro realmente funcional | Toggle persistente; ambos temas verificados en DOM |
| **OE-08** | Sostener la app si el backend no responde | Caché del catálogo + fallback local del ABM (modo offline) |
| **OE-09** | Mantener una base de pruebas automatizada | 31 tests de cliente + 63 aserciones de API en verde |
| **OE-10** | Entregar un design system reutilizable y documentado | Tokens semánticos + 19 clases de componente y 4 utilidades |

### 3.3 Indicadores de éxito

| Indicador | Meta | Estado |
|---|---|---|
| Cobertura funcional de los RF `M` | 100 % | Cumplido |
| Tests de cliente en verde | 31/31 | Cumplido |
| Aserciones de API en verde | 63/63 | Cumplido |
| Build de producción sin errores | 0 errores | Cumplido |
| Temas claro y oscuro operativos | 2/2 | Cumplido |
| Precio tachado horizontal (`line-through`) residual | 0 elementos | Cumplido |

---

## 4. Actores y roles

| Actor | Descripción | Permisos |
|---|---|---|
| **Visitante** | Usuario anónimo que navega el catálogo | Lectura de catálogo, búsqueda, filtros, carrito local |
| **Comprador** | Visitante que inicia el checkout | Todo lo anterior + generar preferencia de pago |
| **Administrador** | Operador con token válido | Lectura + alta, edición y baja de productos; métricas |
| **Sistema de pagos** | Mercado Pago (o simulador local) | Crear preferencia, notificar por webhook |
| **Navegador / almacenamiento local** | Persistencia del cliente | Carrito, tema y caché del catálogo |

---

## 5. Requerimientos funcionales

### 5.1 Mapa de módulos

| Prefijo | Módulo | Cantidad |
|---|---|---|
| `RF-CAT` | Catálogo y exploración | 5 |
| `RF-BUS` | Búsqueda predictiva | 4 |
| `RF-FLT` | Filtros y ordenamiento | 5 |
| `RF-DET` | Ficha de producto | 5 |
| `RF-CAR` | Carrito de compras | 7 |
| `RF-PAG` | Checkout y pagos | 7 |
| `RF-FLA` | Ofertas Flash | 7 |
| `RF-ADM` | Panel de administración | 8 |
| `RF-UI` | Tema y presentación | 5 |
| `RF-CON` | Contenido institucional | 4 |

---

### 5.2 Catálogo y exploración

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-CAT-01** | El sistema debe listar los 60 productos del catálogo con imagen, nombre, categoría, descripción, precio, stock y rating | M | `GET /api/products` responde `total: 60` y cada ítem tiene los campos completos |
| **RF-CAT-02** | El listado debe mostrar los 10 rubros con su conteo de productos | M | `GET /api/categories` devuelve 10 categorías con `count` |
| **RF-CAT-03** | La grilla debe ser responsive (1 / 2 / 3 / 4 columnas) | M | En 1440 px se renderizan 60 tarjetas sin desborde horizontal |
| **RF-CAT-04** | Cada tarjeta debe ofrecer agregado rápido al carrito sin salir del catálogo | S | Botón con nombre accesible `Agregar {producto} al carrito` |
| **RF-CAT-05** | El listado debe indicar visualmente stock bajo y sin stock | S | `stock ≤ 10` se marca como últimas unidades; `stock = 0` muestra "Sin stock" |

### 5.3 Búsqueda predictiva

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-BUS-01** | La búsqueda debe sugerir productos y categorías mientras se escribe | M | Al escribir, se listan coincidencias de ambos tipos |
| **RF-BUS-02** | La búsqueda debe ignorar mayúsculas y acentos | M | Buscar `camara` encuentra "Cámara"; buscar `camión` y `camion` dan el mismo resultado |
| **RF-BUS-03** | La búsqueda debe ser navegable por teclado | S | `↑` `↓` recorren sugerencias, `Enter` abre, `Escape` cierra |
| **RF-BUS-04** | Debe existir un atajo de teclado para enfocar el buscador | C | La tecla `/` enfoca el campo desde cualquier ruta |

### 5.4 Filtros y ordenamiento

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-FLT-01** | Filtrar por rubro desde un rail lateral | M | Al elegir un rubro, la URL contiene `category=<id>` y el listado se reduce |
| **RF-FLT-02** | Filtrar por rango de precio | S | `maxPrice` acota el listado; se refleja en la URL |
| **RF-FLT-03** | Filtrar solo destacados y solo ofertas flash | S | `featured=true` / `flash=true` en la URL |
| **RF-FLT-04** | Ordenar por relevancia, precio asc/desc, rating, nombre y novedad | S | El parámetro `sort` aplica el criterio y se refleja en la URL |
| **RF-FLT-05** | Los filtros activos deben poder quitarse individualmente y en conjunto | S | Pills de filtros con acción de quitar y botón "Limpiar todo" |

### 5.5 Ficha de producto

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-DET-01** | Mostrar nombre, rubro, marca, SKU, rating y reseñas | M | La ficha expone todos los campos del producto |
| **RF-DET-02** | Mostrar galería con imagen principal y miniaturas navegables | S | Las miniaturas cambian la imagen activa (`aria-pressed`) |
| **RF-DET-03** | Mostrar disponibilidad real y permitir elegir cantidad acotada al stock | M | Se muestra `N unidades disponibles`; el selector no supera el stock |
| **RF-DET-04** | Permitir agregar al carrito desde la ficha | M | Botón `Agregar al carrito`; agrega la cantidad elegida y abre el drawer |
| **RF-DET-05** | Sugerir productos de la misma categoría | C | Se listan hasta 4 relacionados excluyendo el producto actual |

### 5.6 Carrito de compras

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-CAR-01** | El carrito debe estar disponible desde cualquier ruta como drawer lateral | M | `role="dialog"`, `aria-label="Carrito de compras"` |
| **RF-CAR-02** | Debe persistir entre recargas del navegador | M | Se guarda en `localStorage` bajo `stark_cart_v1` |
| **RF-CAR-03** | Debe sincronizarse entre pestañas abiertas | S | El evento `storage` actualiza los ítems de la otra pestaña |
| **RF-CAR-04** | Debe permitir incrementar, decrementar y eliminar ítems | M | Controles accesibles `Disminuir/Aumentar cantidad` y `Eliminar {producto}` |
| **RF-CAR-05** | La cantidad no debe superar el stock ni 99 unidades | M | El reducer acota a `min(cantidad, stock, 99)` |
| **RF-CAR-06** | Debe calcular subtotal, envío y total en tiempo real | M | El resumen muestra los tres valores formateados en ARS |
| **RF-CAR-07** | Debe informar cuánto falta para el envío gratis | C | Barra de progreso hacia $50.000 con el monto restante |

### 5.7 Checkout y pagos

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-PAG-01** | Generar una preferencia de pago a partir del carrito | M | `POST /api/create-preference` devuelve `preferenceId` e `initPoint` |
| **RF-PAG-02** | Rechazar el checkout con carrito vacío | M | Responde `400 VALIDATION_ERROR` |
| **RF-PAG-03** | Calcular el total en el servidor, no confiar en el cliente | M | El total se recalcula sumando `unit_price × quantity` |
| **RF-PAG-04** | Operar en modo simulación sin credenciales | M | Sin `MERCADO_PAGO_SECRET_KEY`, devuelve `sandbox: true` y una URL local |
| **RF-PAG-05** | Usar el SDK real de Mercado Pago cuando hay credenciales | S | Con credenciales válidas devuelve la preferencia real |
| **RF-PAG-06** | Informar el modo de operación al frontend | M | `GET /api/payments/config` devuelve `sandbox`, `currency` y mensaje |
| **RF-PAG-07** | Ofrecer una pantalla de resultado del pago | S | `/checkout/simulado` muestra estados revisión / procesando / aprobado / rechazado |

### 5.8 Ofertas Flash

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-FLA-01** | Listar los productos en oferta flash de forma destacada | M | `GET /api/products/flash` devuelve solo productos con `flashSale: true` |
| **RF-FLA-02** | Aplicar un descuento del 70 % por defecto, configurable entre 5 % y 95 % | M | `flashDiscount` se normaliza al rango; el valor por defecto es 70 |
| **RF-FLA-03** | **Derivar** el precio original del precio final y el descuento | M | `original = round2(final / (1 − d/100))`; `89,90` al 70 % → `299,67` |
| **RF-FLA-04** | Mostrar el precio original con **tachado diagonal** (no horizontal) | M | Existe `[data-testid="strike-line"]` rotada `-12deg`; `line-through` residual = 0 |
| **RF-FLA-05** | Mostrar el precio final en verde esmeralda | M | `text-savings-ink` (`#34d399` en oscuro, `#059669` en claro) |
| **RF-FLA-06** | Mostrar una cuenta regresiva en vivo al cierre de la oferta | S | `[data-testid="flash-countdown"]` con formato `HH:MM:SS` que decrece |
| **RF-FLA-07** | Mostrar un sticker de descuento y un mensaje de urgencia | S | Badge accesible `Oferta flash: N por ciento de descuento` + copy rotativo |

### 5.9 Panel de administración

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-ADM-01** | Exigir un token de administrador para acceder al panel | M | Sin token válido no se muestra la gestión de inventario |
| **RF-ADM-02** | Rechazar peticiones de escritura sin token | M | `401 UNAUTHORIZED` sin cabecera; `403 FORBIDDEN` con token inválido |
| **RF-ADM-03** | Mostrar métricas del inventario | S | `GET /api/products/stats`: total, valor de inventario, stock bajo, agotados, precio promedio |
| **RF-ADM-04** | Listar productos en tabla con buscador y filtro por rubro | M | La tabla filtra por nombre, marca, SKU y categoría |
| **RF-ADM-05** | Crear productos con validación de campos | M | Nombre obligatorio, precio numérico ≥ 0, stock numérico ≥ 0, imagen `http(s)://` |
| **RF-ADM-06** | Editar productos de forma parcial preservando identidad | M | Se preservan `id`, `slug`, `sku`, `createdAt`; se actualiza `updatedAt` |
| **RF-ADM-07** | Eliminar productos con confirmación explícita | M | Diálogo de confirmación; respuesta `200` y luego `404` al reintentar |
| **RF-ADM-08** | Recalcular el precio original al editar una oferta flash | M | Cambiar el precio recalcula `compareAtPrice` |

### 5.10 Tema y presentación

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-UI-01** | Ofrecer tema claro y oscuro conmutable desde el navbar | M | El botón alterna `documentElement.className` entre `dark` y `light` |
| **RF-UI-02** | Persistir la preferencia de tema | M | Se guarda en `localStorage` bajo `stark_theme` |
| **RF-UI-03** | Evitar el parpadeo de tema al cargar | S | Script anti-flash en `index.html` aplica el tema antes del primer render |
| **RF-UI-04** | Sincronizar el color de barra del navegador con el tema | C | Se actualiza `meta[name="theme-color"]` |
| **RF-UI-05** | Usar exclusivamente tokens semánticos (sin colores hardcodeados) | M | No quedan clases de paleta fija en los componentes |

### 5.11 Contenido institucional

| ID | Requerimiento | Prio | Criterio de aceptación |
|---|---|---|---|
| **RF-CON-01** | La landing debe presentar la propuesta de valor y las verticales | M | Hero, ticker de garantías, rubros, destacados y beneficios |
| **RF-CON-02** | El pie debe incluir navegación, medios de pago y redes | S | Secciones de catálogo, tecnología, institucional y medios de pago |
| **RF-CON-03** | El newsletter debe validar el email antes de confirmar | C | Email inválido muestra error; válido limpia el campo y confirma |
| **RF-CON-04** | Las rutas desconocidas deben redirigir al inicio | S | `*` → `/`; la API responde `404` con código de error |

---

## 6. Requerimientos no funcionales

### 6.1 Usabilidad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-USA-01** | La interfaz debe estar en español (es-AR) con moneda ARS | Todos los textos y precios usan `Intl.NumberFormat('es-AR')` |
| **RNF-USA-02** | El flujo de compra debe ser lineal y sin pasos ocultos | Carrito → checkout → resultado, sin recargas de página |
| **RNF-USA-03** | Toda acción destructiva debe pedir confirmación | Eliminar producto y vaciar carrito requieren acción explícita |
| **RNF-USA-04** | El sistema debe dar feedback ante cada operación asíncrona | Toasts de éxito/error y estados `loading` con skeletons |
| **RNF-USA-05** | Los estados vacíos deben explicar el siguiente paso | Catálogo sin resultados y carrito vacío ofrecen una acción de salida |

### 6.2 Rendimiento

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-REN-01** | El primer render no debe esperar al backend para pintar el layout | Navbar, footer y shell se renderizan de inmediato |
| **RNF-REN-02** | Las animaciones deben limitarse a `transform` y `opacity` | Sin animar propiedades de layout |
| **RNF-REN-03** | Las imágenes deben cargarse de forma diferida | `loading="lazy"` en tarjetas, miniaturas y relacionados |
| **RNF-REN-04** | El build debe mantenerse por debajo de 150 kB de CSS | Medición actual: ~82 kB |
| **RNF-REN-05** | Las fuentes deben servirse autoalojadas con intercambio | `@fontsource-variable` con `font-display: swap` |
| **RNF-REN-06** | Las peticiones deben tener timeout | 15 s por petición, con mensaje de error específico |

### 6.3 Compatibilidad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-COM-01** | Debe funcionar en las últimas dos versiones de Chrome, Edge, Firefox y Safari | Uso de APIs estándar (ES2022, CSS moderno) |
| **RNF-COM-02** | Debe ser responsive de 360 px a 2560 px | Grillas y rails colapsan sin desborde |
| **RNF-COM-03** | Debe respetar `prefers-reduced-motion` | Las animaciones se atenúan o desactivan |
| **RNF-COM-04** | Debe soportar un disco no persistente en el backend | Si falla la escritura, continúa en memoria con aviso |

### 6.4 Seguridad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-SEG-01** | El token de administración no debe viajar en la URL | Se envía por cabecera `x-admin-token` |
| **RNF-SEG-02** | Las escrituras deben autenticarse en el servidor, no solo en la UI | `requireAdmin` protege POST, PUT y DELETE |
| **RNF-SEG-03** | La API no debe exponer su tecnología | `app.disable('x-powered-by')` |
| **RNF-SEG-04** | CORS debe restringirse por origen en producción | Lista blanca desde `CLIENT_URL`; en desarrollo se relaja |
| **RNF-SEG-05** | Los secretos no deben versionarse | `.env` en `.gitignore`; solo se versionan `.env.example` |
| **RNF-SEG-06** | Los errores no deben filtrar detalles internos en producción | El `detail` del proveedor de pagos solo aparece en desarrollo |
| **RNF-SEG-07** | El total a cobrar debe validarse en el servidor | Se recalcula desde los ítems recibidos |
| **RNF-SEG-08** | El cuerpo de las peticiones debe estar acotado | Límite de 2 MB |

> **Nota:** el modelo de autenticación es de **token compartido**, adecuado al MVP.
> No sustituye a un esquema de usuarios con roles, que está fuera de alcance (E5).

### 6.5 Accesibilidad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-ACC-01** | Todo control icónico debe tener nombre accesible | `aria-label` en botones de carrito, tema, menú, cerrar y galería |
| **RNF-ACC-02** | Los overlays deben exponerse como diálogos | `role="dialog"` + `aria-label` en carrito, checkout y formularios |
| **RNF-ACC-03** | Debe existir foco visible en todos los controles | Estilos `focus-visible` en botones, enlaces y campos |
| **RNF-ACC-04** | La navegación debe ser posible solo con teclado | Búsqueda, menú móvil, selector de cantidad y galería |
| **RNF-ACC-05** | Debe haber contraste suficiente en ambos temas | Texto principal sobre superficies con contraste alto verificado |
| **RNF-ACC-06** | Las imágenes de contenido deben tener texto alternativo | `alt` con el nombre del producto |
| **RNF-ACC-07** | La estructura debe usar landmarks semánticos | `header`, `nav`, `main`, `footer`, `h1` único por vista |
| **RNF-ACC-08** | La selección de miniaturas debe anunciar su estado | `aria-pressed` en la miniatura activa |

> **Estado:** se implementan las prácticas anteriores; **no se ha ejecutado una auditoría
> formal WCAG 2.1 AA**. Se toma como objetivo de calidad, no como certificación.

### 6.6 Mantenibilidad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-MAN-01** | El estilo debe definirse por tokens, no por valores repetidos | Un cambio de tema no requiere editar componentes |
| **RNF-MAN-02** | El código debe estar modularizado por responsabilidad | `components/`, `pages/`, `context/`, `hooks/`, `utils/`, `api/` |
| **RNF-MAN-03** | Las funciones y componentes públicos deben estar documentados | Comentarios JSDoc en módulos y utilidades |
| **RNF-MAN-04** | La lógica de negocio crítica debe estar duplicada de forma controlada | `flash.js` es espejo explícito entre cliente y servidor |
| **RNF-MAN-05** | Debe existir una suite automatizada que detecte regresiones | 31 tests de cliente + 63 aserciones de API |
| **RNF-MAN-06** | El texto debe estar libre de codificación corrupta | `scripts/scan-encoding.js` con 0 hallazgos |
| **RNF-MAN-07** | Los iconos deben ser propios y sin dependencias | Set SVG en `Icons.jsx` |

### 6.7 Disponibilidad y resiliencia

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-DIS-01** | Si la API no responde, el catálogo debe seguir navegable | Fallback a `localStorage` (`stark_products_cache`) con aviso de modo offline |
| **RNF-DIS-02** | Si la API falla en el ABM, los cambios deben aplicarse localmente | `useInventory` mantiene el estado y marca "Modo local" |
| **RNF-DIS-03** | La API debe exponer un health check | `GET /api/health` → `{ ok, status: 'online' }` |
| **RNF-DIS-04** | La persistencia debe ser atómica para no corromper datos | Escritura en `.tmp` + `rename` |
| **RNF-DIS-05** | El servidor debe cerrar de forma ordenada | Manejo de `SIGINT`/`SIGTERM` en `server.js` |

### 6.8 Escalabilidad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-ESC-01** | El listado debe soportar paginación por API | `page` + `limit`; `limit=0` devuelve todo |
| **RNF-ESC-02** | La persistencia debe poder reemplazarse sin tocar las rutas | `store.js` encapsula el acceso a datos |
| **RNF-ESC-03** | El frontend debe poder apuntar a otra API por configuración | `VITE_API_URL` |
| **RNF-ESC-04** | Los orígenes permitidos deben ser configurables | `CLIENT_URL` acepta lista separada por comas |

### 6.9 Observabilidad

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-OBS-01** | Cada petición HTTP debe registrarse en desarrollo | `morgan('dev')`, desactivado en `NODE_ENV=test` |
| **RNF-OBS-02** | Los eventos críticos deben dejar traza en consola | Arranque del store, modo de pago, preferencias y webhooks |
| **RNF-OBS-03** | Las degradaciones deben advertirse sin detener el servicio | Aviso si no hay `ADMIN_TOKEN` o si el disco no es escribible |

### 6.10 Localización

| ID | Requerimiento | Criterio de aceptación |
|---|---|---|
| **RNF-LOC-01** | Moneda única ARS con formato local | `$ 89.990` con separador de miles y coma decimal |
| **RNF-LOC-02** | Fechas y horas en formato local | Countdown y timestamps legibles |
| **RNF-LOC-03** | El catálogo debe declarar su idioma | `<html lang="es">` |

---

## 7. Reglas de negocio

| ID | Regla | Implementación |
|---|---|---|
| **RN-01** | El envío es gratuito desde $50.000; por debajo cuesta $7.500; con carrito vacío es $0 | `CartContext` |
| **RN-02** | El precio original de una oferta flash **nunca se ingresa a mano** | `originalPriceFrom()` en cliente y servidor |
| **RN-03** | El descuento flash se acota al rango 5 % – 95 % | `normalizeFlashDiscount()` |
| **RN-04** | La cantidad por ítem se acota al stock disponible y a 99 unidades | Reducer `ADD` / `SET_QUANTITY` |
| **RN-05** | Un producto con `stock = 0` no puede agregarse al carrito | Validación en tarjeta, ficha y reducer |
| **RN-06** | Stock bajo = 10 unidades o menos; agotado = 0 | `getStats()` y UI |
| **RN-07** | El identificador de producto se deriva del nombre (slug) y es único | `slugify()` + sufijo incremental |
| **RN-08** | El SKU se autogenera como `STK-XXX-0000` si no se provee | `buildSku()` |
| **RN-09** | El rating se acota a 0–5; precio y stock nunca son negativos | `sanitizeProduct()` |
| **RN-10** | El listado por defecto prioriza destacados y luego rating | Sorter `featured` |
| **RN-11** | La búsqueda normaliza acentos y mayúsculas | `normalize()` con NFD |
| **RN-12** | El total del pago se calcula en el servidor | `create-preference` |
| **RN-13** | Sin credenciales de pago, el sistema opera en simulación | `isSandbox()` |

---

## 8. Modelo de datos

### 8.1 Entidad `Product`

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | Sí | Slug único derivado del nombre |
| `slug` | string | Sí | Slug único para URLs |
| `sku` | string | Sí | Código interno `STK-XXX-0000` |
| `name` | string | **Sí** | Nombre comercial |
| `category` | string | Sí | Id de rubro (por defecto `redes-conectividad`) |
| `categoryLabel` | string | Sí | Etiqueta legible del rubro |
| `brand` | string | No | Marca (por defecto `Stark`) |
| `description` | string | No | Descripción comercial |
| `price` | number | **Sí** | Precio final de venta (≥ 0) |
| `compareAtPrice` | number \| null | No | Precio de lista; derivado si es oferta flash |
| `stock` | number | Sí | Unidades disponibles (entero ≥ 0) |
| `image` | string | No | URL de la imagen principal |
| `gallery` | string[] | No | Hasta 6 imágenes adicionales |
| `features` | string[] | No | Hasta 12 características |
| `rating` | number | No | 0–5 (por defecto 4,5) |
| `reviews` | number | No | Cantidad de reseñas |
| `featured` | boolean | No | Producto destacado |
| `flashSale` | boolean | No | Participa de Oferta Flash |
| `flashDiscount` | number | No | Descuento 5–95 (por defecto 70) |
| `createdAt` / `updatedAt` | ISO string | Sí | Auditoría temporal |

### 8.2 Entidad `Category`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador del rubro |
| `label` | string | Etiqueta completa |
| `shortLabel` | string | Etiqueta corta para espacios reducidos |
| `icon` | string | Clave del icono |
| `accent` | string | Color de acento semántico |
| `cover` | string | Imagen de portada |
| `description` | string | Descripción del rubro |
| `count` | number | Cantidad de productos (calculado) |

### 8.3 Estado del carrito (cliente)

| Campo | Tipo | Descripción |
|---|---|---|
| `items[]` | array | Ítems del carrito |
| `items[].id` | string | Id del producto |
| `items[].quantity` | number | 1–99, acotado al stock |
| `items[].price` | number | Precio unitario al momento de agregar |
| `items[].flashSale` | boolean | Si provenía de una oferta |
| `items[].compareAtPrice` | number \| null | Para mostrar el ahorro |
| `isOpen` | boolean | Estado del drawer (no persistido) |

**Claves de almacenamiento:** `stark_cart_v1` (carrito), `stark_theme` (tema), `stark_products_cache` (catálogo offline).

### 8.4 Preferencia de pago

| Campo | Tipo | Descripción |
|---|---|---|
| `items[]` | array | `{ id, title, description, quantity, currency_id, unit_price, picture_url }` |
| `payer` | object | `{ name, surname, email, phone }` |
| `back_urls` | object | `success`, `pending`, `failure` |
| `notification_url` | string | Webhook de Mercado Pago |
| Respuesta | object | `{ ok, sandbox, preferenceId, initPoint, total, items, backUrls }` |

---

## 9. Arquitectura y stack

### 9.1 Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| UI | React | 19.2 |
| Bundler | Vite | 7.3 |
| Estilos | Tailwind CSS | 4.3 |
| Ruteo | React Router | 7.9 |
| Animación | Motion | 12.43 |
| Tipografías | @fontsource-variable | 5.3 |
| Runtime API | Node.js | ≥ 18 |
| Framework API | Express | 4.21 |
| Pagos | Mercado Pago SDK | 3.6 |
| Configuración | dotenv | 17.2 |
| Logging | morgan | 1.10 |
| CORS | cors | 2.8 |

### 9.2 API REST

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/health` | — | Estado del servicio |
| `GET` | `/api/products` | — | Listado con `q`, `category`, `minPrice`, `maxPrice`, `minStock`, `featured`, `flash`, `sort`, `page`, `limit` |
| `GET` | `/api/products/flash` | — | Solo ofertas flash |
| `GET` | `/api/products/stats` | — | Métricas de inventario |
| `GET` | `/api/products/:id` | — | Detalle por id o slug |
| `POST` | `/api/products` | **Admin** | Alta (201) |
| `PUT` | `/api/products/:id` | **Admin** | Edición total o parcial |
| `DELETE` | `/api/products/:id` | **Admin** | Baja |
| `GET` | `/api/categories` | — | Rubros con conteo |
| `POST` | `/api/create-preference` | — | Preferencia de pago |
| `GET` | `/api/payments/config` | — | Modo de pago y moneda |
| `POST` | `/api/webhook/mercadopago` | — | Notificación asíncrona |

**Códigos de error:** `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `PRODUCT_NOT_FOUND` (404), `PAYMENT_PROVIDER_ERROR` (502).

### 9.3 Flujo de checkout

```
Carrito ──► POST /api/create-preference
              │
              ├─ sin credenciales ──► { sandbox: true, initPoint: "/checkout/simulado?..." }
              │                          └─► /checkout/simulado (revisión → procesando → aprobado/rechazado)
              │
              └─ con credenciales ──► SDK Mercado Pago ──► init_point real
                                         └─► back_urls + webhook /api/webhook/mercadopago
```

### 9.4 Rutas del cliente

| Ruta | Componente | Layout |
|---|---|---|
| `/` | `Home` | Con navbar y footer |
| `/catalogo` | `Catalog` | Con navbar y footer |
| `/producto/:id` | `ProductDetail` | Con navbar y footer |
| `/admin` | `Admin` | Con navbar y footer |
| `/checkout/simulado` | `SimulatedCheckout` | **Standalone** (sin navbar ni footer) |
| `*` | Redirección a `/` | — |

---

## 10. Trazabilidad y verificación

### 10.1 Matriz de requerimientos → pruebas

| Requerimiento | Verificación |
|---|---|
| RF-CAT-01/02 | `server/tests/api.test.js` (listado de 60, 10 categorías) |
| RF-CAT-03/04 | `client/src/test/app.test.jsx` (grilla y botones de agregado) |
| RF-BUS-01/02 | `api.test.js` (búsqueda con y sin acentos) |
| RF-FLT-01 | `app.test.jsx` (`category=almacenamiento-nas` en la URL) |
| RF-FLT-02/03/04 | `api.test.js` (rango de precio, destacados, ordenamiento) |
| RF-DET-01..04 | `app.test.jsx` (ficha, `64 unidades disponibles`, agregar al carrito) |
| RF-CAR-01..06 | `app.test.jsx` (badge del carrito, persistencia) |
| RF-CAR-05 | Reducer + pruebas de cantidad |
| RF-PAG-01..05 | `api.test.js` (preferencia, carrito vacío, total, sandbox) |
| RF-FLA-01..05 | `client/src/test/flash.test.jsx` (21 tests) |
| RF-FLA-04 | `expectDiagonalStrike()`: `bg-strike`, `h-[2px]`, `w-full`, `rotate-[-12deg]` |
| RF-ADM-01..08 | `api.test.js` (401, 403, alta, edición, baja) + `app.test.jsx` (alta desde el panel) |
| RF-UI-01/02 | Verificación headless: `className`, `stark_theme`, `--canvas` |
| RNF-REN-04 | `vite build` → CSS ~82 kB |
| RNF-MAN-06 | `scripts/scan-encoding.js` → 0 hallazgos |
| RNF-DIS-03 | `api.test.js` (health check) |

### 10.2 Resumen de la suite

| Suite | Cantidad | Comando |
|---|---|---|
| API end-to-end | 63 aserciones | `npm test --prefix server` |
| Frontend | 31 tests | `npm test --prefix client` |
| Imágenes | 63 URLs | `node tests/images.test.js` |
| Codificación | 52 archivos | `node scripts/scan-encoding.js` |

---

## 11. Riesgos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| RS-01 | Disco efímero en el hosting pierde los cambios del ABM | Alto | Fallback a memoria + aviso; re-seed automático |
| RS-02 | Token de administrador filtrado | Alto | Cabecera, no URL; rotación por variable de entorno |
| RS-03 | Credenciales de pago ausentes en producción | Medio | Modo simulación explícito y visible en la UI |
| RS-04 | Imágenes externas caídas | Medio | Imagen de reemplazo (`FALLBACK_IMAGE`) y `onError` |
| RS-05 | Catálogo crece y el filtrado en memoria se degrada | Medio | API paginada; `store.js` aislado para migrar a DB |
| RS-06 | Descuento flash mal configurado rompe la aritmética | Alto | Precio original derivado y acotado 5–95 % |
| RS-07 | Dependencia del CDN de fuentes | Bajo | Fuentes autoalojadas con `@fontsource` |
| RS-08 | Sin auditoría formal de accesibilidad | Medio | Prácticas aplicadas; auditoría pendiente |

---

## 12. Glosario

| Término | Definición |
|---|---|
| **ABM** | Alta, baja y modificación de registros |
| **ARS** | Peso argentino, moneda del sistema |
| **Carrito** | Conjunto de ítems seleccionados antes del pago |
| **Design system** | Conjunto de tokens y componentes que garantizan consistencia visual |
| **Flash / Oferta Flash** | Promoción con descuento alto y tiempo limitado |
| **Hairline** | Línea divisoria de 1 px usada como recurso visual |
| **Mercado Pago** | Pasarela de pagos integrada |
| **MoSCoW** | Técnica de priorización: Must, Should, Could, Won't |
| **Preferencia de pago** | Objeto que Mercado Pago genera para iniciar un checkout |
| **Skeleton** | Marcador visual de carga que anticipa la estructura del contenido |
| **Slug** | Identificador legible derivado de un texto |
| **SPA** | Single Page Application |
| **Tachado diagonal** | Recurso gráfico que cruza el precio original con una línea rotada |
| **Token semántico** | Variable de diseño con nombre de rol (`--canvas`, `--text-muted`) |

---

*Documento generado a partir del código fuente en la versión `aa844c3` de la rama `main`.*
