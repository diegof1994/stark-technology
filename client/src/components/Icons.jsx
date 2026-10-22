/**
 * Set de iconos SVG en linea (stroke-based) de Stark Technology.
 * Evitamos dependencias externas de iconos para mantener el bundle liviano.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Icon = ({ children, className = 'h-5 w-5', ...props }) => (
  <svg viewBox="0 0 24 24" {...base} className={className} {...props}>
    {children}
  </svg>
);

export const IconCctv = (props) => (
  <Icon {...props}>
    <path d="m3 9 2-5h8l2 5" />
    <path d="M7 9v3a5 5 0 0 0 5 5h1" />
    <path d="M17 9h4l-1.5 3" />
    <circle cx="16" cy="17" r="3" />
    <path d="m16 17 2.5-2.5" />
  </Icon>
);

/** Rayo: se usa en las piezas de "Oferta Flash". */
export const IconFlash = (props) => (
  <Icon {...props}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
  </Icon>
);

/** Reloj: cuenta regresiva de la oferta. */
export const IconClock = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Icon>
);

export const IconFingerprint = (props) => (
  <Icon {...props}>
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
  </Icon>
);

export const IconRouter = (props) => (
  <Icon {...props}>
    <rect x="2" y="13" width="20" height="8" rx="2" />
    <path d="M7 17h.01M11 17h.01" />
    <path d="M12 2v8" />
    <path d="m8 6 4-4 4 4" />
    <path d="M5 13V9M19 13V9" />
  </Icon>
);

export const IconHome = (props) => (
  <Icon {...props}>
    <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M9 21v-8h6v8" />
    <path d="M12 3v3" />
  </Icon>
);

export const IconDatabase = (props) => (
  <Icon {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </Icon>
);

export const IconCpu = (props) => (
  <Icon {...props}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </Icon>
);

export const IconGamepad = (props) => (
  <Icon {...props}>
    <path d="M6 12h4M8 10v4" />
    <circle cx="15" cy="11" r="1" />
    <circle cx="17.5" cy="13.5" r="1" />
    <path d="M17.5 5h-11A4.5 4.5 0 0 0 2 9.5v5A4.5 4.5 0 0 0 6.5 19c1.2 0 1.9-.6 2.5-1.2l.9-.8h4.2l.9.8c.6.6 1.3 1.2 2.5 1.2a4.5 4.5 0 0 0 4.5-4.5v-5A4.5 4.5 0 0 0 17.5 5Z" />
  </Icon>
);

export const IconBattery = (props) => (
  <Icon {...props}>
    <rect x="2" y="7" width="16" height="10" rx="2" />
    <path d="M22 11v2" />
    <path d="M6 10v4M10 10v4M14 10v4" />
  </Icon>
);

export const IconDrone = (props) => (
  <Icon {...props}>
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
    <path d="M9 9 5.5 5.5M15 9l3.5-3.5M9 15l-3.5 3.5M15 15l3.5 3.5" />
    <circle cx="4" cy="4" r="2" />
    <circle cx="20" cy="4" r="2" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
  </Icon>
);

export const IconMonitor = (props) => (
  <Icon {...props}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icon>
);

export const IconCart = (props) => (
  <Icon {...props}>
    <circle cx="9" cy="20" r="1.6" />
    <circle cx="18" cy="20" r="1.6" />
    <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L22 7H6" />
  </Icon>
);

export const IconSearch = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const IconClose = (props) => (
  <Icon {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

export const IconPlus = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconMinus = (props) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
);

export const IconTrash = (props) => (
  <Icon {...props}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export const IconEdit = (props) => (
  <Icon {...props}>
    <path d="M11 4H4v16h16v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </Icon>
);

export const IconStar = ({ className = 'h-4 w-4', filled = false, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z" />
  </svg>
);

export const IconShield = (props) => (
  <Icon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

export const IconTruck = (props) => (
  <Icon {...props}>
    <path d="M1 3h13v13H1z" />
    <path d="M14 8h4l3 3v5h-7z" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
  </Icon>
);

export const IconHeadset = (props) => (
  <Icon {...props}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <path d="M18 19a2 2 0 0 1-2 2h-3" />
    <rect x="2" y="13" width="4" height="6" rx="1.5" />
    <rect x="18" y="13" width="4" height="6" rx="1.5" />
  </Icon>
);

export const IconBolt = (props) => (
  <Icon {...props}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
  </Icon>
);

export const IconSun = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </Icon>
);

export const IconMoon = (props) => (
  <Icon {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Icon>
);

export const IconMenu = (props) => (
  <Icon {...props}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Icon>
);

export const IconArrowRight = (props) => (
  <Icon {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const IconFilter = (props) => (
  <Icon {...props}>
    <path d="M3 5h18l-7 8v6l-4 2v-8Z" />
  </Icon>
);

export const IconCheck = (props) => (
  <Icon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

export const IconAlert = (props) => (
  <Icon {...props}>
    <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </Icon>
);

export const IconMail = (props) => (
  <Icon {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </Icon>
);

export const IconImage = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.8" />
    <path d="m21 15-5-5L5 21" />
  </Icon>
);

export const IconSparkles = (props) => (
  <Icon {...props}>
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9Z" />
    <path d="M18 15.5 19 18l2.5 1-2.5 1-1 2.5-1-2.5L14.5 19l2.5-1Z" />
  </Icon>
);

export const IconLock = (props) => (
  <Icon {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const IconRefresh = (props) => (
  <Icon {...props}>
    <path d="M21 12a9 9 0 1 1-2.6-6.4" />
    <path d="M21 3v6h-6" />
  </Icon>
);

export const IconChart = (props) => (
  <Icon {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 15l3-4 3 3 5-7" />
  </Icon>
);

export const IconBox = (props) => (
  <Icon {...props}>
    <path d="m12 2 9 5v10l-9 5-9-5V7Z" />
    <path d="m3 7 9 5 9-5M12 12v10" />
  </Icon>
);

export const IconUser = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a7 7 0 0 1 16 0v1" />
  </Icon>
);

export const IconWhatsapp = (props) => (
  <Icon {...props}>
    <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.3-5.2A8.5 8.5 0 1 1 21 11.5Z" />
    <path d="M8.5 9.5c0 4 2 6 6 6" />
  </Icon>
);

export const IconInstagram = (props) => (
  <Icon {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </Icon>
);

export const IconGithub = (props) => (
  <Icon {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.7s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6.4 0C7.3 1 6.2 1.3 6.2 1.3A4.9 4.9 0 0 0 6.1 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
  </Icon>
);

/** Mapa de categoria -> icono, usado en la navegacion y filtros. */
export const CATEGORY_ICONS = {
  'camaras-seguridad': IconCctv,
  'control-acceso': IconFingerprint,
  'redes-conectividad': IconRouter,
  'smart-home': IconHome,
  'almacenamiento-nas': IconDatabase,
  'componentes-pc': IconCpu,
  'perifericos-gaming': IconGamepad,
  'energia-ups': IconBattery,
  'drones-monitoreo': IconDrone,
  'monitores-industriales': IconMonitor,
};

export default Icon;
