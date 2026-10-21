/**
 * Imagen de respaldo (data URI) para cuando la foto remota del producto
 * no carga o el producto no tiene imagen asignada.
 * Es un SVG inline: no requiere red y siempre esta disponible.
 */
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#241f16"/>
          <stop offset="100%" stop-color="#12100c"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#g)"/>
      <g fill="none" stroke="#ff9f1c" stroke-width="2" opacity="0.5">
        <circle cx="300" cy="200" r="52"/>
        <path d="M300 148a52 52 0 0 1 45 78"/>
        <circle cx="300" cy="200" r="10" fill="#ff9f1c" stroke="none"/>
      </g>
      <text x="300" y="300" fill="#ff9f1c" font-family="monospace" font-size="16"
        text-anchor="middle" opacity="0.8">STARK TECH</text>
    </svg>`,
  );

/**
 * Devuelve la URL de imagen a renderizar, aplicando el fallback si viene vacia.
 * @param {string} image
 */
export const safeImage = (image) => (image && image.trim() ? image : FALLBACK_IMAGE);

export default FALLBACK_IMAGE;
