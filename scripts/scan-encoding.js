/**
 * Escanea el codigo fuente buscando texto mal codificado (mojibake).
 *
 * Detecta los signos typicalos de un doble encode UTF-8: acentos y simbolos
 * que aparecen como "Ã¡", "â€", "Â°", etc.
 *
 * Uso: node scripts/scan-encoding.js
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['client/src', 'server/src', 'client/index.html'];
const EXTENSIONS = new Set(['.js', '.jsx', '.css', '.html', '.json', '.md']);

/** Firmas tipicas de doble encode UTF-8. */
const SIGNATURES = [
  'â€', // " -> mojibake de comillas/guiones
  'Ã¡', // a con tilde
  'Ã©', // e con tilde
  'Ã­', // i con tilde
  'Ã³', // o con tilde
  'Ãº', // u con tilde
  'Ã±', // n con tilde
  'Â°', // grado
  'Â·', // punto medio
  'ï¿½', // BOM utf-8
  'ð\x9f', // emoji
];

/** Archivos a revisar (omite node_modules, dist, .git). */
function collect(target, files = []) {
  if (!fs.existsSync(target)) return files;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(target))) files.push(target);
    return files;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '.vite'].includes(entry.name)) continue;
    collect(path.join(target, entry.name), files);
  }
  return files;
}

const files = ROOTS.flatMap((root) => collect(root));
let total = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    const found = SIGNATURES.filter((sig) => line.includes(sig));
    if (found.length) {
      total += 1;
      const preview = line.trim().slice(0, 120);
      console.log(`${file}:${index + 1}  [${found.join(', ')}]  ${preview}`);
    }
  });
}

console.log(`\n${total} lineas con mojibake en ${files.length} archivos revisados.`);
process.exitCode = total > 0 ? 1 : 0;
