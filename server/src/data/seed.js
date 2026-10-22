/**
 * Catalogo semilla de Stark Technology.
 *
 * 10 rubros)x(6 productos) = 60 productos de ejemplo.
 * Las imagenes apuntan a fotos reales de Unsplash servidas por su CDN.
 * Este archivo es la "fuente de verdad" inicial: el store lo carga al arrancar
 * y lo persiste en `server/data/products.json` para que el ABM sobreviva reinicios.
 */
import { FLASH_DISCOUNT_DEFAULT, originalPriceFrom } from './flash.js';

/** Construye un producto con valores por defecto coherentes. */
const p = (product) => {
  const base = {
    sku: '',
    brand: 'Stark',
    compareAtPrice: null,
    rating: 4.6,
    reviews: 0,
    featured: false,
    flashSale: false,
    flashDiscount: FLASH_DISCOUNT_DEFAULT,
    gallery: [],
    features: [],
    ...product,
  };

  // En oferta flash el precio original se deriva del precio final y el descuento.
  if (base.flashSale) {
    base.compareAtPrice = originalPriceFrom(base.price, base.flashDiscount);
  }

  return base;
};

export const SEED_PRODUCTS = [
  /* ---------------------------------------------------------
   * 1. CAMARAS DE SEGURIDAD IP / CCTV
   * --------------------------------------------------------- */
  p({
    id: 'cam-ip-4k-bullet',
    sku: 'STK-CAM-1001',
    name: 'Camara IP 4K IP67 Vision Nocturna 80m',
    category: 'camaras-seguridad',
    brand: 'StarkView',
    price: 89.9,
    compareAtPrice: 129.9,
    stock: 64,
    rating: 4.8,
    reviews: 214,
    featured: true,
    flashSale: true,
    image:
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Camara IP 4K Ultra HD con sensor Sony STARVIS, certificacion IP67 contra polvo y agua, iluminacion infrarroja de 80 metros y Wide Dynamic Range real de 130 dB. Se alimenta por PoE o 12V DC y se administra desde la app StarkHome o desde un NVR on-premise.',
    features: [
      'Resolucion 4K (3840 x 2160) a 20 fps',
      'IP67 / IK10 resistente a intemperie',
      'Infrarrojo 80 m con doble disector LED',
      'Alimentacion PoE IEEE 802.3af (802.3at opcional)',
      'Protocolos ONVIF S/T/G, RTSP, HTTP',
    ],
  }),
  p({
    id: 'cam-ptz-ptz-25x',
    sku: 'STK-CAM-1002',
    name: 'Camara PTZ Motorizada 25X Zoom Optico 1080p',
    category: 'camaras-seguridad',
    brand: 'StarkView',
    price: 189.5,
    compareAtPrice: 249.0,
    stock: 22,
    rating: 4.7,
    reviews: 96,
    image:
      'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Domo PTZ de alta velocidad con barrido continuo 360 grados, zoom optico 25x, autofocus por deteccion de contraste y soporte para audio bidireccional. Ideal para estacionamientos, perimetros deDecision y control de multitudes.',
    features: [
      'Zoom optico 25x + zoom digital 16x',
      'Presets de recorrido automatico (8 mascaras)',
      'Auto-tracking de objetivos en movimiento',
      'Audio bidireccional con cancelacion de eco',
    ],
  }),
  p({
    id: 'kit-nvr-8camaras',
    sku: 'STK-CAM-1003',
    name: 'Kit DVR 8 Canales + 4 Camaras IP 2MP',
    category: 'camaras-seguridad',
    brand: 'StarkGuard',
    price: 249.0,
    compareAtPrice: 329.0,
    stock: 18,
    rating: 4.5,
    reviews: 73,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Kit de videovigilancia preconfigurado: DVRhibrido de 8 canales con soporte H.265, 4 camaras IP domo de 2MP, cableado de 10m, fuente y mouse. Instalacion plug-and-play en menos de 60 minutos.',
    features: [
      'Grabacion H.265 (hasta 6 semanas en 1TB)',
      'Salida HDMI 4K + VGA simultaneas',
      'Acceso remoto por app y navegador',
      'KIT listo para instalar: 4 camaras + 4 cables de 10 m',
    ],
  }),
  p({
    id: 'cam-domo-color-4k',
    sku: 'STK-CAM-1004',
    name: 'Camara Domo IP 4K Color 24/7 Color Night Vision',
    category: 'camaras-seguridad',
    brand: 'StarkView',
    price: 134.9,
    compareAtPrice: 0,
    stock: 47,
    rating: 4.6,
    reviews: 128,
    image:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=80',
    description:
      'Lente dome de 12mm con sensor de alta sensibilidad que mantiene color real 24/7 gracias a la illuminacion dual (foco blanco + IR). Ideal para pescaderias, retail y parking subterráneo donde el negro y blanco no es aceptable.',
    features: [
      'Color real 24/7 con doble led',
      'Lente fija 2.8mm con correccion electronica de distorsion',
      'Almacenamiento local en microSD hasta 256GB',
      'Alarma por deteccion de linea y intrusion',
    ],
  }),
  p({
    id: 'cam-termica-barrido',
    sku: 'STK-CAM-1005',
    name: 'Camara Termica IP 160x120 para Detección de Incendio',
    category: 'camaras-seguridad',
    brand: 'StarkTherm',
    price: 749.0,
    compareAtPrice: 899.0,
    stock: 7,
    rating: 4.9,
    reviews: 41,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Camara termografica radiometrica con sensor no refrigerado 160x120, rango -20C a 550C y NETD menor a 35mK. Alarma automatica de sobretemperatura, deteccion de puntos de calor y SAFE fusion para superposicion visible/termica.',
    features: [
      'Rango de medicion -20C ~ +550C',
      'NETD < 35 mK (alta sensibilidad)',
      '2 paletas: fusion y alarma de puntos',
      'PoE+ y proteccion IP66',
    ],
  }),
  p({
    id: 'cam-solar-inalambrica',
    sku: 'STK-CAM-1006',
    name: 'Camara Solar Inalambrica 4G 20MP con Panel',
    category: 'camaras-seguridad',
    brand: 'StarkSolar',
    price: 329.0,
    compareAtPrice: 399.0,
    stock: 31,
    rating: 4.4,
    reviews: 88,
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    description:
      'Kit autonomo para puntos de vigilancia sin corriente electrica: panel solar de 6W, bateria de litio de 20Ah y cuerpo IP66 con LTE 4G integrado. Reporta posicion GPS y alarme de baja bateria a la app.',
    features: [
      'Autonomia de hasta 180 dias sin carga solar',
      'LTE 4G integrado (no necesita WiFi)',
      'GPS para geolocalizar y recuperar el equipo',
      'Zoom digital 10x y grabacion en microSD',
    ],
  
    flashSale: true,}),

  /* ---------------------------------------------------------
   * 2. CONTROL DE ACCESO Y BIOMETRIA
   * --------------------------------------------------------- */
  p({
    id: 'lector-biometrico-huella',
    sku: 'STK-ACC-2001',
    name: 'Lector Biometrico de Huella + Tarjeta + Teclado',
    category: 'control-acceso',
    brand: 'StarkAccess',
    price: 159.0,
    compareAtPrice: 199.0,
    stock: 52,
    rating: 4.7,
    reviews: 167,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Lector multifactor para control de acceso empresarial: huella dactilar capacitiva, tarjeta RFID Mifare, PIN numerico y salida Wiegand/relay. Admite hasta 10.000 usuarios con 3.000 huellas y 100.000 eventos de auditoria.',
    features: [
      'Triple factor: huella + RFID + PIN',
      'Sensor capacitivo de 512 x 512 px',
      'Salidas Wiegand 26/34, RS485 y relay NO/NC',
      'Anti-passback y modo anti-passthrough',
      'Proteccion IP65 con teclado metalico',
    ],
  }),
  p({
    id: 'cerradura-inteligente-ttlock',
    sku: 'STK-ACC-2002',
    name: 'Cerradura Inteligente Fingerprint con App y Codigo',
    category: 'control-acceso',
    brand: 'StarkLock',
    price: 129.0,
    compareAtPrice: 159.0,
    stock: 74,
    rating: 4.6,
    reviews: 302,
    image:
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Cerradura electronica con pestillo automatico,.huella dactilar, codigo PIN, tarjeta NFC y control desde la aplicacion movil. Se adapta a cerraduras multipunto de 60-100mm y mantiene la apertura manual con llave mecanica de emergencia.',
    features: [
      'Huella + PIN + NFC + app movil',
      'Cilindro de acero anti-sacacubes con llave de emergencia',
      'Carga USB-C: hasta 12 meses de bateria',
      'Registro de 100 aperturas en la nube',
    ],
  
    flashSale: true,}),
  p({
    id: 'turnstile-control-presencia',
    sku: 'STK-ACC-2003',
    name: 'Turnstile de Control de Presencia con Sensor Facial',
    category: 'control-acceso',
    brand: 'StarkAccess',
    price: 689.0,
    compareAtPrice: 0,
    stock: 9,
    rating: 4.7,
    reviews: 34,
    image:
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=900&q=80',
    description:
      'Puerta peatonica de acceso rapido con reconocimiento facial 3D, lectura de documento y display OLED. Se integra con los controladores StarkAccess para registrar entradas y salidas en tiempo real.',
    features: [
      'Reconocimiento facial 3D con deteccion de vida',
      'Pantalla OLED de 5" con interfaz configurable',
      'Lectura QR / NFC / documento de identidad',
      'Indicador de sentido de paso (una o doble via)',
    ],
  }),
  p({
    id: 'videoportero-ip',
    sku: 'STK-ACC-2004',
    name: 'Videoportero IP 7" con Reconocimiento Facial',
    category: 'control-acceso',
    brand: 'StarkAccess',
    price: 219.0,
    compareAtPrice: 269.0,
    stock: 28,
    rating: 4.4,
    reviews: 112,
    image:
      'https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&w=900&q=80',
    description:
      'Placa de video con camara 2MP con vision nocturna, pantalla tactil de 7 pulgadas y apertura de puerta remota desde el movil. Despertador de puerta integrado con dos botones de timbre configurables.',
    features: [
      'Pantalla tactil capacitiva 7" 1024x600',
      'Camara 2MP con IR activo 10m',
      'Apertura de cerradura electrica desde la app',
      'Alimentation PoE o 12-24V DC',
    ],
  }),
  p({
    id: 'control-presencia-tarjeta',
    sku: 'STK-ACC-2005',
    name: 'Control de Presencia RFID 125kHz con Impresión de Huellas',
    category: 'control-acceso',
    brand: 'StarkAccess',
    price: 94.5,
    compareAtPrice: 119.0,
    stock: 91,
    rating: 4.3,
    reviews: 187,
    image:
      'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=900&q=80',
    description:
      'Terminal compacta para registrar la hora de entrada y salida del personal mediante tarjeta RFID, huella o PIN. Sincroniza por TCP/IP con el software de nomina StarkHR y exporta a Excel.',
    features: [
      'Capacidad de 3.000 usuarios y 200.000 registros',
      'Pantalla LCD con teclado capacitivo',
      'Ethernet + WiFi + USB para backup',
      'Descargue de registros por USB o TCP/IP',
    ],
  }),
  p({
    id: 'barrera-vehicular-metalica',
    sku: 'STK-ACC-2006',
    name: 'Barrera Vehicular Metalica 6m con Radar y Looping',
    category: 'control-acceso',
    brand: 'StarkAccess',
    price: 1180.0,
    compareAtPrice: 1390.0,
    stock: 4,
    rating: 4.8,
    reviews: 19,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Brazo basculante de aleacion de aluminio parastaller parking y(Stream) control vehicular. Incluye radar de microondas para antipasada, loops magneticos, fotoceldula de cierre y fuente de alimentacion industrial de 24V.',
    features: [
      'Brazo de 6 metros en aleacion de aluminio',
      'Radar UHF + doble loop magnetico',
      'Fotocelda y contacto de final de carrera',
      'Cierre automatico temporizado y manual',
    ],
  }),

  /* ---------------------------------------------------------
   * 3. REDES Y CONECTIVIDAD
   * --------------------------------------------------------- */
  p({
    id: 'router-wifi6e-tri-band',
    sku: 'STK-NET-3001',
    name: 'Router WiFi 6E Tri-Band AXE11000 con 2.5GbE',
    category: 'redes-conectividad',
    brand: 'StarkNet',
    price: 249.0,
    compareAtPrice: 329.0,
    stock: 38,
    rating: 4.8,
    reviews: 245,
    featured: true,
    flashSale: true,
    image:
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Router gaming y OfHome de nueva generacion con banda de 6 GHz, puerto 2.5GbE, 4 antenas externas y aceleracion de latencia para gaming. Cubre 300 m2 con clientes simultaneos de 200 dispositivos.',
    features: [
      'AXE11000: hasta 11.5 Gbps en agregado',
      'Banda 6 GHz para VR y streaming 8K',
      'Puerto WAN/LAN 2.5GbE + 4 x GbE',
      'Qualcomm Immersive Home WiFi 6E',
      'Control parental y QoS por dispositivo',
    ],
  }),
  p({
    id: 'switch-gestion-24puertos',
    sku: 'STK-NET-3002',
    name: 'Switch Gestionado L3 24 Puertos SFP+ 10G',
    category: 'redes-conectividad',
    brand: 'StarkNet',
    price: 689.0,
    compareAtPrice: 799.0,
    stock: 11,
    rating: 4.7,
    reviews: 58,
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Switch de capa 3 para backbone de empresa con 24 puertos GE, 4 puertos SFP+ 10G agregables, stack virtual, enrutamiento OSPF y BGP, y alimentacion redundante con ventilacion hot-swap.',
    features: [
      '24 x 10/100/1000 + 4 x SFP+ 10G',
      'Routing estatico y dinamico (OSPF, RIP, BGP)',
      'Stack virtual hasta 8 unidades',
      'Doble fuente de alimentacion redundante',
      'Gestion por consola, web, SSH y SNMPv3',
    ],
  }),
  p({
    id: 'access-point-wifi6-poe',
    sku: 'STK-NET-3003',
    name: 'Access Point WiFi 6 PoE+ Ceiling 2.4Gbps',
    category: 'redes-conectividad',
    brand: 'StarkNet',
    price: 149.0,
    compareAtPrice: 189.0,
    stock: 56,
    rating: 4.6,
    reviews: 139,
    image:
      'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=900&q=80',
    description:
      'Punto de acceso para instalacion Flush en falso techo con gestion centralizada en la nube, roaming rapido 802.11k/v/r y soporte PoE+ 802.3at. Entrega 2.4 Gbps con 200 clientes simultaneos.',
    features: [
      'AX3000 con agregacion de 2.4 + 5 GHz',
      'Alimentacion PoE+ (802.3at) por un solo cable',
      'Roaming rapido 802.11k/v/r',
      'Gestion centralizada y portal cautivo',
    ],
  }),
  p({
    id: 'mesh-wifi6-pack3',
    sku: 'STK-NET-3004',
    name: 'Sistema Mesh WiFi 6 Tri-Band 3 nodos AX5400',
    category: 'redes-conectividad',
    brand: 'StarkNet',
    price: 379.0,
    compareAtPrice: 449.0,
    stock: 23,
    rating: 4.5,
    reviews: 176,
    image:
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597055181300-e3633a917c9c?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Pack de tres nodos mesh que eliminan zonas muertas en viviendas de hasta 560 m2. Conmutacion inteligente entre bandas, roaming sin cortes y configuracion por app en menos de dos minutos.',
    features: [
      'AX5400 agregado por nodo (3 nodos)',
      'Cobertura total hasta 560 m2',
      'Ethernet backhaul opcional por cable',
      'Un solo nombre SSID para todas las bandas',
    ],
  }),
  p({
    id: 'poe-injector-switch-8puertos',
    sku: 'STK-NET-3005',
    name: 'Switch PoE+ Gestionado 8 Puertos 120W + 2 SFP',
    category: 'redes-conectividad',
    brand: 'StarkNet',
    price: 289.0,
    compareAtPrice: 349.0,
    stock: 27,
    rating: 4.6,
    reviews: 64,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
    description:
      'Switch ideal para desplegar camaras IP y puntos de acceso en una sola instalacion: 8 puertos PoE+ de 30W, presupuesto total de 120W, 2 puertos SFP y alimentacion PoE redundante de 230W.',
    features: [
      '8 puertos PoE+ 802.3at (30W por puerto)',
      'Presupuesto PoE total de 120W',
      '2 puertos SFP para uplink de 1G',
      'Fuente redundante 230W con deteccion',
    ],
  }),
  p({
    id: 'cable-cat6a-lote-305m',
    sku: 'STK-NET-3006',
    name: 'Bobina Cable UTP Cat6A 305m LSZH con Patch Panel',
    category: 'redes-conectividad',
    brand: 'StarkNet',
    price: 219.0,
    compareAtPrice: 269.0,
    stock: 40,
    rating: 4.7,
    reviews: 92,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    description:
      'Kit de instalacion de red para obra: bobina de 305 m de cable UTP Cat6A 23AWG LSZH (sin halogeno), panel de parcheo de 24 puertos, 24 keystone Cat6A y 5 m de patch cord para rack.',
    features: [
      'Cat6A 10GBASE-T hasta 100 m',
      'Cubierta LSZH sin halogeno para interiores',
      'Panel de parcheo modular 24 puertos',
      '24 keystone Cat6A con escudo',
    ],
  }),

  /* ---------------------------------------------------------
   * 4. SMART HOME Y DOMOTICA
   * --------------------------------------------------------- */
  p({
    id: 'hub-domotico-zigbee',
    sku: 'STK-HOM-4001',
    name: 'Hub Domotico Zigbee 3.0 Matter Thread PoE',
    category: 'smart-home',
    brand: 'StarkHome',
    price: 179.0,
    compareAtPrice: 219.0,
    stock: 44,
    rating: 4.7,
    reviews: 198,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Centro de control domotico compatible con Zigbee 3.0, Thread, Matter y Z-Wave. Automatiza hasta 200 dispositivos, funciona como hub Zigbee externo y ofrece control local (sin nube) con WebApp propia.',
    features: [
      'Zigbee 3.0 + Thread + Matter + Z-Wave',
      'Hasta 200 dispositivos emparejados',
      'Control local sin dependencia de la nube',
      'Alimentacion PoE o USB-C',
      'Escenas y automatizaciones por horario/sensor',
    ],
  }),
  p({
    id: 'kit-bombillas-rgb',
    sku: 'STK-HOM-4002',
    name: 'Kit 4 Bombillas LED RGBW Zigbee 16 Millones de Colores',
    category: 'smart-home',
    brand: 'StarkHome',
    price: 89.0,
    compareAtPrice: 119.0,
    stock: 86,
    rating: 4.6,
    reviews: 412,
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Set de cuatro bombillas E27 con chip LED RGB+CCT regulable de 2700K a 6500K. Control por app, Alexa, Google Home o Zigbee2MQTT con escena de color, temporizadores y sincronizacion musical.',
    features: [
      'RGBW + CCT 2700K-6500K regulable',
      '16 millones de colores con indice Ra>90',
      'Control local por Zigbee (no requiere hub)',
      'Escenas, sunrise/sunset y modo musica',
    ],
  }),
  p({
    id: 'termostato-inteligente',
    sku: 'STK-HOM-4003',
    name: 'Termostato Inteligente WiFi con Sensor Externo',
    category: 'smart-home',
    brand: 'StarkHome',
    price: 79.0,
    compareAtPrice: 99.0,
    stock: 67,
    rating: 4.4,
    reviews: 156,
    image:
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=900&q=80',
    description:
      'Termostato con pantalla TFT a color, programacion semanal, curva de calentamiento y deteccion de ventana abierta. Funciona con suelo radiante,Split y calderas, y aprende los habitos de ocupacion.',
    features: [
      'Pantalla TFT 3.5" a color',
      'Programacion semanal y modo ECO inteligente',
      'Deteccion de ventana abierta',
      'Compatible conAlexa, Google Home y Matter',
    ],
  }),
  p({
    id: 'aspiradora-robotica',
    sku: 'STK-HOM-4004',
    name: 'Aspiradora Robotica con LiDAR 5000Pa y Base Autolavado',
    category: 'smart-home',
    brand: 'StarkHome',
    price: 429.0,
    compareAtPrice: 529.0,
    stock: 19,
    rating: 4.7,
    reviews: 221,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Robot aspirador con LiDAR de 360 grados, 5000Pa de succion, fregado con autolavado en la base y vaciado automatico del deposito. Mapeo por habitacion, zonas prohibidas y reconocimiento de objetos.',
    features: [
      'LiDAR de 360 grados con mapeo multi-habitacion',
      '5000Pa de potencia y rodillos antigiro',
      'Base con autolavado y vaciado automatico',
      'Navegacion con deteccion de obstaculos 3D',
    ],
  }),
  p({
    id: 'kit-camaras-smarthome',
    sku: 'STK-HOM-4005',
    name: 'Kit 2 Camaras Smart Home 2K con Hub y Alarma',
    category: 'smart-home',
    brand: 'StarkHome',
    price: 149.0,
    compareAtPrice: 189.0,
    stock: 35,
    rating: 4.5,
    reviews: 203,
    image:
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80',
    description:
      'Pack de dos camaras interiores 2K con hub Zigbee que funcionan sin internet localmente. Alarma de movimiento,vision nocturna automatica, sirena de 95 dB y clips guardados en microSD o en la nube.',
    features: [
      '2 camaras 2K + hub Zigbee',
      'Funcionamiento local sin internet',
      'Alarma de movimiento con sirena de 95 dB',
      'Almacenamiento en microSD 256GB opcional',
    ],
  
    flashSale: true,}),
  p({
    id: 'tira-led-smart-10m',
    sku: 'STK-HOM-4006',
    name: 'Tira LED Smart WiFi RGBIC 10m 1200 LEDs',
    category: 'smart-home',
    brand: 'StarkHome',
    price: 39.0,
    compareAtPrice: 54.0,
    stock: 120,
    rating: 4.3,
    reviews: 508,
    image:
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Tira LED direccional RGBIC con 1200 LEDS por metro y 10 metros de longitud. Genera efectos de gradiente por segmento, se divide en zonas independientes y se controla por voz o mediante automatizaciones.',
    features: [
      'RGBIC con 10 zonas independientes',
      '1200 LEDS/m y 24V de alimentacion',
      'Sincronizacion con musica y pantalla',
      'Control por app, voz y Matter',
    ],
  }),

  /* ---------------------------------------------------------
   * 5. ALMACENAMIENTO Y NAS
   * --------------------------------------------------------- */
  p({
    id: 'nas-4-bahias',
    sku: 'STK-STO-5001',
    name: 'Servidor NAS 4 Bahias Intel Celeron J4125 Gigabit',
    category: 'almacenamiento-nas',
    brand: 'StarkStore',
    price: 549.0,
    compareAtPrice: 649.0,
    stock: 14,
    rating: 4.8,
    reviews: 132,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'NAS de 4 bahias con CPU Intel Celeron J4125 quad-core, 4GB RAM ampliable a 16GB, 2 puertos Gigabit con agregacion de enlaces y 2 puertos USB 3.2. Soporta RAID 0/1/5/6/10, ZFS y cifrado AES-256.',
    features: [
      'CPU J4125 quad-core 2.4 GHz',
      '4 bahias SATA 3 de 3.5"/2.5"',
      'RAID 0/1/5/6/10, SHR y ZFS',
      'Cifrado AES-256 con llave hardware',
      'Expansion a 8 bahias con unidad de expansion',
    ],
  }),
  p({
    id: 'disco-hdd-enterprise-8tb',
    sku: 'STK-STO-5002',
    name: 'Disco Duro Enterprise 8TB 7200RPM 256MB Cache',
    category: 'almacenamiento-nas',
    brand: 'StarkStore',
    price: 189.0,
    compareAtPrice: 229.0,
    stock: 62,
    rating: 4.8,
    reviews: 287,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Unidad de 8TB clase enterprise designed para videovigilancia 24/7 con workload rating 180TB/año, CMR real, 256MB de cache y tecnologia de helicidad para baja altura 3.5". Tres años de garantia de fabrica.',
    features: [
      '8TB con registro CMR real (no SMR)',
      'Workload 180TB/ano para videovigilancia',
      '256MB de cache y RAM DDR4',
      'Garantia de 3 anos',
    ],
  }),
  p({
    id: 'ssd-nvme-2tb',
    sku: 'STK-STO-5003',
    name: 'SSD NVMe PCIe 4.0 2TB 7000MB/s con Disipador',
    category: 'almacenamiento-nas',
    brand: 'StarkStore',
    price: 279.0,
    compareAtPrice: 329.0,
    stock: 48,
    rating: 4.9,
    reviews: 356,
    image:
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580913428023-02c695666d61?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Unidad NVMe Gen4 con controlador de nueva generacion, 2TB de capacidad TLC y celdas NAND de 3D de 176 capas. Ideal como cache de lectura para NAS o como disco de sistema en estaciones de edicion.',
    features: [
      'PCIe 4.0 x4 hasta 7000 MB/s lectura',
      '2TB con NAND TLC de 176 capas',
      'Disipador de aluminio grafeno incluido',
      'Endurance de 1200 TBW',
    ],
  
    flashSale: true,}),
  p({
    id: 'rack-nas-8u',
    sku: 'STK-STO-5004',
    name: 'NAS de Rack 8U 24 Bahias SAS3 con Doble Controlador',
    category: 'almacenamiento-nas',
    brand: 'StarkStore',
    price: 3490.0,
    compareAtPrice: 3990.0,
    stock: 3,
    rating: 4.9,
    reviews: 21,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1580913428023-02c695666d61?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Storage enterprise de 24 bahias SAS3 12G con controlador dual activo, 4 puertos mini-SAS por controlador y hasta 1.2 PB utiles en RAID 6. Cache de escritura con proteccion contra corte de energia y expansion modular.',
    features: [
      '24 bahias SAS3 12Gb/s',
      'Doble controlador con failover instantaneo',
      'Cache de escritura con BBU/Supercap',
      'Escalable hasta 60 bahias',
    ],
  }),
  p({
    id: 'rack-externo-4u',
    sku: 'STK-STO-5005',
    name: 'Caja de Expansion Externa 4U para 24 Discos SAS',
    category: 'almacenamiento-nas',
    brand: 'StarkStore',
    price: 1290.0,
    compareAtPrice: 1490.0,
    stock: 6,
    rating: 4.6,
    reviews: 17,
    image:
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580913428023-02c695666d61?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Gabinete de expansion JBOD 4U con 24 bahias SAS3, dos-expansores de puerto y ventiladores redundantes hot-swap. Se encadena al NAS de rack para ampliar capacidad sin migrar datos.',
    features: [
      '24 bahias SAS3 12Gb/s hot-swap',
      'Expansores de puerto con cascada',
      'Ventiladores y fuentes redundantes',
      'Gestion desde el NAS anfitrion',
    ],
  }),
  p({
    id: 'memoria-ram-ddr5-32gb',
    sku: 'STK-STO-5006',
    name: 'Modulo Memoria RAM DDR5 32GB 6000MHz RGB',
    category: 'almacenamiento-nas',
    brand: 'StarkStore',
    price: 119.0,
    compareAtPrice: 149.0,
    stock: 73,
    rating: 4.7,
    reviews: 241,
    image:
      'https://images.unsplash.com/photo-1580913428023-02c695666d61?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Kit de 2 modulos DDR5 16GB con perfil XMP EXPO, disipador de aluminio con difusor RGB y Chips B-die de alta calidad. Pensado para NAS, servidores y plataformas AM5 de alta gama.',
    features: [
      '2 x 16GB DDR5 6000 MT/s',
      'Perfiles XMP 3.0 y AMD EXPO',
      'Disipador aluminum con RGB direccionable',
      '1.1V con enrutamiento optimizado para servidor',
    ],
  }),

  /* ---------------------------------------------------------
   * 6. COMPONENTES DE PC HIGH-END
   * --------------------------------------------------------- */
  p({
    id: 'gpu-rtx-4080-super',
    sku: 'STK-CMP-6001',
    name: 'GPU NVIDIA RTX 4080 SUPER 16GB GDDR6X',
    category: 'componentes-pc',
    brand: 'StarkCore',
    price: 1099.0,
    compareAtPrice: 1299.0,
    stock: 12,
    rating: 4.9,
    reviews: 189,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Tarjeta grafica de 16GB con arquitectura Ada Lovelace, DLSS 3 y trazado de rayos de tercera generacion. Ideal para renderizado 3D, gaming en 4K a 144Hz y3090Train_x Stable Diffusion en local.',
    features: [
      '16GB GDDR6X en bus de 256 bits',
      'DLSS 3 con generacion de frames',
      '3 ventiladores Axial-tech con flujo optimizado',
      'Alimentacion recomendada de 750W',
      'NVENC de 8oStream AV1 de 2a generacion',
    ],
  }),
  p({
    id: 'cpu-ryzen-9-7950x',
    sku: 'STK-CMP-6002',
    name: 'Procesador AMD Ryzen 9 7950X 16-Core 5.7GHz AM5',
    category: 'componentes-pc',
    brand: 'StarkCore',
    price: 549.0,
    compareAtPrice: 649.0,
    stock: 16,
    rating: 4.9,
    reviews: 274,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Dieciseis nucleos Zen 4 con boost de 5.7 GHz, socket AM5, memoria DDR5 en canal doble y TDP de 170W. La opcion preferida para renderizado, compilacion y streaming simultaneo.',
    features: [
      '16 nucleos / 32 hilos Zen 4',
      'Boost hasta 5.7 GHz, cache L3 de 64MB',
      'Socket AM5 con soporte DDR5-5600',
      'PCIe 5.0 de 28 lineas',
    ],
  }),
  p({
    id: 'placa-madre-x670e',
    sku: 'STK-CMP-6003',
    name: 'Motherboard X670E Hero 4 Slots M.2 PCIe 5.0 WiFi 6E',
    category: 'componentes-pc',
    brand: 'StarkCore',
    price: 429.0,
    compareAtPrice: 499.0,
    stock: 9,
    rating: 4.8,
    reviews: 87,
    image:
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Plata base AM5 de gama alta con 4 slots M.2 (dos con PCIe 5.0 x4), VRM de 18 fases, Thunderbolt 4 y WiFi 6E. Soporta 128GB DDR5 y configuracion de memoria de cuatro DIMM para servidores.',
    features: [
      'Chipset AMD X670E con 18+2 fases',
      '4 x M.2: 2 con PCIe 5.0 x4',
      'Thunderbolt 4 y USB4 integrated',
      'WiFi 6E 2.4/5/6 GHz + BT 5.3',
      'Q-Flash Plus sin CPU para BIOS recovery',
    ],
  }),
  p({
    id: 'fuente-850w-gold',
    sku: 'STK-CMP-6004',
    name: 'Fuente de Poder 850W 80 PLUS Gold Full Modular',
    category: 'componentes-pc',
    brand: 'StarkCore',
    price: 189.0,
    compareAtPrice: 229.0,
    stock: 33,
    rating: 4.8,
    reviews: 198,
    image:
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Fuente modular de 850W con certificacion 80 PLUS Gold, proteccion completa contra sobretension, cortocircuito y sobrecalentamiento, y ventilated hybrid semiguanica silenciosa bajo carga.',
    features: [
      '850W continuos, pico de 1000W',
      '80 PLUS Gold con 90% de eficiencia',
      'Cables modulares completos (2x 8 pin CPU)',
      'Proteccion OVP/OCP/OPP/SCP/UVP',
      'Topologia LLC de baja ripple',
    ],
  }),
  p({
    id: 'refrigeracion-liquida-360',
    sku: 'STK-CMP-6005',
    name: 'Refrigeracion Liquida 360mm AIO con Ventiladores RGB',
    category: 'componentes-pc',
    brand: 'StarkCore',
    price: 229.0,
    compareAtPrice: 279.0,
    stock: 21,
    rating: 4.7,
    reviews: 156,
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'AIO de 360mm con bomba de alta velocidad, radiador de cobre con 27 aletas y tres ventiladores de 120mm con iluminacion ARGB direccionable. Bloque de cobre nickel-plated con sensor de temperatura.',
    features: [
      'Radiador de 360mm de aluminio con cobre',
      '3 ventiladores FDB de 120mm con ARGB',
      'Bomba silenciosa de 2900 RPM',
      'Soporte universal AM5 / LGA1700 / LGA1200',
    ],
  }),
  p({
    id: 'kit-pc-completo-ryzen',
    sku: 'STK-CMP-6006',
    name: 'PC Completo Gaming Ryzen 7 + RTX 4070 32GB 1TB',
    category: 'componentes-pc',
    brand: 'StarkCore',
    price: 1899.0,
    compareAtPrice: 2199.0,
    stock: 5,
    rating: 4.9,
    reviews: 63,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Equipo gaming completo y listo para usar: Ryzen 7 7700X, RTX 4070 Super 12GB, 32GB DDR5 6000, SSD NVMe 1TB, fuente 750W Gold, refrigeración AIO 240mm y caja con panel de vidrio templado.',
    features: [
      'AMD Ryzen 7 7700X 8-Core 5.4 GHz',
      'RTX 4070 SUPER 12GB con DLSS 3',
      '32GB DDR5 6000 y SSD NVMe 1TB PCIe 4.0',
      'Fuente 750W 80 PLUS Gold y AIO 240mm',
      'Garantia de 3 anos en tienda',
    ],
  }),

  /* ---------------------------------------------------------
   * 7. PERIFERICOS GAMING
   * --------------------------------------------------------- */
  p({
    id: 'mouse-gaming-inalambrico',
    sku: 'STK-PER-7001',
    name: 'Mouse Gaming Inalambrico 26K DPI Sensor Optico',
    category: 'perifericos-gaming',
    brand: 'StarkGear',
    price: 79.0,
    compareAtPrice: 99.0,
    stock: 58,
    rating: 4.8,
    reviews: 324,
    featured: true,
    flashSale: true,
    image:
      'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Mouse wireless de 58 gramos con sensor optico de 26.000 DPI, polling de 8000 Hz y 70 horas de bateria. Sensor de 1% de desviacion y switches opticos de 100 millones de clics.',
    features: [
      'Sensor optico 26000 DPI con tracking 650 IPS',
      'Polling rate de 8000 Hz',
      '58g de peso con chassis honeycomb',
      '70 horas de bateria con RGB apagado',
      'Switches opticos de 100M clics',
    ],
  }),
  p({
    id: 'teclado-mecanico-rgb',
    sku: 'STK-PER-7002',
    name: 'Teclado Mecanico 75% Hot-Swap RGB PBT',
    category: 'perifericos-gaming',
    brand: 'StarkGear',
    price: 129.0,
    compareAtPrice: 159.0,
    stock: 42,
    rating: 4.9,
    reviews: 411,
    featured: true,
    flashSale: true,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Teclado mecanico de formato 75% con gasket mount, hot-swap de 3/5 pines, teclas PBT doble shot y RGB por tecla. Tri-mode: USB-C con cable, Bluetooth 5.1 y dongle 2.4 GHz.',
    features: [
      'Formato 75% con knob rotatorio multi-funcion',
      'Gasket mount + 5 capas de espuma',
      'Switches hot-swap 3/5 pines',
      'Keycaps PBT double-shot shine-through',
      'Tri-mode: cable, 2.4 GHz y Bluetooth',
    ],
  }),
  p({
    id: 'audifonos-gaming-anc',
    sku: 'STK-PER-7003',
    name: 'Audifonos Gaming 7.1 Surround con Microfono Retractable',
    category: 'perifericos-gaming',
    brand: 'StarkGear',
    price: 89.0,
    compareAtPrice: 119.0,
    stock: 50,
    rating: 4.5,
    reviews: 287,
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Audifonos gaming con sonido virtual 7.1, controladores de 50mm de neodimio y microfono retrractable con cancelacion de ruido. Almohadillas de espuma viscoelastica con memoria para uso prolongado.',
    features: [
      'Sonido virtual 7.1 Surround via USB',
      'Drivers de 50mm neodimio',
      'Microfono retratable con cancelacion de ruido',
      'Conexion tri-mode (USB, 3.5mm, BT)',
      'Control de volumen y mic en el cable',
    ],
  }),
  p({
    id: 'monitor-gaming-27-165hz',
    sku: 'STK-PER-7004',
    name: 'Monitor Gaming 27" 2560x1440 165Hz IPS 1ms',
    category: 'perifericos-gaming',
    brand: 'StarkDisplay',
    price: 349.0,
    compareAtPrice: 429.0,
    stock: 26,
    rating: 4.7,
    reviews: 198,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Panel IPS de 27 pulgadas con 1440p, 165Hz y 1ms de tiempo de respuesta. Compatible con G-Sync y FreeSync, 95% de cobertura DCI-P3, ergonomia completa y hub USB en el marco.',
    features: [
      '27" IPS 2560x1440 a 165Hz',
      '1ms GtG con FreeSync Premium / G-Sync',
      '95% DCI-P3 y HDR400',
      'Hub USB 3.0 y KVM integrado',
      'Ergonomia completa con pivote 360 grados',
    ],
  }),
  p({
    id: 'silla-gaming-ergonomica',
    sku: 'STK-PER-7005',
    name: 'Silla Gaming Ergonomica con Apoyabrazos 4D y Pies',
    category: 'perifericos-gaming',
    brand: 'StarkGear',
    price: 289.0,
    compareAtPrice: 379.0,
    stock: 17,
    rating: 4.6,
    reviews: 134,
    image:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Silla ergonomica con estructura de acero, tapizado en tela de alta resistencia con malla de resina, lumbar ajustable y reposapies retráctil. Capacidad de hasta 150 kg con columna de gas clase 4.',
    features: [
      'Estructura de acero con acabado antiarrayaduras',
      'Respaldo de malla respirable +memory foam',
      'Apoyabrazos 4D ajustables en 4 ejes',
      'Columna de gas clase 4 y reclinacion 135 grados',
      'Reposapies retráctil y cinturon lumbar',
    ],
  }),
  p({
    id: 'control-juego-wireless',
    sku: 'STK-PER-7006',
    name: 'Control Inalambrico Pro 2G Hats + Triggers Haptic',
    category: 'perifericos-gaming',
    brand: 'StarkGear',
    price: 69.0,
    compareAtPrice: 89.0,
    stock: 64,
    rating: 4.5,
    reviews: 156,
    image:
      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Mando con Hats conmutables, disparadores analogicos hapticos y 4 botones traseros programables. Conectividad USB-C, Bluetooth y dongle 2.4 GHz, con bateria de 30 horas y vibracion dual.',
    features: [
      'Triggers analogicos con motor haptico',
      '2 Hats conmutables (mouse click / stick)',
      '4 botones traseros asignables',
      'USB-C, Bluetooth 5.0 y 2.4 GHz',
      '30 horas de bateria y pads reemplazables',
    ],
  }),

  /* ---------------------------------------------------------
   * 8. ENERGIA Y RESPALDO UPS
   * --------------------------------------------------------- */
  p({
    id: 'ups-online-3kva',
    sku: 'STK-PWR-8001',
    name: 'UPS Online 3kVA 3000W Rack 2U con SNMP',
    category: 'energia-ups',
    price: 899.0,
    compareAtPrice: 1090.0,
    stock: 12,
    rating: 4.9,
    reviews: 76,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'UPS online de doble conversion para servidores y videovigilancia: salida senoidal pura, 3kVA/3000W, bateria interna de hasta 30 minutos y tarjetas de red SNMP para monitoreo remoto.',
    features: [
      '3kVA / 3000W con onda senoidal pura',
      'Tecnología online de doble conversion',
      'Autonomia de hasta 30 min a media carga',
      'Tarjeta SNMP y puerto USB para monitoreo',
      'Formador de bateria 3.7 en modo UPS',
    ],
  }),
  p({
    id: 'ups-line-interactive-1500va',
    sku: 'STK-PWR-8002',
    name: 'UPS Line Interactive 1500VA 900W con AVR Display LCD',
    category: 'energia-ups',
    price: 219.0,
    compareAtPrice: 279.0,
    stock: 38,
    rating: 4.6,
    reviews: 165,
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'UPS de linea interactiva con regulacion automatica de voltaje (AVR), 6 contactos de salida y 2 contactos USB de carga. Protegeulservidores, NVR, routers y equipos de escritorio contra cortes de energia.',
    features: [
      '1500VA / 900W con AVR',
      'Autonomia de hasta 55 min a 100W',
      '6 tomacorrientes con proteccion contra picos',
      '2 puertos USB de carga',
      'Display LCD con estado de bateria en tiempo real',
    ],
  }),
  p({
    id: 'panel-solar-400w',
    sku: 'STK-PWR-8003',
    name: 'Panel Solar 400W Monocristalino IP65 con Inversor',
    category: 'energia-ups',
    price: 749.0,
    compareAtPrice: 899.0,
    stock: 15,
    rating: 4.7,
    reviews: 58,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Kit solar autonomo para cargas de seguridad: panel monocristalino de 400W con marco de aluminio, inversor hibrido MPPT de 2.4kW, controlador y cables con conectores MC4 impermeables.',
    features: [
      '400W monocristalino con eficiencia >21%',
      'Inversor hibrido MPPT de 2.4 kW',
      'Proteccion IP65 con vidrio templado antichaparrin',
      'Cables de 5 m con conectores MC4',
      'Optimiza la carga solar hasta 99% de eficiencia MPPT',
    ],
  }),
  p({
    id: 'bateria-litio-200ah',
    sku: 'STK-PWR-8004',
    name: 'Bateria de Litio LiFePO4 12V 200Ah con BMS',
    category: 'energia-ups',
    price: 1249.0,
    compareAtPrice: 1450.0,
    stock: 8,
    rating: 4.8,
    reviews: 42,
    image:
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Banco de baterias LiFePO4 de 12V 200Ah (2.56 kWh) con BMS integrado de 100A. 6000 ciclos, profundidad de descarga del 90% sin danio y vida util de 10 anos. Ideal para respaldo de centros de datos y videovigilancia.',
    features: [
      '12V 200Ah LiFePO4 = 2.56 kWh',
      'BMS integrado con proteccion completa',
      'Mas de 6000 ciclos de carga',
      'Profundidad de descarga segura del 90%',
      'Comunicacion RS485 opcional para monitoreo',
    ],
  }),
  p({
    id: 'estabilizador-3000va',
    sku: 'STK-PWR-8005',
    name: 'Estabilizador de Voltaje 3000VA 12 Salidas con AVR',
    category: 'energia-ups',
    price: 159.0,
    compareAtPrice: 189.0,
    stock: 27,
    rating: 4.3,
    reviews: 112,
    image:
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Regulador electronico de linea para equipos sensibles con 3000VA, 12 tomacorrientes (8 con supresor), proteccion contra sobretension y LED de estado. Alterna automaticamente a la bateria interna ante cortes.',
    features: [
      '3000VA regulados de forma precisa',
      '12 tomacorrientes con filtro de picos',
      'Bateria interna de respaldo',
      'Retardo de reenciendido de 3 segundos',
    ],
  }),
  p({
    id: 'placa-solar-portatil-200w',
    sku: 'STK-PWR-8006',
    name: 'Panel Solar Portatil 200W Plegable para Camping y Seguridad',
    category: 'energia-ups',
    price: 289.0,
    compareAtPrice: 349.0,
    stock: 23,
    rating: 4.6,
    reviews: 134,
    image:
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Panel plegable monocristalino de 200W con cuatro pliegues,Pesado de 6.8 kg y controlador MPPT con dos salidas USB QC3.0. Se conecta directamente a la bateria de litio del kit solar autonomo.',
    features: [
      '200W plegable en 4 paneles',
      'Controlador MPPT con salida USB-C PD',
      'Peso de 6.8 kg con asa de transporte',
      'Cierre magnetico y funda de transporte incluida',
      'Resistencia al agua IP54',
    ],
  }),

  /* ---------------------------------------------------------
   * 9. DRONES DE MONITOREO
   * --------------------------------------------------------- */
  p({
    id: 'dron-termico-inspeccion',
    sku: 'STK-DRN-9001',
    name: 'Dron de Inspeccion Termica con Camara 640x512',
    category: 'drones-monitoreo',
    brand: 'StarkAir',
    price: 8490.0,
    compareAtPrice: 9990.0,
    stock: 3,
    rating: 4.9,
    reviews: 27,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Plataforma aerea para inspeccion de infraestructura energetica: camara termica radiometrica 640x512, sensor RGB de 48MP, gimbal de 3 ejes y vuelo de hasta 42 minutos con transmision de video O3 a 15 km.',
    features: [
      'Termica 640x512 con lectura de temperatura por pixel',
      'Sensor RGB de 48MP con zoom optico',
      'Gimbal mecanico de 3 ejes',
      '42 minutos de vuelo y transmision O3 15 km',
      'Resistencia al viento de hasta 10.7 m/s',
    ],
  }),
  p({
    id: 'dron-seguridad-4k',
    sku: 'STK-DRN-9002',
    name: 'Dron de Seguridad 4K con Sensor de Obstaculos 360',
    category: 'drones-monitoreo',
    brand: 'StarkAir',
    price: 1290.0,
    compareAtPrice: 1499.0,
    stock: 11,
    rating: 4.7,
    reviews: 68,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Quadcopter plegable para vigilancia perimetral: camara 4K con estabilizacion de 3 ejes, sensor de obstaculos omnidireccional, retorno automatico y vuelo programado por waypoints de patrolaje.',
    features: [
      'Camara 4K/30fps con gimbal de 3 ejes',
      'Sensores de obstaculos omnidireccionales',
      '31 minutos de vuelo por bateria',
      'Radar DJI con transmision de 10 km',
      'Ruta de patrulla automatica con waypoints',
    ],
  }),
  p({
    id: 'dron-thermal-inalambrico',
    sku: 'STK-DRN-9003',
    name: 'Drone Termico Compacto para Busqueda y Rescate',
    category: 'drones-monitoreo',
    brand: 'StarkAir',
    price: 3290.0,
    compareAtPrice: 3690.0,
    stock: 6,
    rating: 4.8,
    reviews: 39,
    image:
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Plataforma termica de bolsillo para brigadas de rescate y mantenimiento industrial: sensor 320x240 con NETD < 50mK, estabilizacion en 3 ejes y busqueda automatica de personas por firma termica.',
    features: [
      'Termica 320x240 NETD < 50mK',
      'Zoom digital 8x con modo dual (RGB + termico)',
      'Bateria de 34 minutos y carga rapida 90 min',
      'Deteccion automatica de firma humana',
      'Peso de 920 g con protecciones plegables',
    ],
  }),
  p({
    id: 'gimbal-estabilizador-4k',
    sku: 'STK-DRN-9004',
    name: 'Gimbal Estabilizador 3 Ejes para Camara 4K con GPS',
    category: 'drones-monitoreo',
    brand: 'StarkAir',
    price: 419.0,
    compareAtPrice: 489.0,
    stock: 19,
    rating: 4.6,
    reviews: 54,
    image:
      'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Gimbal de 3 ejes motorizado con estabilizacion hibrida para camaras compactas de hasta 1.5 kg. Follow mode con reconocimiento de rostro, control por Bluetooth y transmision de video HD a 2.4 GHz.',
    features: [
      'Capacidad de carga de 1.5 kg',
      'Estabilizacion hibrida de 3 ejes (±0.01 grados)',
      'Seguimiento de objetos con reconocimiento facial',
      'Transmision de video HD a 2.4 GHz',
      'Autonomia de 12 horas con bateria interna',
    ],
  }),
  p({
    id: 'kit-dron-fpv-vigilancia',
    sku: 'STK-DRN-9005',
    name: 'Kit Drone FPV 4K con Gafas y Control para Vigilancia',
    category: 'drones-monitoreo',
    brand: 'StarkAir',
    price: 949.0,
    compareAtPrice: 1149.0,
    stock: 14,
    rating: 4.5,
    reviews: 87,
    image:
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Kit FPV completo para operacion en primera persona: dron de 5 pulgadas, camara 4K, RF con monitor OLED, dos baterias, cargador rapido y Correa de pecho. Ideal para inspeccion de estructuras cercanas.',
    features: [
      'Dron 5" con camara 4K y motor brushless',
      'Radio control con monitor OLED de 5.8 GHz',
      '3 baterías LiPo 6S y cargador enracado',
      'Gafas FPV opcionales incluidas',
      'Protecciones de helices y luz LED de/search',
    ],
  }),
  p({
    id: 'bateria-drone-inteligente',
    sku: 'STK-DRN-9006',
    name: 'Bateria Inteligente de Dron 6S 22.2V 5000mAh',
    category: 'drones-monitoreo',
    brand: 'StarkAir',
    price: 149.0,
    compareAtPrice: 179.0,
    stock: 44,
    rating: 4.7,
    reviews: 73,
    image:
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Bateria LiPo de 6 celdas con BMS inteligente que informa ciclos, temperatura y nivel de carga al controlador. Carga rapida de 90 minutos en el cargador de multiple bahia.',
    features: [
      '6S 22.2V 5000mAh LiPo',
      'BMS con conteo de ciclos y temperatura',
      'Carga rapida en 90 minutos',
      'Descarga de hasta 100C',
      'Compatible con drones de inspeccion StarkAir',
    ],
  }),

  /* ---------------------------------------------------------
   * 10. MONITORES INDUSTRIALES
   * --------------------------------------------------------- */
  p({
    id: 'monitor-industrial-ip65',
    sku: 'STK-MON-1001',
    name: 'Monitor Industrial 21.5" IP65 Full HD con HDMI/VGA',
    category: 'monitores-industriales',
    brand: 'StarkVision',
    price: 389.0,
    compareAtPrice: 469.0,
    stock: 16,
    rating: 4.6,
    reviews: 61,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Monitor industrial de 21.5 pulgadas con chasis de acero, panel IP65 frontal y Wide Temperature (-20C a 70C). Conectividad HDMI, VGA, DVI y USB, maspeakers integrados y bracket VESA de 100x100.',
    features: [
      'Panel IPS 1920x1080 con 500 nits',
      'Frontal IP65 con chasis de acero',
      'Rango de operacion -20C a 70C',
      'HDMI, VGA, DVI-D y 2x USB',
      'Montaje VESA 100x100 y audio integrado',
    ],
  }),
  p({
    id: 'monitor-videovigilancia-4k',
    sku: 'STK-MON-1002',
    name: 'Monitor 27" 4K para Centro de Videovigilancia',
    category: 'monitores-industriales',
    brand: 'StarkVision',
    price: 649.0,
    compareAtPrice: 799.0,
    stock: 9,
    rating: 4.8,
    reviews: 44,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Pantalla 4K de 27 pulgadas para salas de control con 400 nits, soporte VESA de 4 Investment, Picture-by-Picture de hasta 4 senales simultaneas y audio integrado de 2x5W.',
    features: [
      '27" 3840x2160 con 400 nits',
      'Picture-by-Picture de 4 entradas',
      'Latencia de 4ms para multiples senales',
      'Soporte VESA 100x100 / 75x75',
      'Audio 2x5W y auto-deteccion de senal',
    ],
  }),
  p({
    id: 'panel-tactil-industrial',
    sku: 'STK-MON-1003',
    name: 'Panel Tactil Industrial 15" IP69K con Puerto Serial RS232',
    category: 'monitores-industriales',
    brand: 'StarkVision',
    price: 899.0,
    compareAtPrice: 1090.0,
    stock: 5,
    rating: 4.7,
    reviews: 23,
    image:
      'https://images.unsplash.com/photo-1616763355603-9755a640a287?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'HMI industrial con pantalla tactil capacitiva de 15 pulgadas, frontal IP69K lavable con chorro de alta presion y conectividad RS232/USB/HDMI. Se integra con PLC y sistemas SCADA de control de acceso.',
    features: [
      'Pantalla tactil capacitiva 15" 1024x768',
      'Frontal IP69K resistente a chorro de alta presion',
      'RS232, USB Host/Device y HDMI',
      'Alimentacion 12-24V DC con proteccion de inversion',
      'Compatible con software SCADA de las principales marcas',
    ],
  }),
  p({
    id: 'monitor-panoramico-ultrawide',
    sku: 'STK-MON-1004',
    name: 'Monitor Ultrawide 34" 3440x1440 Curvo para Centro de Control',
    category: 'monitores-industriales',
    brand: 'StarkVision',
    price: 579.0,
    compareAtPrice: 699.0,
    stock: 13,
    rating: 4.7,
    reviews: 78,
    image:
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Pantalla panoramica 34 pulgadas curvada 1500R para surveillance y panos de videovigilancia con 21:9 y multiples ventanas simultaneas. Brillo de 400 nits, HDMI 2.0 y DisplayPort 1.4 con MST en cadena.',
    features: [
      '34" curvo 1500R en formato 21:9',
      '3440x1440 con 400 nits',
      'Split-screen en 4 ventanas simultaneas',
      'DisplayPort 1.4 MST y HDMI 2.0',
      'Filtro de luz azul y modo sin parpadeo',
    ],
  }),
  p({
    id: 'monitor-alta-luminosidad',
    sku: 'STK-MON-1005',
    name: 'Monitor Solar 1500 nits 10.1" para Exterior',
    category: 'monitores-industriales',
    brand: 'StarkVision',
    price: 1290.0,
    compareAtPrice: 1490.0,
    stock: 4,
    rating: 4.8,
    reviews: 15,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1616763355603-9755a640a287?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Monitor de exterior de 10.1 pulgadas con 1500 nits de brillo para lectura directa a plena luz del sol, frontal IP65 y proteccion UVA/UVB. Montaje en vehicle o poste para control de acceso vehicular.',
    features: [
      '10.1" con 1500 nits de brillo',
      'Frontal IP65 con cubierta de vidrio antirreflectante',
      'Rango de operacion -30C a 70C',
      'Alimentacion 9-36V DC para vehiculos',
      'Filtro UVA/UVB integrado',
    ],
  }),
  p({
    id: 'monitor-tablero-precios',
    sku: 'STK-MON-1006',
    name: 'Monitor Industrial 32" para Tablero de Precios Retail',
    category: 'monitores-industriales',
    brand: 'StarkVision',
    price: 449.0,
    compareAtPrice: 529.0,
    stock: 18,
    rating: 4.4,
    reviews: 36,
    image:
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616763355603-9755a640a287?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Pantalla LED de 32 pulgadas para digital signage y tableros de precios, con 24/7 de operacion, 500 nits, puerto RS232 para control remoto y consumo de 60W. Se instala en formato horizontal o vertical.',
    features: [
      '32" LED con 500 nits',
      'Operacion continua 24/7',
      'Control remoto via RS232',
      'Montaje horizontal o vertical (pivot 90 grados)',
      'Consumo energetico de solo 60W',
    ],
  }),
];
