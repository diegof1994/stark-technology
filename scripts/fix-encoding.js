/**
 * Corrige las lineas con texto mal codificado (mojibake) detectadas por
 * `scripts/scan-encoding.js`.
 *
 * El problema era un doble encode UTF-8 que dejo los simbolos y las tildes
 * como "â€¢" / "PodÃ©s". Aqui se reescriben con los caracteres correctos.
 */
import fs from 'node:fs';

const FIXES = [
  {
    file: 'client/src/pages/Admin.jsx',
    // Placeholder del token: 8 puntosbullet.
    search: /placeholder="[^"]*"/,
    replace: 'placeholder="••••••••"',
  },
  {
    file: 'client/src/pages/Catalog.jsx',
    // Separador del aviso de modo offline.
    search: /'[^']*modo offline \(cache local\)'/,
    replace: "' · modo offline (cache local)'",
  },
  {
    file: 'client/src/pages/SimulatedCheckout.jsx',
    // "PodÃ©s" -> "Puedes" (sin tilde, en linea con el resto del codigo).
    search: /Pod\S*s intentarlo/,
    replace: 'Puedes intentarlo',
  },
];

for (const { file, search, replace } of FIXES) {
  const text = fs.readFileSync(file, 'utf8');
  const next = text.replace(search, replace);
  if (next === text) {
    console.log(`SIN CAMBIO: ${file}`);
    continue;
  }
  fs.writeFileSync(file, next, 'utf8');
  console.log(`corregido: ${file}`);
}
