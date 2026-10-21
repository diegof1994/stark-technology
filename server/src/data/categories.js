/**
 * Categorias (rubros) de la tienda Stark Technology.
 * Cada rubro tiene su icono, color de acento y una imagen de portada real.
 */
export const CATEGORIES = [
  {
    id: 'camaras-seguridad',
    label: 'Camaras de Seguridad IP / CCTV',
    shortLabel: 'Camaras IP / CCTV',
    icon: 'cctv',
    accent: 'cyan',
    cover:
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=70',
    description:
      'Camaras IP, NVR/DVR, kit de videovigilancia 4K, PTZ motorizadas y camaras bullet/domo con vision nocturna.',
  },
  {
    id: 'control-acceso',
    label: 'Control de Acceso y Biometria',
    shortLabel: 'Control de Acceso',
    icon: 'fingerprint',
    accent: 'violet',
    cover:
      'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=70',
    description:
      'Lectoras biometricas, cerraduras inteligentes, controles de presencia, videoporteros y sistemas RFID para empresas.',
  },
  {
    id: 'redes-conectividad',
    label: 'Redes y Conectividad',
    shortLabel: 'Redes',
    icon: 'router',
    accent: 'emerald',
    cover:
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=70',
    description:
      'Routers Wi-Fi 6/6E, switches gestionables, access points, cables de red, Power over Ethernet y mesh.',
  },
  {
    id: 'smart-home',
    label: 'Smart Home y Domotica',
    shortLabel: 'Smart Home',
    icon: 'home',
    accent: 'sky',
    cover:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=70',
    description:
      'Hub domotico, bombillas y tiras LED, termostatos, cerraduras, sensores y aspiradoras robotizadas.',
  },
  {
    id: 'almacenamiento-nas',
    label: 'Almacenamiento y NAS',
    shortLabel: 'NAS y Storage',
    icon: 'database',
    accent: 'amber',
    cover:
      'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=800&q=70',
    description:
      'Servidores NAS, discos duros enterprise, SSD NVMe, bahias de rack, memorias y soluciones de backup redundante.',
  },
  {
    id: 'componentes-pc',
    label: 'Componentes de PC High-End',
    shortLabel: 'Componentes PC',
    icon: 'cpu',
    accent: 'red',
    cover:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=70',
    description:
      'Procesadores AM5/LGA1700, GPUs de ultima generacion, motherboards, RAM DDR5, fuentes y refrigeración liquida.',
  },
  {
    id: 'perifericos-gaming',
    label: 'Perifericos Gaming',
    shortLabel: 'Perifericos Gaming',
    icon: 'gamepad',
    accent: 'fuchsia',
    cover:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=70',
    description:
      'Mouse, teclados mecanicos, audífonos, monitores, controles y sillas gamer de alto rendimiento.',
  },
  {
    id: 'energia-ups',
    label: 'Energia y Respaldo UPS',
    shortLabel: 'Energia y UPS',
    icon: 'battery',
    accent: 'lime',
    cover:
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?auto=format&fit=crop&w=800&q=70',
    description:
      'UPS online, tecnologia Line Interactive, paneles solares, estabilizadores y baterias de litio.',
  },
  {
    id: 'drones-monitoreo',
    label: 'Drones de Monitoreo',
    shortLabel: 'Drones',
    icon: 'drone',
    accent: 'teal',
    cover:
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=70',
    description:
      'Drones de inspeccion termica, camaras aerias, estabilizadores gimbal y accesorios de proteccion.',
  },
  {
    id: 'monitores-industriales',
    label: 'Monitores Industriales',
    shortLabel: 'Monitores',
    icon: 'monitor',
    accent: 'blue',
    cover:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=70',
    description:
      'Monitores industriales IP65, pantallas de videovigilancia, paneles táctiles y displays de alta luminosidad.',
  },
];

/** Devuelve la etiqueta legible de una categoria a partir de su id. */
export const getCategoryLabel = (id) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;
